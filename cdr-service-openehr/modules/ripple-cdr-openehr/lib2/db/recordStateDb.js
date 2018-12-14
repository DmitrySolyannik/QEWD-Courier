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

const debug = require('debug')('ripple-cdr-openehr:db:record-state');

class RecordStateDb {
  constructor(ctx) {
    this.ctx = ctx;
    this.qewdSession = this.ctx.qewdSession;
  }

  static create(ctx) {
    return new RecordStateDb(ctx);
  }

  /**
   * Gets record state by patient id
   *
   * @param  {string|int} patientId
   * @return {Promise.<Object|null>}
   */
  async get(patientId) {
    debug('gets record state by patient id %s', patientId);
    const node = this.qewdSession.data.$('record_status');

    return node.exists ?
      node.getDocument() :
      null;
  }

  /**
   * Inserts a new record state by patient id
   *
   * @param  {string|int} patientId
   * @param  {Object} recordState
   * @return {Promise.<Object|null>}
   */
  async insert(patientId, recordState) {
    debug('inserts a new record state %j for patient id %s', recordState, patientId);
    this.qewdSession.data.$('record_status').setDocument(recordState);
  }

  /**
   * Updates an existing record state by patient id
   *
   * @param  {string|int} patientId
   * @param  {Object} recordState
   * @return {Promise.<Object|null>}
   */
  async update(patientId, recordState) {
    debug('updates record state %j for patient id %s', recordState, patientId);
    this.qewdSession.data.$('record_status').setDocument(recordState);
  }
}

module.exports = RecordStateDb;
