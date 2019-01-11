/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-19 Ripple Foundation Community Interest Company       |
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

  2 January 2019

*/

'use strict';

const { logger } = require('../core');
const { byUuid, byOrganization, byLocation } = require('./mixins/practitioner');

class DemographicsCache {
  constructor(adapter) {
    this.adapter = adapter;
    this.byUuid = byUuid(adapter, 'Practitioner', 'demographicsCache');
    this.byOrganization = byOrganization(adapter, 'Organization', 'demographicsCache');
    this.byLocation = byLocation(adapter, 'Location', 'demographicsCache');
  }

  static create(adapter) {
    return new DemographicsCache(adapter);
  }

  async exists(nhsNumber) {
    logger.info('cache/demographicsCache|exists', { nhsNumber });

    const key = ['Demographics', 'by_nhsNumber', nhsNumber];

    return this.adapter.exists(key);
  }

  async getObject(nhsNumber) {
    logger.info('cache/demographicsCache|getObject', { nhsNumber });

    const key = ['Demographics', 'by_nhsNumber', nhsNumber];

    return this.adapter.getObjectWithArrays(key);
  }

  async set(nhsNumber, data) {
    logger.info('cache/demographicsCache|set', { nhsNumber });

    const key = ['Demographics', 'by_nhsNumber', nhsNumber];

    return this.adapter.putObject(key, data);
  }

  async delete() {
    logger.info('cache/demographicsCache|delete');

    const key = ['Discovery'];

    return this.adapter.delete(key);
  }
}

module.exports = DemographicsCache;
