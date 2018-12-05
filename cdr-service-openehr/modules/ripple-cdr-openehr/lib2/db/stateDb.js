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

class StateDb() {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new StateDb(ctx);
  }

  async get() {
    const { qewdSession } = this.ctx;

    if (qewdSession.data.$('record_status').exists) {
      return qewdSession.data.$('record_status').getDocument();
    }

    return null;
  }

  async insert(state) {
    const { qewdSession } = this.ctx;
    qewdSession.data.$('record_status').setDocument(state);
  }

  async update(state) {
    const { qewdSession } = this.ctx;
    qewdSession.data.$('record_status').setDocument(state);
  }
}

module.exports = StateDb;