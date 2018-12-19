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

const P = require('bluebird');
const template = require('qewd-template');
const { transform } = require('qewd-transform-json');
const { logger } = require('../core');
const { NotFoundError, UnprocessableEntityError } = require('../errors');
const { Heading, ResponseFormat } = require('../shared/enums');
const { headingHelpers, getHeadingMap, getHeadingAql } = require('../shared/headings');
const { buildSourceId, flatten } = require('../shared/utils');
const debug = require('debug')('ripple-cdr-openehr:services:heading');

class HeadingService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new HeadingService(ctx);
  }

  async post(host, patientId, heading, data) {
    logger.info('services/headingService|post', { host, patientId, heading, data: typeof data });

    debug('data: %j', data);

    const { jumperService } = this.ctx.services;
    const jumper = jumperService.check(heading, jumperService.post.name);

    if (jumper.ok) {
      return jumperService.post(host, patientId, heading, data);
    }

    const headingMap = getHeadingMap(heading, 'post');
    if (!headingMap) {
      throw new UnprocessableEntityError(`heading ${heading} not recognised, or no POST definition available`);
    }

    const { ehrSessionService, patientService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);
    const ehrId = await patientService.getEhrId(host, sessionId, patientId);

    const helpers = headingHelpers(host, heading, 'post');
    const output = transform(headingMap.transformTemplate, data.data, helpers);
    const postData = flatten(output);
    const ehrRestService = this.ctx.openehr[host];
    const responseObj = await ehrRestService.postHeading(sessionId, ehrId, headingMap.templateId, postData);
    debug('response: %j', responseObj);

    await ehrSessionService.stop(host, sessionId);

    return responseObj && responseObj.compositionUid
      ? {
        ok: true,
        host: host,
        heading: heading,
        compositionUid: responseObj.compositionUid
      }
      : {
        ok: false
      };
  }

  async put(host, patientId, heading, sourceId, data) {
    logger.info('services/headingService|put', { host, patientId, heading, sourceId, data: typeof data });

    debug('data: %j', data);

    const { headingCache } = this.ctx.cache;
    const dbData = await headingCache.bySourceId.get(sourceId);
    if (!dbData) {
      throw new NotFoundError(`No existing ${heading} record found for sourceId: ${sourceId}`);
    }

    const compositionId = dbData.uid;
    if (!compositionId) {
      throw new NotFoundError(`Composition Id not found for sourceId: ${sourceId}`);
    }

    const { jumperService } = this.ctx.services;
    const jumper = jumperService.check(heading, jumperService.put.name);

    if (jumper.ok) {
      return jumperService.put(host, patientId, heading, compositionId, data);
    }

    const headingMap = getHeadingMap(heading, 'post');
    if (!headingMap) {
      throw new UnprocessableEntityError(`heading ${heading} not recognised, or no POST definition available`);
    }

    const { ehrSessionService, patientService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);
    await patientService.getEhrId(host, sessionId, patientId);
    // TODO: ask about ehrId passed to ehrRestService.putHeading

    const helpers = headingHelpers(host, heading, 'post');
    const output = transform(headingMap.transformTemplate, data, helpers);
    const postData = flatten(output);
    const ehrRestService = this.ctx.openehr[host];
    const responseObj = await ehrRestService.putHeading(sessionId, compositionId, headingMap.templateId, postData);
    debug('response: %j', responseObj);

    await ehrSessionService.stop(host, sessionId);

    return responseObj && responseObj.compositionUid
      ? {
        ok: true,
        host: host,
        heading: heading,
        compositionUid: responseObj.compositionUid,
        action: responseObj.action
      }
      : {
        ok: false
      };
  }

  async query(host, patientId, heading) {
    logger.info('services/headingService|query', { host, patientId, heading });

    const { jumperService } = this.ctx.services;
    const jumper = jumperService.check(heading, jumperService.query.name);

    if (jumper.ok) {
      return jumperService.query(host, patientId, heading);
    }

    const { ehrSessionService, patientService } = this.ctx.services;
    const { sessionId } = await ehrSessionService.start(host);
    const ehrId = await patientService.getEhrId(host, sessionId, patientId);

    const aql = getHeadingAql(heading);
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

  async getBySourceId(sourceId, format = ResponseFormat.DETAIL) {
    logger.info('services/headingService|getBySourceId', { sourceId, format });

    let responseObj = {};

    const { headingCache } = this.ctx.cache;
    const dbData = await headingCache.bySourceId.get(sourceId);
    if (!dbData) return responseObj;

    const heading = dbData.heading;
    const headingMap = getHeadingMap(heading, 'get');
    if (!headingMap) {
      throw new UnprocessableEntityError(`heading ${heading} not recognised, or no GET definition available`);
    }

    const { jumperService } = this.ctx.services;
    const jumper = jumperService.check(heading, jumperService.getBySourceId.name);

    const synopsisField = jumper.ok
      ? jumper.synopsisField
      : headingMap.textFieldName;
    const summaryFields  = jumper.ok
      ? jumper.summaryFields
      : headingMap.headingTableFields.slice(0);

    if (dbData.pulsetile) {
      responseObj = dbData.pulsetile;
    }
    else if (jumper.ok && dbData.jumperFormatData) {
      // fetch PulseTile-format data from cache if it hasn't been converted to PulseTile format
      // this will do so and cache it in that format
      responseObj = await jumperService.getBySourceId(sourceId);
    }
    else {
      const host = dbData.host;
      const helpers = headingHelpers(host, heading, 'get');

      responseObj = transform(headingMap.transformTemplate, dbData.data, helpers);
      responseObj.source = dbData.host;
      responseObj.sourceId = sourceId;

      dbData.pulsetile = responseObj;
      await headingCache.bySourceId.get(sourceId, dbData);
    }

    // check if this is a mapped record from discovery
    const { discoveryDb } = this.ctx.db;
    const found = await discoveryDb.checkBySourceId(sourceId);
    if (found) {
      responseObj.source = 'GP';
    }

    // only return the synopsis headings
    if (format === ResponseFormat.SYNOPSIS) {
      return {
        sourceId: sourceId,
        source: responseObj.source,
        text: responseObj[synopsisField] || ''
      };
    }

    // only return the summary headings
    if (format === ResponseFormat.SUMMARY) {
      const resultObj = {};
      const commonSummaryFields = ['source', 'sourceId'];

      [
        ...commonSummaryFields,
        ...summaryFields
      ].forEach(x => resultObj[x] = responseObj[x] || '');

      return resultObj;
    }

    return responseObj;
  }

  async getSummary(patientId, heading) {
    logger.info('services/headingService|getSummary', { patientId, heading });

    const { headingCache } = this.ctx.cache;
    const sourceIds = await headingCache.byHost.getAllSourceIds(patientId, heading);

    const results = await P.mapSeries(sourceIds, x => this.getBySourceId(x, ResponseFormat.SUMMARY));
    const fetchCount = await headingCache.fetchCount.increment(patientId, heading);

    return {
      results,
      fetchCount
    };
  }

  async getSynopses(patientId, headings, limit) {
    logger.info('services/headingService|getSynopses', { patientId, headings, limit });

    const resultObj = {};

    await P.each(headings, async (heading) => {
      const { results } = await this.getSynopsis(patientId, heading, limit);
      resultObj[heading] = results;
    });

    return resultObj;
  }

  async getSynopsis(patientId, heading, limit) {
    logger.info('services/headingService|getSynopsis', { patientId, heading, limit });

    const { headingCache } = this.ctx.cache;
    const sourceIds = await headingCache.byDate.getAllSourceIds(patientId, heading, { limit });

    const results = await P.mapSeries(sourceIds, x => this.getBySourceId(x, ResponseFormat.SYNOPSIS));

    return {
      results
    };
  }

  async fetchMany(patientId, headings) {
    logger.info('services/headingService|fetchMany', { patientId, headings });

    await P.each(headings, heading => this.fetchOne(patientId, heading));

    return {
      ok: true
    };
  }

  async fetchOne(patientId, heading) {
    logger.info('services/headingService|fetchOne', { patientId, heading });

    const hosts = Object.keys(this.ctx.servers);
    await P.each(hosts, host => this.fetch(host, patientId, heading));

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
      const data = await this.query(host, patientId, heading);
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
