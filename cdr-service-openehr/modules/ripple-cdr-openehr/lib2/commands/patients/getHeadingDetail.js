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

  19 December 2018

*/

'use strict';

const { BadRequestError } = require('../../errors');
const { isHeadingValid, isPatientIdValid, isSourceIdValid } = require('../../shared/validation');
const { Heading } = require('../../shared/enums');
const debug = require('debug')('ripple-cdr-openehr:commands:patients:get-heading-detail');

class GetPatientHeadingDetailCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @param  {string} heading
   * @param  {string} sourceId
   * @return {Object}
   */
  async execute(patientId, heading, sourceId) {
    debug('patientId: %s, heading: %s, sourceId: %s', patientId, heading, sourceId);
    debug('role: %s', this.session.role);

    if (this.session.role === Role.PHR_USER) {
      patientId = this.session.nhsNumber;
    }

    const patientValid = isPatientIdValid(patientId);
    if (!patientValid.ok) {
      throw new BadRequestError(patientValid.error);
    }

    const headingValid = isHeadingValid(this.ctx.headingsConfig, heading);
    if (!headingValid.ok) {
      throw new BadRequestError(headingValid.error);
    }

    const sourceIdValid = isSourceIdValid(sourceId);
    if (!sourceIdValid.ok) {
      return [];
    }

    isHeadingValid(this.ctx.headingsConfig, heading);

    const { headingService, discoveryService } = this.ctx.services;
    await headingService.fetchAll(patientId, heading);

    const responseObj = await headingService.delete(patientId, heading, sourceId);
    await discoveryService.delete(sourceId);

    return responseObj;
  }
}

module.exports = GetPatientHeadingDetailCommand;
