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

  14 December 2018

*/

'use strict';

const request = require('request');
const config = require('../config');
const debug = require('debug')('ripple-cdr-openehr:services:ehr-rest');

function requestAsync(options) {
  return new Promise((resolve, reject) => {
    request(options, (err, response, body) => {
      if (err) return reject(err);

      return resolve(body);
    });
  });
}

class EhrRestService {
  constructor(ctx, host, hostConfig) {
    this.ctx = ctx;
    this.host = host;
    this.hostConfig = hostConfig;
  }

  async startSession() {
    debug('start session');

    const options = {
      url: `${this.hostConfig.url}/rest/v1/session`,
      method: 'POST',
      qs: {
        username: this.hostConfig.username,
        password: this.hostConfig.password
      },
      headers: {
        'x-max-session': config.openehr.sessionMaxNumber,
        'x-session-timeout': config.openehr.sessionTimeout
      },
      json: true
    };

    return await requestAsync(options);
  }

  async stopSession(ehrSessionId) {
    debug('stop session: %s', ehrSessionId);

    const options = {
      url: `${this.hostConfig.url}/rest/v1/session`,
      method: 'DELETE',
      headers: {
        'ehr-session': ehrSessionId
      },
      json: true
    };

    return await requestAsync(options);
  }

  async getEhr(ehrSessionId, nhsNumber) {
    debug('get ehr: sessionId = %s, nhsNumber = %s', ehrSessionId, nhsNumber);

    const options = {
      url: `${this.hostConfig.url}/rest/v1/ehr`,
      method: 'GET',
      qs: {
        subjectId: nhsNumber,
        subjectNamespace: 'uk.nhs.nhs_number'
      },
      headers: {
        'ehr-session': ehrSessionId
      },
      json: true
    };

    return await requestAsync(options);
  }

  async createEhr(ehrSessionId, nhsNumber) {
    debug('create ehr: sessionId = %s, nhsNumber = %s', ehrSessionId, nhsNumber);

    const options = {
      url: `${this.hostConfig.url}/rest/v1/ehr`,
      method: 'POST',
      qs: {
        subjectId: nhsNumber,
        subjectNamespace: 'uk.nhs.nhs_number'
      },
      body: {
        subjectId: nhsNumber,
        subjectNamespace: 'uk.nhs.nhs_number',
        queryable: 'true',
        modifiable: 'true'
      },
      headers: {
        'ehr-session': ehrSessionId
      },
      json: true
    };

    return await requestAsync(options);
  }
}

module.exports = EhrRestService;
