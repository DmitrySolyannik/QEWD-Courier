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

const validUrl = require('valid-url');
const { BadRequestError } = require('../errors');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isPatientIdValid(patientId) {
  if (!patientId || patientId === '') {
    throw new BadRequestError(`patientId ${patientId} must be defined`);
  }

  if (!isNumeric(patientId)) {
    throw new BadRequestError(`patientId ${patientId} is invalid`);
  }

  return true;
}

function isFeedPayloadValid(payload) {
  if (!payload.author || payload.author === '') {
    throw new BadRequestError('Author missing or empty');
  }

  if (!payload.name || payload.name === '') {
    throw new BadRequestError('Feed name missing or empty');
  }

  if (!payload.landingPageUrl || payload.landingPageUrl === '') {
    throw new BadRequestError('Landing page URL missing or empty');
  }

  if (!validUrl.isWebUri(payload.landingPageUrl)) {
    throw new BadRequestError('Landing page URL is invalid');
  }

  if (!payload.rssFeedUrl || payload.rssFeedUrl === '') {
    throw new BadRequestError('RSS Feed URL missing or empty');
  }

  if (!validUrl.isWebUri(payload.rssFeedUrl)) {
    throw new BadRequestError('RSS Feed URL is invalid');
  }

  return true;
}

module.exports = {
  isNumeric,
  isPatientIdValid,
  isFeedPayloadValid
};
