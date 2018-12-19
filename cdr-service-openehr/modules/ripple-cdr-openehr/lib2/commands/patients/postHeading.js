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

const { BadRequestError } = require('../../errors');
const { isHeadingValid, isEmpty, isPatientIdValid } = require('../../shared/validation');
const { ResponseFormat, Role } = require('../../shared/enums');
const debug = require('debug')('ripple-cdr-openehr:commands:patients:post-heading');

class PostPatientHeadingCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} patientId
   * @param  {string} heading
   * @param  {Object} query
   * @param  {Object} payload
   * @return {Object}
   */
  async execute(patientId, heading, query, payload) {
    debug('patientId: %s, heading: %s', patientId, heading);
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

    if (isEmpty(payload)) {
      throw new BadRequestError(`No body content was posted for heading ${heading}`);
    }

    const host = this.ctx.defaultHost;
    const data = {
      data: payload,
      format: query.format === ResponseFormat.JUMPER
        ? ResponseFormat.JUMPER
        : ResponseFormat.PULSETILE
    };

    const { headingService } = this.ctx.services;
    const responseObj = await headingService.post(host, patientId, heading, data);
    debug('response: %j', responseObj);

    return responseObj;
  }
}

module.exports = PostPatientHeadingCommand;
