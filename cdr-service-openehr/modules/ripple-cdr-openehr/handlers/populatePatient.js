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

  27 June 2018

*/

var fetchAndCacheHeading = require('../src/fetchAndCacheHeading');
var populatePatient = require('../src/populatePatient');
var tools = require('../src/tools');
var getHeadingSummary = require('./getHeadingSummary');

module.exports = function(args, finished) {

  if (args.session.userMode !== 'admin') {
    return finished({error: 'Invalid request'});
  }

  var patientId = args.patientId;
  var valid = tools.isPatientIdValid(patientId);
  if (valid.error) return finished(valid);

  var heading = args.heading;
  if (heading && (heading === 'feeds' || heading === 'top3Things')) {
    return finished({error: 'Cannot populate ' + heading + ' records'});
  }

  if (!tools.isHeadingValid.call(this, heading)) {
    return finished({error: 'Invalid or missing heading: ' + heading});
  }

  var session = args.req.qewdSession;
  var self = this;

  fetchAndCacheHeading.call(this, patientId, heading, session, function(response) {
    if (!response.ok) {
      console.log('*** No results could be returned from the OpenEHR servers for heading ' + heading);
      populatePatient.call(self, patientId, heading, function() {
        // now fetch the new data and return it
        getHeadingSummary.call(self, args, finished);
      });
    }
    else {
      return finished({error: 'heading ' + heading + ' for ' + patientId + ' already has data'});
    }
  });

};


