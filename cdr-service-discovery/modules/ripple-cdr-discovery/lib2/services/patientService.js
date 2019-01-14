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

  12 January 2018

*/

'use strict';

const { logger } = require('../core');

class PatientService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new PatientService(ctx);
  }

  async getPatientBundle(nhsNumber) {
    logger.info('services/patientService|getPatientBundle', { nhsNumber });

    const { patientCache, bundleCache } = this.ctx.cache;

    const exists = await bundleCache.exists();
    const targetCache = exists
      ? bundleCache
      : patientCache;

    const patientUuids = await targetCache.byNhsNumber.getAllPatientUuids(nhsNumber);
    const patients = await targetCache.byPatientUuid.getByUuids(patientUuids);

    return {
      resourceType: 'Bundle',
      entry: patients
    };
  }

  async updateBundle() {
    logger.info('services/patientService|updateBundle');

    const { patientCache, bundleCache } = this.ctx.cache;
    const data = await patientCache.export();
    await bundleCache.import(data);
  }
}

module.exports = PatientService;
