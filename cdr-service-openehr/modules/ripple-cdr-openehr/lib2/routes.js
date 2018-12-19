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

const { postFeed, putFeed, getFeedSummary, getFeedDetail } = require('./handlers/feeds');
const { getTop3ThingsSummary, getTop3ThingsDetail, postTop3Things } = require('./handlers/top3Things');
const { mergeDiscoveryData, revertDiscoveryData, revertAllDiscoveryData } = require('./handlers/discovery');
const checkNhsNumber = require('./handlers/checkNhsNumber');

const postPatientHeading = require('./handlers/patients/postHeading');
const deletePatientHeading = require('./handlers/patients/deleteHeading');
const getHeadingDetail = require('./handlers/patients/getHeadingDetail');

module.exports = {
  '/api/openehr/check': {
    GET: checkNhsNumber
  },
  '/api/patients/:patientId/top3Things': {
    POST: postTop3Things,
    GET: getTop3ThingsSummary
  },
  '/api/patients/:patientId/top3Things/:sourceId': {
    PUT: postTop3Things,
    GET: getTop3ThingsDetail
  },
  '/api/patients/:patientId/:heading': {
    // GET:  getHeadingSummary,
    POST: postPatientHeading
  },
  '/api/patients/:patientId/:heading/:sourceId': {
    GET: getHeadingDetail,
    // PUT: editPatientHeading,
    DELETE: deletePatientHeading
  },
  '/api/feeds': {
    GET: getFeedSummary,
    POST: postFeed
  },
  '/api/feeds/:sourceId': {
    GET: getFeedDetail,
    PUT: putFeed
  },
  '/discovery/merge/:heading': {
    GET: mergeDiscoveryData
  },
  '/api/discovery/revert/:patientId/:heading': {
    DELETE: revertDiscoveryData
  },
  '/api/discovery/revert/all': {
    DELETE: revertAllDiscoveryData
  }
};

