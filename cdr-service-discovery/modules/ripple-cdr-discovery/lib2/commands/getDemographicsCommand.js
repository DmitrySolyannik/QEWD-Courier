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

  20 December 2018

*/

'use strict';

const { BadRequestError } = require('../errors');
const { isPatientIdValid } = require('../shared/validation');
const { Role } = require('../shared/enums');

class getDemographicsCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} nhsNumber
   * @return {Object}
   */
  async execute(nhsNumber) {
    if (this.session.role === Role.PHR_USER) {
      nhsNumber = this.session.nhsNumber;
    }

    const patientValid = isPatientIdValid(nhsNumber);
    if (!patientValid.ok) {
      throw new BadRequestError(patientValid.error);
    }

    const {demographicsCache} = this.ctx.cache;

    if (typeof demographicsCache === 'undefined') return false; //@TODO think about error

    if (await demographicsCache.exists(nhsNumber)) {
      return await demographicsCache.getObject(nhsNumber);
    }
    const { resourceService, demographicService } = this.ctx.services;
    await resourceService.fetchPatients(nhsNumber);
    await resourceService.fetchPatientResources(nhsNumber, 'Patient'); //@TODO should resourceName be hardcoded ?
    let result = await demographicService.getDemographics(nhsNumber);
    result.demographics.id = nhsNumber;
    result.demographics.nhsNumber = nhsNumber;
    demographicsCache.set(nhsNumber, result);

    return result;
  }
}

module.exports = getDemographicsCommand;
