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

  5 December 2018

*/

'use strict';

const { handleResponse } = require('../shared/utils');
const debug = require('debug')('ripple-cdr-openehr:services:discovery');

class DiscoveryService {
  constructor(q) {
    this.q = q;
  }

  /**
   * Get discovery data
   *
   * @private
   * @param  {int|string} patientId
   * @param  {string} heading
   * @param  {string} jwt
   * @return {Promise.<Object>}
   */
  getDiscoveryData(patientId, heading, jwt) {
    debug('get discovery data: patientId = %s, heading = %s', patientId, heading);

    return new Promise((resolve, reject) => {
      if (heading === 'finished') {
        return resolve({
          message: {
            status: 'complete',
            results: []
          }
        });
      }

      const message = {
        path: `/api/discovery/${patientId}/${heading}`,
        method: 'GET',
        headers: {
          authorization: `Bearer ${jwt}`
        }
      };

      debug('message: %j', message);

      this.q.microServiceRouter.call(this.q, message, (responseObj) => {
        debug('handle response from micro service: patientId = %s, heading = %s, responseObj = %j', patientId, heading, responseObj);
        handleResponse(responseObj, resolve, reject);
      });
    });
  }

  /**
   * Merge discovery data in worker process
   *
   * @private
   * @param  {int|string} patientId
   * @param  {Object} data
   * @param  {string} jwt
   * @return {Promise.<Object>}
   */
  mergeDiscoveryData(patientId, data, jwt) {
    debug('merge discovery data: heading = %s, data = %j', patientId, data);

    return new Promise((resolve, reject) => {
      const token = this.q.jwt.handlers.getProperty('uid', jwt);
      const messageObj = {
        application: 'ripple-cdr-openehr',
        type: 'restRequest',
        path: `/discovery/merge/${heading}`,
        pathTemplate: '/discovery/merge/:heading',
        method: 'GET',
        headers: {
          authorization: `Bearer ${jwt}`
        },
        args: {
          heading: heading
        },
        data: data,
        token: token
      };

      debug('message: %j', message);

      this.q.handleMessage(messageObj, (responseObj) => {
        // heading has been merged into EtherCIS
        handleResponse(responseObj, resolve, reject);
      });
    });
  }

  /**
   * Sync heading data with discovery service
   *
   * @public
   * @param  {int|string} patientId
   * @param  {string} heading
   * @param  {string} jwt
   * @return {Promise}
   */
  async sync(patientId, heading, jwt) {
    debug('sync: patientId = %s, heading = %s', patientId, heading);

    try {
      const discoveryData = await this.getDiscoveryData(patientId, heading, jwt);
      await this.mergeDiscoveryData(heading, discoveryData, jwt)
    } catch (err) {
      debug('sync|err: %j', err);
    }
  }

  /**
   * Sync all headings data with discovery service
   *
   * @public
   * @param  {int|string} patientId
   * @param  {string[]} headings
   * @param  {string} jwt
   * @return {Promise}
   */
  async syncAll(patientId, headings, jwt) {
    debug('syncAll: patientId = %s, headings = %j', patientId, headings);

    await Promise.all(headings.map((heading) => this.sync(patientId, heading, jwt)));

    debug('discovery data loaded into EtherCIS');
  }
}

module.exports = DiscoveryService;
