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

  12 December 2018

*/

const { SyncStatus } = require('../shared/enums');
const { isPatientIdValid } = require('../shared/validation');
const debug = require('debug')('ripple-cdr-openehr:commands:check-nhs-number');

class CheckNhsNumberCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  async execute() {
    let syncState = null;

    const patientId = this.session.nhsNumber;
    debug('patientId: %s', patientId);

    const validationResult = isPatientIdValid(patientId)
    if (validationResult.error) {
      throw validationResult.error;
    }

    const { syncService } = this.ctx.services;
    syncState = await syncService.getState(patientId);
    debug('sync state: %j', syncState);

    if (syncState) {
      syncState.requestNo = syncState.requestNo + 1;
      await syncService.updateState(patientId, syncState);

      if (syncState.status === SyncStatus.LOADING) {
        return {
          status: syncState.status,
          new_patient: syncState.new_patient,
          responseNo: syncState.requestNo,
          nhsNumber: patientId
        };
      }

      return {
        status: SyncStatus.READY,
        nhsNumber: patientId
      };
    }

    debug('first time this API has been called in this user session');
    const initialSyncState = {
      status: SyncStatus.LOADING,
      new_patient: 'not_known_yet',
      requestNo: 1
    };
    await syncService.createState(patientId, initialSyncState);

    const { nhsNumberService, ehrSessionService } = this.ctx.services;
    const host = this.ctx.defaultHost;
    const ehrSession = await ehrSessionService.start(host);

    const { created } = await nhsNumberService.check(host, ehrSession.id, patientId);

    // // see index.js for workerResponseHandler that is invoked when this has completed
    // // where it will next fetch any new heading data from Discovery and
    // // write it into EtherCIS record

    if (created) {
      debug('add the standard feed to this user session');
      const feed = {
        email: this.session.email,
        author: 'Helm PHR service',
        name: 'Leeds Live - Whats On',
        landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/',
        rssFeedUrl: 'https://www.leeds-live.co.uk/news/?service=rss'
      };
      debug('standard feed: %j', feed);

      await this.ctx.services.feedService.create(feed);
    }

    syncState = await syncService.getState(patientId);
    debug('sync state: %j', syncState);
    syncState.new_patient = created;
    await syncService.updateState(patientId, syncState);

    return {
      status: SyncStatus.LOADING,
      new_patient: created,
      responseNo: syncState.requestNo,
      nhsNumber: patientId
    };
  }
}

module.exports = CheckNhsNumberCommand;
