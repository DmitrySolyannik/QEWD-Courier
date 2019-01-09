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

  20 December 2018

*/

'use strict';

const { logger } = require('../../core');

module.exports = (adapter) => {
  return {

    exists: async (patientId, resource) => {
      logger.info('cache/patientCache|byResource|exists', { patientId, resource });

      const key = ['Discovery', 'Patient', 'by_nhsNumber', patientId, 'resources', resource];

      return adapter.exists(key);
    },
    getByName: async (resourceName) => {
      logger.info('cache/patientCache|byResource|getByName', { resourceName });

      const key = ['Discovery', resourceName, 'by_uuid'];

      return adapter.get(key);
    },
    get: async (nhsNumber, resourceName) => {
      logger.info('cache/patientCache|byResource|get', { nhsNumber, resourceName });

      const initKey = ['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'resources', resourceName];
      const practitioners = [];
      adapter.qewdSession.data.$(initKey).forEachChild((uuid) => {
        let key = ['Discovery', resourceName, 'by_uuid', uuid, 'data'];
        let resource = adapter.getObjectWithArrays(key);
        resource.nhsNumber = nhsNumber;
        if (adapter.exists([...key, 'practitioner'])) {
          const practitionerUuid = adapter.get([...key, 'practitioner']).value;
          const keyPractitioner = ['Discovery', 'Practitioner', 'by_uuid', practitionerUuid, 'data'];
          const practitioner = adapter.getObjectWithArrays(keyPractitioner);
          resource.practitionerName = practitioner.name.text;
        } else {
          resource.practitionerName = 'Not known';
        }
        practitioners.push(resource);
      });
      return practitioners;
    }
  };
};
