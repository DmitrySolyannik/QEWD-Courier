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

  11 February 2019

*/

'use strict';

const { logger } = require('../../../core');
const { ResourceName } = require('../../../shared/enums');

module.exports = (adapter) => {
  return {

    /**
     * Checks if data exists by patient uuid or not
     *
     * @param  {string} patientUuid
     * @return {bool}
     */
    exists: async (patientUuid) => {
      logger.info('mixins/patient|byPatientUuid|exists', { patientUuid });

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid];

      return adapter.exists(key);
    },

    /**
     * Sets patient data
     *
     * @param  {string} patientUuid
     * @param  {Object} patient
     * @return {void}
     */
    set: async (patientUuid, patient) => {
      logger.info('mixins/patient|byPatientUuid|exists', { patientUuid, patient });

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid];
      adapter.putObject(key, patient);
    },

    /**
     * Gets patient by patient uuid
     *
     * @param  {string} patientUuid
     * @return {Object}
     */
    get: async (patientUuid) => {
      logger.info('mixins/patient|byPatientUuid|get', { patientUuid });

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid];

      return adapter.getObject(key);
    },

    /**
     * Sets NHS number for patient
     *
     * @param  {string} patientUuid
     * @param  {int|string} nhsNumber
     * @return {void}
     */
    setNhsNumber: async (patientUuid, nhsNumber) => {
      logger.info('mixins/patient|byPatientUuid|setNhsNumber', { patientUuid, nhsNumber });

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid, 'nhsNumber', nhsNumber];
      adapter.put(key, nhsNumber);
    },

    /**
     * Deletes all patients data
     *
     * @return {[type]} [description]
     */
    deleteAll: async () => {
      logger.info('mixins/patient|byPatientUuid|deleteAll');

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid'];
      adapter.delete(key);
    },

    /**
     * Gets practitioner uuid for patient
     *
     * @param  string} patientUuid
     * @return {string}
     */
    getPractitionerUuid: async (patientUuid) => {
      logger.info('mixins/patient|byPatientUuid|getPractitionerUuid', { patientUuid });

      const key = ['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid, 'practitioner'];

      return adapter.get(key);
    },

    /**
     * Gets patients data by patient uuids
     *
     * @param  {string[]} patientUuids
     * @return {Object[]}
     */
    getByPatientUuids: async (patientUuids) => {
      logger.info('mixins/patient|byPatientUuid|getByPatientUuids', { patientUuids });

      const uuids = patientUuids.map((patientUuid) => {
        return {
          resource: adapter.getObject(['Discovery', ResourceName.PATIENT, 'by_uuid', patientUuid])
        };
      });

     return uuids;
    }
  };
};
