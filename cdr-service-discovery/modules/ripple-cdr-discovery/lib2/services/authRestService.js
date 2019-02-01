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

  12 January 2019

*/

'use strict';

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

class AuthRestService {
  constructor(ctx, hostConfig) {
    this.ctx = ctx;
    this.hostConfig = hostConfig;
  }

  static create(ctx) {
    return new AuthRestService(ctx, ctx.serversConfig.auth);
  }

  async authenticate() {
    debug('authenticate');

    const options = {
      url: `${this.hostConfig.host + this.hostConfig.path}`,
      method: 'POST',
      form: {
        username: this.hostConfig.username,
        password: this.hostConfig.password,
        client_id: this.hostConfig.client_id,
        grant_type: this.hostConfig.grant_type
      },
      json: true
    };

    return requestAsync(options);
  }
}

module.exports = AuthRestService;
