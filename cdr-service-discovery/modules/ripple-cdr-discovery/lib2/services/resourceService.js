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

  15 December 2018

*/

'use strict';

const {logger} = require('../core');
// const debug = require('debug')('ripple-cdr-discove:services:patient');
const credentials = require('../config/credentials');
const config = require('../config');
const request = require('request');


class ResourceService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new ResourceService(ctx);
  }

  /**
   *
   * @param {string | int} patientId
   * @param {string} token
   * @return Promise
   */
  async fetchPatients(patientId, token) {
    logger.info('services/resourceService|getPatients', {patientId});

    const {patientCache} = this.ctx.cache;
    const exists = patientCache.byPatientId.exists(patientId);
    if (!exists) return false;

    const { resourcesRestService } = this.ctx.services;
    //@TODO think about resourceService.fetchPatients
    try {
      const patient = await resourcesRestService.getPatients(patientId, token);
      const filteredPatients = patient.filter(p => patientCache.byPatientId.exists(p.resource.patient.id));
      patientCache.insertBulk(filteredPatients);
    } catch(err) {
      throw err;
    }
  }

  //@TODO think about name
  /**
   *
   * @param {string | number} patientId
   * @param {Object} resource
   * @param {string} token
   * @returns {Promise<*>}
   */
  async fetchPatientResources(patientId, resource, token) {
    logger.info('services/resourceService|getPatientResources', {patientId, resource});

    const { patientCache } = this.ctx.cache;
    const existsByResource = patientCache.byResource.exists(patientId, resource);
    if (!existsByResource) return false;

    const data = {
      resource: [resource],
      patients: {
        resourceType: 'Bundle',
        entry: []
      }
    };
    const { resourcesRestService } = this.ctx.services;
    //@TODO think about resourceService.fetchPatientResources
    const existsByBundle = patientCache.byPatientBundle.exists();
    const patientBundle = patientCache.getPatientBundleCache(existsByBundle);

    patientBundle.forEach(uuid => {
        //@TODO How can I get nesting in cache (Create new cache or mixin?)
      //@TODO push not uuid , but patients by uuid
      data.patients.entry.push({
        resource: uuid
      });
    });

    const response = await resourcesRestService.getPatientResources(patientId, data, token);
    //@TODO send data to patientCache by resource
  }
}

module.exports = ResourceService;
