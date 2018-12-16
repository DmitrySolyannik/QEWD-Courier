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

  16 December 2018

*/

'use strict';

const { logger } = require('../core');

class NhsNumberDb {
  constructor(ctx) {
    this.ctx = ctx;
    this.nhsNoMap = ctx.worker.db.use('RippleNHSNoMap');
  }

  static create(ctx) {
    return new NhsNumberDb(ctx);
  }

  async getEhrId(host, patientId) {
    logger.info('db/nhsNumberDb|getEhrId', { host, patientId });

    return this.nhsNoMap.$(['byNHSNo', patientId, host]).value;
  }

  async getPatientId(host, ehrId) {
    logger.info('db/nhsNumberDb|getEhrId', { host, ehrId });

    return this.nhsNoMap.$(['byEhrId', ehrId, host]).value;
  }

  async insert(host, patientId, ehrId) {
    logger.info('db/nhsNumberDb|getEhrId', { host, patientId, ehrId });

    this.nhsNoMap.$(['byNHSNo', patientId, host]).value = ehrId;
    this.nhsNoMap.$(['byEhrId', ehrId, host]).value = patientId;
  }
}

module.exports = NhsNumberDb;
