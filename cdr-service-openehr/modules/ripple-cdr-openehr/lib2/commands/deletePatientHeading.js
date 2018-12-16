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

const { BadRequestError, ForbiddenError } = require('../errors');
const { isHeadingValid, isPatientIdValid } = require('../shared/validation');
const { Heading } = require('../shared/enums');
const debug = require('debug')('ripple-cdr-openehr:commands:delete-patient-heading');

class DeletePatientHeadingCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  get forbiddenHeadings() {
    return [
      Heading.FEEDS,
      Heading.TOP_3_THINGS
    ];
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

    if (this.session.userMode !== 'admin') {
      throw new ForbiddenError('Invalid request');
    }

    isPatientIdValid(patientId);

    if (heading && this.forbiddenHeadings.includes(heading)) {
      throw new BadRequestError(`Cannot delete ${heading} records`);
    }

    isHeadingValid(this.ctx.headingsConfig, heading);

    const { headingService, discoveryService } = this.ctx.services;
    await headingService.fetchAll(patientId, heading);

    const responseObj = await headingService.delete(patientId, heading, sourceId);
    await discoveryService.delete(sourceId);

    return responseObj;
  }
}

module.exports = DeletePatientHeadingCommand;
