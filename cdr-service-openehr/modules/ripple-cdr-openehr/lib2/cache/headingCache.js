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

const { logger } = require('../core');

class HeadingCache {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new HeadingCache(ctx);
  }

  async exists(patientId, heading, host) {
    logger.info('cache/headingCache|getByIds', { patientId, heading, host });

    const key = ['headings', 'byPatientId', patientId, heading, 'byHost'];

    return this.ctx.cache.exists(key);
  }

  async getBySourceId(sourceId) {
    logger.info('cache/headingCache|getBySourceId', { sourceId });

    const key = ['headings', 'bySourceId', sourceId];

    return this.ctx.cache.getObject(key);
  }

  async setByDate(patientId, heading, sourceId, date) {
    logger.info('cache/headingCache|setByDate', { patientId, heading, sourceId, date });

    const key = ['headings', 'byPatientId', patientId, heading, 'byDate', date, sourceId];
    this.ctx.cache.put(key, 'true');
  }

  async setByHost(patientId, heading, sourceId, host) {
    logger.info('cache/headingCache|setByHost', { patientId, heading, sourceId, host });

    const key = ['headings', 'byPatientId', patientId, heading, 'byHost', host, sourceId];
    this.ctx.cache.put(key, 'true');
  }

  async setBySourceId(sourceId, data) {
    logger.info('cache/headingCache|setBySourceId', { sourceId, data });

    const key = ['headings', 'bySourceId', sourceId];
    this.ctx.cache.putObject(key, data);
  }

  async deleteByDate(patientId, heading, sourceId, date) {
    logger.info('cache/headingCache|deleteByDate', { patientId, heading, sourceId, date });

    const key = ['headings', 'byPatientId', patientId, heading, 'byDate', date, sourceId];
    this.ctx.cache.delete(key);
  }

  async deleteByHeading(heading, sourceId) {
    logger.info('cache/headingCache|deleteByHeading', { heading, sourceId });

    const key = ['headings', 'ByHeading', heading, sourceId];
    this.ctx.cache.delete(key);
  }

  async deleteByHost(patientId, heading, sourceId, host) {
    logger.info('cache/headingCache|deleteByHost', { patientId, heading, sourceId, host });

    const key = ['headings', 'byPatientId', patientId, heading, 'byHost', host, sourceId];
    this.ctx.cache.delete(key);
  }

  async deleteBySourceId(sourceId) {
    logger.info('cache/headingCache|deleteBySourceId', { sourceId });

    const key = ['headings', 'bySourceId', sourceId];
    this.ctx.cache.delete(key);
  }
}

module.exports = HeadingCache;
