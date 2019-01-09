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
const { byNhsNumber, byUuid, byResource } = require('./mixins/patient');

class PatientCache {
  constructor(adapter) {
    this.adapter = adapter;
    this.byNhsNumber = byNhsNumber(adapter);
    this.byUuid = byUuid(adapter);
    this.byResource = byResource(adapter);
  }

  static create(adapter) {
    return new PatientCache(adapter);
  }

  /**
   * Get cache
   * @param {string[]} key
   * @return {Promise.<Object|null>}
   */
  async get(key = ['Discovery']) {
    logger.info('cache/patientCache|get');

    return this.adapter.getObject(key);
  }

  /**
   *
   * @param {string[]} key
   * @returns {Promise<Promise<*>|*>}
   */
  async getObjectWithArrays(key) {
    logger.info('cache/patientCache|getObjectWithArrays');

    return this.adapter.getObjectWithArrays(key);
  }

  /**
   * Sets cache
   *
   * @param  {Object} data
   * @param  {string[]} key
   * @return {Promise}
   */
  async set(data, key = ['Discovery']) {
    logger.info('cache/patientCache|set', { data });

    this.adapter.putObject(key, data);
  }

  /**
   * Deletes a session for a host
   *
   * @param {string[]} key
   * @return {Promise}
   */
  async delete(key = ['Discovery']) {
    logger.info('cache/patientCache|delete');

    this.adapter.delete(key);
  }

  /**
   * Overwrite person data in cache
   * @param {string} resource
   * @returns {Promise<void>}
   */
  async overwriteCache(resource) {
    logger.info('cache/patientCache|overwriteCache');

    if (resource === 'Patient') {
      const key = ['Discovery', 'PatientBundle'];

      await this.set(this.getPatientBundleCache(false), key);
      const deleteKey = ['Discovery', resource, 'by_uuid'];
      await this.delete(deleteKey);
    }
  }

  /**
   *
   * @param {boolean} exists
   * @returns {Promise<Promise<*>|*>}
   */
  async getPatientBundleCache(exists) {
    logger.info('cache/patientCache|getPatientBundleCache');

    const key = exists ? ['Discovery', 'PatientBundle'] : ['Discovery', 'Patient'];

    return this.adapter.getObjectWithArrays(key);
  }

  /**
   *
   * @param {boolean} exists
   * @param {string} nhsNumber
   * @returns {Promise<{patients: Promise<*>|*, key: string[]}>}
   */
  async getPatientBundleWithNHSNumber(exists, nhsNumber) {
    logger.info('cache/patientCache|getPatientBundleCache');

    const initKey = exists ? ['Discovery', 'PatientBundle'] : ['Discovery', 'Patient'];
    const key = [...initKey, 'by_nhsNumber', nhsNumber, 'Patient'];

    return {
      patients: this.adapter.getObjectWithArrays(key),
      key: initKey
    };
  }

  /**
   *
   * @param uuid
   * @returns {Promise<void>}
   */
  async getPatientByUuid(uuid) {
    logger.info('cache/patientCache|getPatientByUuid');

    const key = ['Discovery', 'Patient', 'by_uuid', uuid];

    return this.adapter.get(key);
  }

  async export() {
    logger.info('cache/patientCache|export');

    const key = ['Discovery', 'Patient'];

    return this.adapter.getObjectWithArrays(key);
  }
}

module.exports = PatientCache;
