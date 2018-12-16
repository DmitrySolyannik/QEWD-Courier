/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  16 December 2018

*/

'use strict';

const P = require('bluebird');
const { logger } = require('../core');
const { buildSourceId } = require('../shared/utils');
const debug = require('debug')('ripple-cdr-openehr:services:discovery');

class DiscoveryService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new DiscoveryService(ctx);
  }

  /**
   * Merges discovery data
   *
   * @param  {string|int} patientId
   * @param  {string} heading
   * @param  {Object[]} data
   * @return {Promise.<bool>}
   */
  async mergeAll(patientId, heading, data) {
    logger.info('services/discoveryService|mergeAll', { patientId, heading, data });

    // before we start the processing loop, obtain an OpenEHR session and ensure an ehrId exists
    // this ensures it's available for each iteration of the loop instead of each
    // iteration creating a new one

    const { patientService, ehrSessionService } = this.ctx.services;
    const host = this.ctx.defaultHost;

    const ehrSession = await ehrSessionService.start(host);
    await patientService.getEhrId(host, ehrSession.id, patientId);

    // The posts are serialised - only one at a time, and the next one isn't sent till the
    // previous one gets a response from OpenEHR - so as not to flood the OpenEHR system with POSTs
    const results = await P.mapSeries(data, x => this.merge(patientId, heading, x));

    return results.some(x => x);
  }

  /**
   * Merges a single discovery item
   *
   * @param  {string} host
   * @param  {string|int} patientId
   * @param  {string} heading
   * @param  {Object} item
   * @return {Promise.<bool>}
   */
  async merge(host, patientId, heading, item) {
    logger.info('services/discoveryService|merge', { host, patientId, heading, item });

    const discoverySourceId = item.sourceId;

    const { discoveryDb } = this.ctx.db;
    const found = await discoveryDb.getSourceIdByDiscoverySourceId(discoverySourceId);
    if (found) return false;

    let result = null;
    debug('discovery record %s needs to be added to %s', discoverySourceId, host);

    try {
      const data = {
        data: item,
        format: 'pulsetile',
        source: 'GP'
      };

      const { headingService } = this.ctx.services;
      const response = await headingService.create(patientId, heading, data);
      debug('response: %j', response);

      const sourceId = buildSourceId(host, response.compositionUid);
      debug('openehr sourceId: %s', sourceId);

      const dbData = {
        discovery: discoverySourceId,
        openehr: response.compositionUid,
        patientId: patientId,
        heading: heading
      };

      await discoveryDb.insert(discoverySourceId, sourceId, dbData);

      result = true;
    } catch (err) {
      logger.error('services/discoveryService|merge|err', err, discoverySourceId);
      result = false;
    }

    return result;
  }

  async delete(sourceId) {
    logger.info('services/discoveryService|delete', { sourceId });

    //TODO:
    //var discovery_map = this.db.use('DiscoveryMap');
    // if (!discovery_map.exists) return;

    const { discoveryDb } = this.ctx.db;
    const dbData = await discoveryDb.getBySourceId(sourceId);

    if (dbData) {
      await discoveryDb.delete(dbData.discovery, sourceId);
    }
  }
}

module.exports = DiscoveryService;
