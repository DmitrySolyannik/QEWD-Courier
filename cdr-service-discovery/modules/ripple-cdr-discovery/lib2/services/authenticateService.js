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

class AuthenticateService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new AuthenticateService(ctx);
  }

  /**
   *
   * @returns {Promise<string>}
   */
  async getToken() {
    const { authCache } = this.ctx.cache;
    const now = Date.now();

    const auth = await authCache.get();
    if (auth) {
      if ((now - auth.createdAt) < config.auth.tokenTimeout) {
        return auth.jwt;
      }
    }

    const { authRestService } = this.ctx.services;
    try {
      const data = await authRestService.authenticate();
      await authCache.set({
        jwt: data.access_token,
        createdAt: now
      });

      return data.access_token;
    } catch (err) {
      logger.error('authenticate/login|err: ' + err.message);
      logger.error('authenticate/login|stack: ' + err.stack);
      await authCache.delete();
      throw err;
    }
  }

}

module.exports = AuthenticateService;
