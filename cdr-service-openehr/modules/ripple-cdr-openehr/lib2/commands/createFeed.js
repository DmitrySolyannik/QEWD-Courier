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

'use strict'

const validUrl = require('valid-url');
const { BadRequestError } = require('../errors');
const debug = require('debug')('ripple-cdr-openehr:commands:create-feed');

class CreateFeedCommand {
  constructor(ctx, session) {
    this.ctx = ctx;
    this.session = session;
  }

  async execute(payload) {
    debug('payload: %j', payload);

    if (!payload.author || payload.author === '') {
      throw new BadRequestError('Author missing or empty');
    }

    if (!payload.name || payload.name === '') {
      throw new BadRequestError('Feed name missing or empty');
    }

    if (!payload.landingPageUrl || payload.landingPageUrl === '') {
      throw new BadRequestError('Landing page URL missing or empty');
    }

    if (!validUrl.isWebUri(payload.landingPageUrl)) {
      throw new BadRequestError('Landing page URL is invalid');
    }

    if (!payload.rssFeedUrl || payload.rssFeedUrl === '') {
      throw new BadRequestError('RSS Feed URL missing or empty');
    }

    if (!validUrl.isWebUri(payload.rssFeedUrl)) {
      throw new BadRequestError('RSS Feed URL is invalid');
    }

    const feed = {
      ...payload,
      email: this.session.email
    };
    debug('creating a new feed: %j', feed);

    return await this.ctx.services.feedService(feed);
  }
}

module.exports = CreateFeedCommand;
