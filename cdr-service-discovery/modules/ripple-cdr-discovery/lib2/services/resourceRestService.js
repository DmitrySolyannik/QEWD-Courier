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

function requestAsync(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err) return reject(err);

      return resolve(body);
    });
  });
}

class ResourceRestService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new ResourceRestService(ctx);
  }

  async getPatients(patientId, token) {
    //@TODO change credentials config
    const params = {
      url: credentials.patientByNHSNumber.url,
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token
      },
      qs: {
        nhsNumber: patientId
      },
      json: true
    };
    return requestAsync(params)
  }

  async getPatientResources(patientId, data , token) {
    //@TODO change credentials config
    //@TODO think about change request structure
    const params = {
      url: credentials.getPatientResources.url,
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + token
      },
      body: data,
      json: true
    };
    return requestAsync(params)
  }

  async getResources() {

  }
}

module.exports = ResourceRestService;
