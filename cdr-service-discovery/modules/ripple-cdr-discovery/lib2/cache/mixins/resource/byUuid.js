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

module.exports = (adapter) => {
  return {
    exists: async (resourceName, uuid) => {
      logger.info('mixins/resource|byUuid|exists', { resourceName, uuid });

      const key = ['Discovery', resourceName, 'by_uuid', uuid];

      return adapter.exists(key);
    },

    set: async (resourceName, uuid, resource) => {
      logger.info('mixins/resource|byUuid|setIfNotExists', { resourceName, uuid, resource });

      const key = ['Discovery', resourceName, 'by_uuid', uuid];
      const dataKey = ['Discovery', resourceName, 'by_uuid', uuid, 'data'];

      if (!adapter.exists(key)) {
        adapter.putObject(dataKey, resource);
      }
    },

    get: async (resourceName, uuid) => {
      logger.info('mixins/resource|byUuid|get', { uuid });

      const key = ['Discovery', resourceName, 'by_uuid', uuid, 'data'];

      return adapter.getObjectWithArrays(key);
    },

    setPractitionerUuid: async (resourceName, uuid, practitionerUuid) => {
      logger.info('mixins/resource|byUuid|setPractitionerUuid', { resourceName, uuid, practitionerUuid });

      const key = ['Discovery', resourceName, 'by_uuid', uuid, 'practitioner'];

      adapter.put(key, practitionerUuid);
    },

    getPractitionerUuid: async (resourceName, uuid) => {
      logger.info('mixins/resource|byUuid|getPractitionerUuid', { resourceName, uuid });

      const key = ['Discovery', resourceName, 'by_uuid', uuid, 'practitioner'];

      return adapter.get(key);
    }
  };
};
