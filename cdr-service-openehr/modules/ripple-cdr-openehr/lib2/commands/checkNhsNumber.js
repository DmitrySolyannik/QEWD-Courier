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

  14 December 2018

*/

const { RecordStatus } = require('../shared/enums');
const { isPatientIdValid } = require('../shared/validation');
const debug = require('debug')('ripple-cdr-openehr:commands:check-nhs-number');

class CheckNhsNumberCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
    this.recordStateService = this.ctx.services.recordStateService;
  }

  /**
   * @return {Promise.<Object>}
   */
  async execute() {
    let recordState = null;

    const patientId = this.session.nhsNumber;
    debug('patientId: %s', patientId);

    isPatientIdValid(patientId);

    recordState = await this.recordStateService.getByPatientId(patientId);
    debug('record state: %j', recordState);

    if (recordState) {
      recordState.requestNo = recordState.requestNo + 1;
      await this.recordStateService.update(patientId, recordState);

      if (recordState.status === RecordStatus.LOADING) {
        return {
          status: recordState.status,
          new_patient: recordState.new_patient,
          responseNo: recordState.requestNo,
          nhsNumber: patientId
        };
      }

      return {
        status: RecordStatus.READY,
        nhsNumber: patientId
      };
    }

    debug('first time this API has been called in this user session');
    const initialRecordStateState = {
      status: RecordStatus.LOADING,
      new_patient: 'not_known_yet',
      requestNo: 1
    };
    await this.recordStateService.create(patientId, initialRecordStateState);

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

      await this.ctx.services.phrFeedService.create(feed);
    }

    recordState = await this.recordStateService.getByPatientId(patientId);
    debug('record state: %j', recordState);
    recordState.new_patient = created;
    await this.recordStateService.update(patientId, recordState);

    return {
      status: RecordStatus.LOADING,
      new_patient: created,
      responseNo: recordState.requestNo,
      nhsNumber: patientId
    };
  }
}

module.exports = CheckNhsNumberCommand;
