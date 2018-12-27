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
const { byPatientId, byResource, byPatientBundle } = require('./mixins');

class PatientCache {
  constructor(adapter) {
    this.adapter = adapter;
    this.byPatientId = byPatientId(adapter);
    this.byResource = byResource(adapter);
    this.byPatientBundle = byPatientBundle(adapter);
  }

  static create(adapter) {
    return new PatientCache(adapter);
  }

  /**
   * Gets status
   *
   * @return {Promise.<Object|null>}
   */
  async get(key = 'Discovery') {
    logger.info('cache/patientCache|get');

    return this.adapter.getObject(key);
  }

  async getObjectWithArrays(key) {
    logger.info('cache/patientCache|getObjectWithArrays');

    return this.adapter.getObjectWithArrays(key);
  }

  /**
   * Sets status
   *
   * @param  {Object} data
   * @param  {string} key
   * @return {Promise}
   */
  async set(data, key = 'Discovery') {
    logger.info('cache/patientCache|set', { data });

    this.adapter.putObject(key, data);
  }

  /**
   * Deletes a session for a host
   *
   * @return {Promise}
   */
  async delete() {
    logger.info('cache/patientCache|delete');

    const key = ['discoveryToken'];
    this.adapter.delete(key);
  }

  insertBulk(arrValues, key) {
    //@TODO in progress
    logger.info('cache/patientCache|insertBulk');
    arrValues.forEach(v => {
      this.adapter.set(v, key);
    })
  }
  getPatientBundleCache(exists) {
    const key = exists ? ['Discovery', 'PatientBundle'] : ['Discovery', 'Patient'];

    this.adapter.get(key);
  }
}

module.exports = PatientCache;
