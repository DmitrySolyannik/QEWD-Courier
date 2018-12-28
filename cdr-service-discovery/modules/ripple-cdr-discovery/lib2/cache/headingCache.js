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

  18 December 2018

*/

'use strict';

const { logger } = require('../core');

class headingCache {
  constructor(adapter) {
    this.adapter = adapter;
  }

  static create(adapter) {
    return new headingCache(adapter);
  }

  /**
   * Gets status
   *
   * @return {Promise.<Object|null>}
   */
  async get() {
    logger.info('cache/headingCache|get');

    const key = ['Discovery', 'Patient'];

    return this.adapter.getObject(key);
  }

  async getResource() {
    logger.info('cache/headingCache|getResource');

    const key = ['Discovery', 'Patient'];

    return;
  }

  /**
   * Sets status
   *
   * @param  {Object} data
   * @return {Promise}
   */
  async set(data) {
    logger.info('cache/headingCache|set', { data });

    const key = ['Discovery', 'Patient'];
    this.adapter.putObject(key, data);
  }

  /**
   * Deletes a session for a host
   *
   * @param  {string} host
   * @return {Promise}
   */
  async delete() {
    logger.info('cache/headingCache|delete');

    const key = ['Discovery', 'Patient'];
    this.adapter.delete(key);
  }
}

module.exports = headingCache;
