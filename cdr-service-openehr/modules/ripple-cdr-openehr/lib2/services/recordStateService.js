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

const debug = require('debug')('ripple-cdr-openehr:services:record-state');

class RecordStateService {
  constructor(ctx) {
    this.ctx = ctx;
    this.recordStateDb = ctx.db.recordStateDb;
  }

  static create(ctx) {
    return new RecordStateService(ctx);
  }

  /**
   * Gets record state by patient id
   *
   * @param  {string|int} patientId
   * @return {Promise.<Object>}
   */
  async getByPatientId(patientId) {
    debug('get state for %s patient', patientId);

    return await this.recordStateDb.get(patientId);
  }

  /**
   * Creates record state for patient id
   *
   * @param  {string|int} patientId
   * @param  {Object} state
   * @return {Promise}
   */
  async create(patientId, state) {
    debug('create state for %s patient with data %j ', patientId, state);
    await this.recordStateDb.insert(patientId, state);
  }

  /**
   * Updates existing record state for patient id
   *
   * @param  {string|int} patientId
   * @param  {Object} state
   * @return {Promise}
   */
  async update(patientId, state) {
    debug('update state for %s patient with data %j', patientId, state);
    await this.recordStateDb.update(patientId, state);
  }
}

module.exports = RecordStateService;
