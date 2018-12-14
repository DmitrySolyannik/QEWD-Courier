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

'use strict';

const debug = require('debug')('ripple-cdr-openehr:db:phr-feed');

class PhrFeedDb {
  constructor(ctx) {
    this.ctx = ctx;
    this.phrFeeds = ctx.worker.db.use('PHRFeeds');
  }

  static create(ctx) {
    return new PhrFeedDb(ctx);
  }

  /**
   * Gets phr feed by source id
   *
   * @param  {string|int} sourceId
   * @return {Promise.<Object|null>}
   */
  async getBySourceId(sourceId) {
    debug('get phr feed by source id %s', sourceId);
    const node = this.phrFeeds.$(['bySourceId', sourceId]);

    return node.exists ?
      node.getDocument() :
      null;
  }

  /**
   * Gets phr feed by name
   *
   * @param  {string} email
   * @param  {string} name
   * @return {Promise.<Object|null>}
   */
  async getByName(email, name) {
    let dbFeed = null;

    debug('get phr feed by %s name for %s', name, email);

    const byEmailNode = this.phrFeeds.$(['byEmail', email]);
    const bySourceIdNode = this.phrFeeds.$('bySourceId');

    if (byEmailNode.exists) {
      byEmailNode.forEachChild((sourceId) => {
        const data = bySourceIdNode.$(sourceId).getDocument();
        if (data.name === name) {
          dbFeed = data;

          return true; // stop loop
        }
      });
    }

    return dbFeed;
  }

  /**
   * Gets phr feed by landing page url
   *
   * @param  {string} email
   * @param  {string} landingPageUrl
   * @return {Promise.<Object|null>}
   */
  async getByLandingPageUrl(email, landingPageUrl) {
    let dbFeed = null;

    debug('get phr feed by %s landing url for %s', landingPageUrl, email);

    const byEmailNode = this.phrFeeds.$(['byEmail', email]);
    const bySourceIdNode = this.phrFeeds.$('bySourceId');

    if (byEmailNode.exists) {
      byEmailNode.forEachChild((sourceId) => {
        const data = bySourceIdNode.$(sourceId).getDocument();
        if (data.landingPageUrl === landingPageUrl) {
          dbFeed = data;

          return true; // stop loop
        }
      });
    }

    return dbFeed;
  }

  /**
   * Gets phr feeds by email
   *
   * @param  {string} email
   * @return {Promise.<Object[]>}
   */
  async getByEmail(email) {
    debug('get phr feeds by % email', email);

    const names = {};
    const urls = {};
    const dbFeeds = [];

    const byEmailNode = this.phrFeeds.$(['byEmail', email]);
    const bySourceIdNode = this.phrFeeds.$('bySourceId');

    if (byEmailNode.exists) {
      byEmailNode.forEachChild((sourceId) => {
        const dbData = bySourceIdNode.$(sourceId).getDocument();

        // duplicate - delete it
        if (names[dbData.name]) {
          debug('duplicate phr feed found by name', dbData.name);
          byEmailNode.$(sourceId).delete();
          bySourceIdNode.$(sourceId).delete();
          return;
        }

        // duplicate found - delete it
        if (urls[dbData.landingPageUrl]) {
          debug('duplicate phr feed found by landing page url', dbData.landingPageUrl);
          byEmailNode.$(sourceId).delete();
          bySourceIdNode.$(sourceId).delete();
          return;
        }

        names[dbData.name] = true;
        urls[dbData.landingPageUrl] = true;

        dbFeeds.push({
          ...dbData,
          sourceId
        });
      });
    }

    return dbFeeds;
  }

  /**
   * Inserts a new feed
   *
   * @param  {Object} dbFeed
   * @return {Promise}
   */
  async insert(dbFeed) {
    debug('insert a new phr feed %j', dbFeed);
    this.phrFeeds.$(['byEmail', dbFeed.email, dbFeed.sourceId]).value = 'true';
    this.phrFeeds.$(['bySourceId', dbFeed.sourceId]).setDocument(dbFeed);
  }
}

module.exports = PhrFeedDb;
