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
const { ExecutionContext, logger } = require('../core');

class CacheService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new CacheService(ctx);
  }

  async delete(host, patientId, heading) {
    logger.info('cache/cacheService|delete', { host, patientId, heading });

    const sessions = this.ctx.activeSessions;

    await P.each(sessions, async (session) => {
      const ctx = ExecutionContext.fromQewdSession(this.ctx.worker, session);
      const { headingCache } = ctx.cache;

      await headingCache.deleteAllForHost(patientId, heading, host);
      await headingCache.byHeading.deleteAll(heading);
    });
  }
}

module.exports = CacheService;
