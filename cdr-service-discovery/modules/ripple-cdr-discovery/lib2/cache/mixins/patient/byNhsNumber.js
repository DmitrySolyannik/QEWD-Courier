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

const { logger } = require('../../core');

module.exports = (adapter, prefix, name) => {
  return {
    exists: async (nhsNumber) => {
      logger.info(`cache/${name}|byNhsNumber|exists`, { nhsNumber });

      const key = ['Discovery', prefix, 'by_nhsNumber', nhsNumber];

      return adapter.exists(key);
    },

    getAllPatientIds: async (nhsNumber) => {
      logger.info(`cache/${name}|byNhsNumber|getAllPatientIds`, { nhsNumber });

      const patientIds = [];
      const key = ['Discovery', prefix, 'by_nhsNumber', nhsNumber, 'Patient'];

      adapter.qewdSession.data.$(key).forEachChild((uuid) => {
        patientIds.push(uuid);
      });

      return patientIds;
    },
    set: async (nhsNumber, uuid) => {
      logger.info(`cache/${name}|byNhsNumber|set`, { nhsNumber, uuid });

      const nhsKey = ['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'Patient', uuid];

      adapter.put(nhsKey, uuid);
    }
  };
};
