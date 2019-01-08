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

  15 December 2018

*/

'use strict';

const { transform } = require('qewd-transform-json').transform;
const { parseRef } = require('../shared/utils');
const { getTemplate } = require('../shared/headings');
// const debug = require('debug')('ripple-cdr-discove:services:patient');

class HeadingService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new HeadingService(ctx);
  }

  /**
   * @param { string | number} patientId
   * @param { string } heading
   * @param { string } headingRef
   * @param { string } format
   * @returns {Promise<*>}
   */
  async getDetail(patientId, heading, headingRef, format) {
    const { resourceName, uuid } = parseRef(headingRef, '_');
    const { template, helper } = getTemplate(heading, format);

    const { resourceCache } = this.ctx.cache;
    const resource = await resourceCache.get(resourceName, uuid);
    const practitioner = await resourceCache.getPractitioner();
    resource.practitionerName = practitioner.name.text;
    resource.nhsNumber = nhsNumber;
    return transform(template, resource, helper);
  }

  /**
   * @param { string | number} patientId
   * @param { string }  heading
   * @param { string }  resourceName
   * @param { string }  format
   * @returns {Promise<void>}
   */
  async getSummaryDetail(patientId, heading, resourceName, format) {
    const { template, helper } = getTemplate(heading, format);

    const { resourceCache } = this.ctx.cache;
    const resource = await resourceCache.get(resourceName, uuid);
    const practitioner = await resourceCache.getPractitioner();
  }

}
module.exports = HeadingService;
