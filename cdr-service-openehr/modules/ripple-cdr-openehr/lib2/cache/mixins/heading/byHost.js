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

  30 December 2018

*/

'use strict';

const { logger } = require('../../../core');

module.exports = (adapter) => {
  return {
    delete: async (patientId, heading, sourceId, host) => {
      logger.info('cache/headingCache|byHost|delete', { patientId, heading, sourceId, host });

      const key = ['headings', 'byPatientId', patientId, heading, 'byHost', host, sourceId];
      adapter.delete(key);
    },

    exists: async (patientId, heading, host) => {
      logger.info('cache/headingCache|byHost|exists', { patientId, heading, host });

      const key = ['headings', 'byPatientId', patientId, heading, 'byHost', host];

      return adapter.exists(key);
    },

    set: async (patientId, heading, sourceId, host) => {
      logger.info('cache/headingCache|byHost|set', { patientId, heading, sourceId, host });

      const key = ['headings', 'byPatientId', patientId, heading, 'byHost', host, sourceId];
      adapter.put(key, 'true');
    },

    getAllSourceIds: async (patientId, heading) => {
      logger.info('cache/headingCache|byHost|getAllSourceIds', { patientId, heading });

      const sourceIds = [];
      const qewdSession = adapter.qewdSession;
      const byHost = qewdSession.data.$(['headings', 'byPatientId', patientId, heading, 'byHost']);

      byHost.forEachChild((host, node) => {
        node.forEachChild((sourceId) => {
          sourceIds.push(sourceId)
        });
      });

      return sourceIds;
    }
  };
};
