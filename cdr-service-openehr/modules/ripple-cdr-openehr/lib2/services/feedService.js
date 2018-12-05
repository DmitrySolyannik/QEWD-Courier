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

  5 December 2018

*/

'use strict';

const uuid = require('uuid/v4');

class FeedService() {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new FeedService(ctx);
  }

  async create(feed) {
    const { feedDb } = this.ctx.db;

    const feedFoundByName = await feedDb.getByName(feed.email, feed.name)
    if (feedFoundByName) {
      return feedFoundByName.sourceId;
    }

    const feedFoundByUrl = await feedDb.getByLandingPageUrl(feed.email, feed.landingPageUrl)
    if (feedFoundByUrl) {
      return feedFoundByUrl.sourceId;
    }

    const sourceId = uuid();
    const now = new Date().getTime();
    const newFeed = {
      ...feed,
      sourceId,
      dateCreated: now
    };

    await feedDb.insert(newFeed);

    return sourceId;
  }
}

module.exports = FeedService;
