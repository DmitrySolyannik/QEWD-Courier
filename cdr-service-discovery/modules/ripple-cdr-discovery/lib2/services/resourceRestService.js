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
const config = require('../config');
const request = require('request');
const debug = require('debug')('ripple-cdr-discovery:services:resource-rest');

function requestAsync(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err) return reject(err);

      return resolve(body);
    });
  });
}

class ResourceRestService {
  constructor(ctx, hostConfig) {
    this.ctx = ctx;
    this.hostConfig = hostConfig;
  }

  static create(ctx) {
    return new ResourceRestService(ctx, config.hosts.api);
  }

  async getPatients(patientId, token) {
    logger.info('services/resourceRestService|getPatients', { patientId, token: typeof token });

    debug('token: %s', token);

    const options = {
      url: `${this.hostConfig.host}/api/fhir/patients`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      qs: {
        nhsNumber: patientId
      },
      json: true
    };

    return requestAsync(options);
  }

  async getPatientResources(patientId, data, token) {
    logger.info('services/resourceRestService|getPatientResources', { patientId, data: typeof data, token: typeof token });

    debug('data: %j', data);
    debug('token: %s', token);

    const options = {
      url: `${this.hostConfig.host}/api/fhir/resources`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: data,
      json: true
    };

    return requestAsync(options);
  }

  async getResource(reference, token) {
    logger.info('services/resourceRestService|getResource', { reference, token: typeof token });

    debug('token: %s', token);

    const options = {
      url: `${this.hostConfig.host}/api/fhir/reference`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      },
      qs: {
        reference: reference
      },
      json: true
    };

    //TODO:make sure that body === '' handled in getResource

    return requestAsync(options);
  }
}

module.exports = ResourceRestService;
