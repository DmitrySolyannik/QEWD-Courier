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

  5 December 2018

*/

'use strict';

const debug = require('debug')('ripple-cdr-openehr:services:sync');

class SyncService() {
  constructor(ctx) {
    this.ctx = ctx;
    this.stateDb = ctx.db.stateDb;
  }

  static create(ctx) {
    return new SyncService(ctx);
  }

  async getState(patientId) {
    debug('get state for %s patient', patientId);

    return await this.stateDb.get();
  }

  async createState(patientId, state) {
    debug('create state for %s patient with data %j ', patientId, state);
    await this.stateDb.insert(state);
  }

  async updateState(patientId, state) {
    debug('update state for %s patient with data %j', patientId, state);
    await this.stateDb.update(state);
  }
}

module.exports = SyncService;
