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

const { RecordStatus, ExtraHeading } = require('../../shared/enums');
const debug = require('debug')('ripple-cdr-openehr:commands:discovery:merge');

class MergeDiscoveryDataCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  /**
   * @param  {string} heading
   * @param  {Object[]} data
   * @return {Promise.<Object[]>}
   */
  async execute(heading, data) {
    debug('heading: %s, data: %j', heading, data);

    const patientId = this.session.nhsNumber;
    debug('patientId: %s', patientId);

    const { statusService, discoveryService } = this.ctx.services;

    if (heading === ExtraHeading.FINISHED) {
      const state = await this.statusService.get();
      debug('loaded record state: %j', state);

      state.status = RecordStatus.READY;
      await statusService.update(state);

      return {
        refresh: true
      };
    }

    const result = await discoveryService.mergeAll(patientId, heading, data);
    if (result) {
      // TODO: add
      // deleteSessionCaches.call(_this, patientId, heading, 'ethercis');
    }

    return {
      refresh: result
    };
  }
}

module.exports = MergeDiscoveryDataCommand;
