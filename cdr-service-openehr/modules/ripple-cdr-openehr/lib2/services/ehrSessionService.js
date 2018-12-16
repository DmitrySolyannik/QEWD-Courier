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

'use strict';


const { logger } = require('../core');
const { EhrSessionError } = require('../errors');
const debug = require('debug')('ripple-cdr-openehr:services:ehr-session');

class EhrSessionService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new EhrSessionService(ctx);
  }

  /**
   * Start ehr session
   *
   * @param  {string} host
   * @param  {bool} options.enableCaching
   * @return {Promise.<Object>}
   */
  async start(host, { enableCaching = true }) {
    logger.info('services/ehrSessionService|start', { host });

    //TODO: return session if exists

    const data = await this.ctx.openehr[host].startSession();

    if (!data || !data.sessionId) {
      logger.error('start session response was unexpected', data);
      throw new EhrSessionError(`Unable to establish a session with ${host}`);
    }

    if (enableCaching) {
      const session = {
        creationTime: new Date().getTime(),
        id: data.sessionId
      };

      await this.ctx.cache.sessionCache.set(host, session);
      debug('session %s for %s host has been cached', host, data.sessionId);
    }

    return {
      sessionId: data.sessionId
    };
  }

  async stop() {
    logger.info('services/ehrSessionService|stop');
  }
}

module.exports = EhrSessionService;
