/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-19 Ripple Foundation Community Interest Company       |
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

  2 January 2019

*/

'use strict';

module.exports = {

  logging: {

    /**
     * Default log level
     * @type {string}
     */
    defaultLevel: 'debug'
  },

  auth: {

    /**
     * Token session timeout
     *
     * @type {int}
     */
    tokenTimeout: 55 * 1000,
  },

  hosts: {
    auth: {
      host: 'https://devauth.endeavourhealth.net',
      path:  '/auth/realms/endeavour/protocol/openid-connect/token',
      username: 'xxxxxxx',
      password: 'yyyyyyyyyyyyyyy',
      client_id: 'eds-data-checker',
      grant_type: 'password'
    },
    api: {
      host: 'https://deveds.endeavourhealth.net/data-assurance',
      paths: {
        getPatientsByNhsNumber: '/api/fhir/patients',
        getPatientResources: '/api/fhir/resources',
        getResource: '/api/fhir/reference'
      }
    }
  },
  headings : {
    medications: 'MedicationStatement',
    allergies: 'AllergyIntolerance',
    problems: 'Condition',
    vaccinations: 'Immunization'
  }
};
