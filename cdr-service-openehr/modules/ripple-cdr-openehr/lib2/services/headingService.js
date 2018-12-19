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

  18 December 2018

*/

'use strict';

const P = require('bluebird');
const template = require('qewd-template');
const { transform } = require('qewd-transform-json');
const config = require('../config');
const { logger } = require('../core');
const { NotFoundError, UnprocessableEntityError } = require('../errors');
const { Heading } = require('../shared/enums');
const { buildSourceId, flatten } = require('../shared/utils');
const dateTime = require('../shared/dateTime');

class HeadingService {
  constructor(ctx, headings) {
    this.ctx = ctx;
    this.headings = headings;
    //this.jumperService = ctx.services.jumperService;
  }

  static create(ctx) {
    return new HeadingService(ctx, config.headings);
  }

  async post(host, patientId, heading, data) {
    logger.info('services/headingService|create', { host, patientId, heading, data });

    // TODO: implement jumper

    logger.debug('jumper is not used for creating this record');

    if (!this.headings[heading].post) {
      throw new UnprocessableEntityError(`heading ${heading} not recognised, or no POST definition available`);
    }

    const postMap = this.headings[heading].post;
    const { ehrSessionService, patientService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);
    const ehrId = await patientService.getEhrId(host, sessionId, patientId);

    const helpers = {
      ...postMap.helperFunctions,
      now: dateTime.now
    };
    const output = transform(postMap.transformTemplate, data, helpers);
    const postData = flatten(output);

    const ehrRestService = this.ctx.openehr[host];
    const responseObj = await ehrRestService.postHeading(sessionId, ehrId, postMap.templateId, postData);

    await ehrSessionService.stop(host, sessionId);

    return responseObj && responseObj.data && responseObj.data.compositionUid
      ? {
        ok: true,
        host: host,
        heading: heading,
        compositionUid: responseObj.data.compositionUid
      }
      : {
        ok: false
      };
  }

  async get(host, patientId, heading) {
    logger.info('services/headingService|get', { host, patientId, heading });

    // TODO: implement jumper

    const { ehrSessionService, patientService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);
    const ehrId = await patientService.getEhrId(host, sessionId, patientId);

    const aql = this.headings[heading].aql;
    const subs = {
      ehrId
    };
    const query = template.replace(aql, subs);

    const ehrRestService = this.ctx.openehr[host];
    const responseObj = await ehrRestService.query(sessionId, query);

    await ehrSessionService.stop(host, sessionId);

    return responseObj && responseObj.resultSet
      ? responseObj.resultSet
      : [];
  }

  async fetchAll(patientId, heading) {
    logger.info('services/headingService|fetchAll', { patientId, heading });

    const hosts = Object.keys(this.ctx.servers);
    await P.each(hosts, (host) => this.fetch(host, patientId, heading));

    return {
      ok: true
    };
  }

  async fetch(host, patientId, heading) {
    logger.info('services/headingService|fetch', { host, patientId, heading });

    const { headingCache } = this.ctx.cache;

    const exists = await headingCache.byHost.exists(patientId, heading, host);
    if (exists) return;

    try {
      const data = await this.get(host, patientId, heading);
      const now = Date.now();

      await P.each(data, async (result) => {
        if (heading === Heading.COUNTS) {
          result.uid = result.ehrId + '::';
          result.dateCreated = now;
        }

        if (result.uid) {
          const sourceId = buildSourceId(host, result.uid);
          const dateCreated = result.date_created || result.dateCreated;
          const date = new Date(dateCreated).getTime();

          const dbData = {
            heading: heading,
            host: host,
            patientId: patientId,
            date: date,
            data: result,
            uid: result.uid
          };

          await headingCache.byHost.set(patientId, heading, host, sourceId);
          await headingCache.byDate.set(patientId, heading, date, sourceId);
          await headingCache.bySourceId.set(sourceId, dbData);
        }
      });
    } catch (err) {
      logger.error('services/headingService|fetch|err:', err);
    }
  }

  async delete(patientId, heading, sourceId) {
    logger.info('services/headingService|delete', { patientId, heading, sourceId });

    const { headingCache } = this.ctx.cache;

    const dbData = await headingCache.bySourceId.get(sourceId);
    if (!dbData) {
      throw new NotFoundError(`No existing ${heading} record found for sourceId: ${sourceId}`);
    }

    const compositionId = dbData.uid;
    const host = dbData.host;
    const date = dbData.date;

    if (!compositionId) {
      throw new NotFoundError(`Composition Id not found for sourceId: ${sourceId}`);
    }

    const { ehrSessionService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);

    const ehrRestService = this.ctx.openehr[host];
    await ehrRestService.deleteHeading(sessionId, compositionId);

    await headingCache.byHost.delete(patientId, heading, host, sourceId);
    await headingCache.byDate.delete(patientId, heading, date, sourceId);
    await headingCache.bySourceId.delete(sourceId);
    await headingCache.byHeading.delete(heading, sourceId);

    await ehrSessionService.stop(host, sessionId);

    return {
      deleted: true,
      patientId: patientId,
      heading: heading,
      compositionId: compositionId,
      host: host
    };
  }
}

module.exports = HeadingService;
