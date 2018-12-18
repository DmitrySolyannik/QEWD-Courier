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

function isTop3ThingsPayloadValid(payload) {
  if (!payload.name1 || payload.name1 === '') {
    throw new BadRequestError('You must specify at least 1 Top Thing');
  }

  if (!payload.description1 || payload.description1 === '') {
    throw new BadRequestError('You must specify at least 1 Top Thing');
  }

  if (!payload.name2 || payload.name2 === '') {
    if (payload.description2 && payload.description2 !== '') {
      throw new BadRequestError('A Description for the 2nd Top Thing was defined, but its summary name was not defined');
    }
    payload.name2 = '';
    payload.description2 = '';
  } else {
    payload.description2 = payload.description2 || '';
  }

  if (!payload.name3 || payload.name3 === '') {
    if (payload.description3 && payload.description3 !== '') {
      throw new BadRequestError('A Description for the 3rd Top Thing was defined, but its summary name was not defined');
    }
    payload.name3 = '';
    payload.description3 = '';
  } else {
    payload.description3 = payload.description3 || '';
  }

  return true;
}

/**
 * Returns true if heading valid. Otherwise throw an error
 *
 * @param  {Object}  headingsConfig
 * @param  {string}  heading
 * @return {Boolean}
 */
function isHeadingValid(headingsConfig, heading) {
  if (!heading || !headingsConfig[heading]) {
    throw new BadRequestError(`Invalid or missing heading: ${heading}`);
  }

  return true;
}

module.exports = {
  isNumeric,
  isPatientIdValid,
  isFeedPayloadValid,
  isTop3ThingsPayloadValid,
  isHeadingValid
};
