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

const debug = require('debug')('ripple-cdr-openehr:db:feed');

class FeedDb {
  constructor(ctx) {
    this.ctx = ctx;
    this.phrFeeds = ctx.worker.db.use('PHRFeeds');
  }

  static create(ctx) {
    return new FeedDb(ctx);
  }

  async getByName(email, name) {
    let feed = null;

    const feedsByEmail = this.phrFeeds.$(['byEmail', email]);
    const feedsBySourceId = this.phrFeeds.$('bySourceId');

    if (feedsByEmail.exists) {
      feedsByEmail.forEachChild((sourceId) => {
        const data = feedsBySourceId.$(sourceId).getDocument();
        if (data.name === name) {
          feed = data;

          return true; // stop loop
        }
      });
    }

    return feed;
  }

  async getByLandingPageUrl(email, landingPageUrl) {
    let feed = null;

    const feedsByEmail = this.phrFeeds.$(['byEmail', email]);
    const feedsBySourceId = this.phrFeeds.$('bySourceId');

    if (feedsByEmail.exists) {
      feedsByEmail.forEachChild((sourceId) => {
        const data = feedsBySourceId.$(sourceId).getDocument();
        if (data.landingPageUrl === landingPageUrl) {
          feed = data;

          return true; // stop loop
        }
      });
    }

    return feed;
  }

  async insert(feed) {
    this.phrFeeds.$(['byEmail', feed.email, feed.sourceId]).value = 'true';
    this.phrFeeds.$(['bySourceId', feed.sourceId]).setDocument(feed);
  }
}

module.exports = FeedDb;
