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

  12 January 2019

*/

'use strict';

const { logger } = require('../../../core');
const { ResourceName } = require('../../../shared/enums');

module.exports = (adapter, ) => {
  return {
    exists: async (nhsNumber) => {
      logger.info('mixins/patient/byNhsNumber|exists', { nhsNumber });

      const key = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber];

      return adapter.exists(key);
    },

    getPatientUuid: async (nhsNumber) => {
      logger.info('mixins/patient/byNhsNumber|getPatientUuid', { nhsNumber });

      const key = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber, 'Patient'];

      return adapter.qewdSession.data.$(key).firstChild.value;
    },

    getAllPatientUuids: async (nhsNumber) => {
      logger.info('mixins/patient|byNhsNumber|getAllPatientUuids', { nhsNumber });

      const patientUuids = [];
      const key = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber, 'Patient'];

      adapter.qewdSession.data.$(key).forEachChild((patientUuid) => {
        patientUuids.push(patientUuid);
      });

      return patientUuids;
    },

    setPatientUuid: async (nhsNumber, patientUuid) => {
      logger.info('mixins/patient|byNhsNumber|setPatientUuid', { nhsNumber, patientUuid });

      const key = ['Discovery', ResourceName.PATIENT, 'by_nhsNumber', nhsNumber, 'Patient', patientUuid];

      adapter.put(key, patientUuid);
    }
  };
};
