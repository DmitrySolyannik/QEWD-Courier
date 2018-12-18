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

  16 December 2018

*/

'use strict';

const { lazyLoadAdapter } = require('../shared/utils');
const logger = require('./logger');

const transform = (key) => Array.isArray(key) ? key : key.split(':');

class CacheRegistry {
  constructor(ctx) {
    this.ctx = ctx;
  }

  initialise(id) {
    logger.info('core/cache|initialise', { id });

    const Cache = require(`../cache/${id}`);

    if (!Cache.create) {
      throw new Error(`${id} cache class does not support lazy load initialisation.`);
    }

    return Cache.create(this.ctx);
  }

  exists(key) {
    logger.debug('core/cache|exists', { key });

    const subs = transform(key);

    return this.qewdSession.data.$(subs).exists;
  }

  get(key) {
    logger.debug('core/cache|get', { key });

    const subs = transform(key);

    return this.exists(key) ?
      this.qewdSession.data.$(subs).value :
      null;
  }

  getObject(key) {
    logger.debug('core/cache|getObject', { key });

    const subs = transform(key);

    return this.exists(key) ?
      this.qewdSession.data.$(subs).getDocument() :
      null;
  }

  put(key, value) {
    logger.debug('core/cache|put', { key, value });

    const subs = transform(key);
    this.qewdSession.data.$(subs).value = value;
  }

  putObject(key, value) {
    logger.debug('core/cache|putObject', { key, value });

    const subs = transform(key);
    this.qewdSession.data.$(subs).setDocument(value);
  }

  delete(key) {
    logger.debug('core/cache|delete', { key });

    const subs = transform(key);
    this.qewdSession.data.$(subs).delete();
  }

  static create(ctx) {
    return lazyLoadAdapter(new CacheRegistry(ctx));
  }
}

module.exports = CacheRegistry;
