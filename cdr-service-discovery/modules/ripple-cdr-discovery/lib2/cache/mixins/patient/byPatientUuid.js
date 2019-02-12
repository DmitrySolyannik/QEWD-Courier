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

module.exports = (adapter) => {
  return {
    exists: async (patientUuid) => {
      logger.info('mixins/patient|byPatientUuid|exists', { patientUuid });

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid];

      return adapter.exists(key);
    },

    set: async (patientUuid, patient) => {
      logger.info('mixins/patient|byPatientUuid|exists', { patientUuid, patient });

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid];
      adapter.putObject(key, patient);
    },

    get: async(patientUuid) => {
      logger.info('mixins/patient|byPatientUuid|get', { patientUuid });

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid];

      return adapter.getObjectWithArrays(key);
    },

    setNhsNumber: async (patientUuid, nhsNumber) => {
      logger.info('mixins/patient|byPatientUuid|setNhsNumber', { patientUuid, nhsNumber });

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid, 'nhsNumber', nhsNumber];
      adapter.put(key, nhsNumber);
    },

    deleteAll: async () => {
      logger.info('mixins/patient|byPatientUuid|deleteAll');

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid'];
      adapter.delete(key);
    },

    getPractitionerUuid: async (patientUuid) => {
      logger.info('mixins/patient|byPatientUuid|getPractitionerUuid', { patientUuid });

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid, 'practitioner'];

      return adapter.get(key);
    },

    getByPatientUuids: async (patientUuids) => {
      logger.info('mixins/patient|byPatientUuid|getByPatientUuids', { patientUuids });
      const patients = patientUuids.map(
        (patientUuid) => {
          return {
            resource: adapter.getObjectWithArrays(['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid])
          }
        }
      );

     return patients;
    }
  };
};
