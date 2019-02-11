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

  11 February 2019

*/

'use strict';

const { logger } = require('../core');
const { byNhsNumber, byPatientUuid } = require('./mixins/bundle');

class BundleCache {
  constructor(adapter) {
    this.adapter = adapter;
    this.byNhsNumber = byNhsNumber(adapter, 'PatientBundle');
    this.byPatientUuid = byPatientUuid(adapter, 'PatientBundle');
  }

  static create(adapter) {
    return new BundleCache(adapter);
  }

  /**
   * Checks if bundle exists or not
   *
   * @return {bool}
   */
  async exists() {
    logger.info('cache/bundleCache|exists');

    const key = ['Discovery', 'PatientBundle'];

    return this.adapter.exists(key);
  }

  /**
   * Imports data to bundle
   *
   * @param  {Object} data
   * @return {void}
   */
  async import(data) {
    logger.info('cache/bundleCache|import', data);

    const key = ['Discovery', 'PatientBundle'];
    this.adapter.putObject(key, data);
  }
}

module.exports = BundleCache;
