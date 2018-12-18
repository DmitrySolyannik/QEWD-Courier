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

const checkNhsNumber = require('./handlers/checkNhsNumber');

// feeds
const createFeed = require('./handlers/feeds/createFeed');
const updateFeed = require('./handlers/feeds/updateFeed');
const getFeedSummary = require('./handlers/feeds/getSummary');
const getFeedDetail = require('./handlers/feeds/getDetail');

// top3 things
const getTop3ThingsSummary = require('./handlers/top3Things/getSummary');
const getTop3ThingsDetail = require('./handlers/top3Things/getDetail');
const createTop3Things = require('./handlers/top3Things/create');

// discovery data
const revertDiscoveryData = require('./handlers/discovery/revert');
const revertAllDiscoveryData = require('./handlers/discovery/revertAll');
const mergeDiscoveryData = require('./handlers/discovery/merge');

const deletePatientHeading = require('./handlers/deletePatientHeading');



module.exports = {
  '/api/openehr/check': {
    GET: checkNhsNumber
  },
  '/api/patients/:patientId/top3Things': {
    POST: createTop3Things,
    GET: getTop3ThingsSummary
  },
  '/api/patients/:patientId/top3Things/:sourceId': {
    PUT: createTop3Things,
    GET: getTop3ThingsDetail
  },
  '/api/patients/:patientId/:heading/:sourceId': {
    // GET: getHeadingDetail,
    // PUT: editPatientHeading,
    DELETE: deletePatientHeading
  },
  '/api/feeds': {
    GET: getFeedSummary,
    POST: createFeed
  },
  '/api/feeds/:sourceId': {
    GET: getFeedDetail,
    PUT: updateFeed
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

