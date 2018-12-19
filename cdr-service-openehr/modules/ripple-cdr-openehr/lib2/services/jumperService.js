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

const { jumper, logger } = require('../core');

class JumperService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new JumperService(ctx);
  }

  check(heading, method) {
    logger.info('services/jumperService|check', { heading, method });

    const headingConfig = this.ctx.getHeadingConfig(heading);
    const result = jumper[method] && headingConfig && headingConfig.template && headingConfig.name;

    const jumperObj = {
      ok: result
    };

    if (headingConfig.synopsisField) {
      jumperObj.synopsisField = headingConfig.synopsisField;
    }

    if (headingConfig.summaryTableFields) {
      jumperObj.summaryTableFields = headingConfig.summaryTableFields.slice(0);
    }

    return jumperObj;
  }

  async getBySourceId(sourceId) {
    logger.info('services/jumperService|getBySourceId', { sourceId });

    const format = 'pulsetile';

    return jumper.getBySourceId.call(this.worker, sourceId, format, this.ctx.qewdSession);
  }

  async query(host, patientId, heading) {
    logger.info('services/jumperService|query', { host, patientId, heading });

    const { ehrSessionService, patientService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);
    const ehrId = await patientService.getEhrId(host, sessionId, patientId);

    // TODO: pass openEHR
    // openEHR.request only is used in jumper.query to make query request
    // need adapter
    return new Promise((resolve, reject) => {
      const params = {
        host,
        patientId,
        heading,
        ehrId,
        // openEHR: openEHR
        openEHRSession: {
          id: sessionId
        },
        qewdSession: this.ctx.qewdSession
      };

      jumper.query.call(this.worker, params, (responseObj) => {
        if (responseObj.error) return reject(responseObj);

        return resolve(responseObj);
      });
    });
  }

  async post(host, patientId, heading, data) {
    logger.info('services/jumperService|post', { host, patientId, heading, data: typeof data});

    return new Promise((resolve, reject) => {
      const params = {
        defaultHost: host,
        patientId,
        heading,
        data,
        method: 'post',
        qewdSession: this.ctx.qewdSession
      };

      jumper.post.call(this.worker, params, (responseObj) => {
        if (responseObj.error) return reject(responseObj);

        return resolve(responseObj);
      });
    });
  }
}

module.exports = JumperService;
