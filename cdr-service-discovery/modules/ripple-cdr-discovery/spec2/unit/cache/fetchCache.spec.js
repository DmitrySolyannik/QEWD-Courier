/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the 'License');          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an 'AS IS' BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  31 December 2018

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const { FetchCache } = require('../../../lib2/cache');


describe('ripple-cdr-discovery/lib2/cache/fetchCache', () => {
  let ctx;
  let fetchCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['fetchingResource', 'foo-bar']).setDocument({
      foo: 'bar'
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    fetchCache = new FetchCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    ctx.cache.freeze();
  });


  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = FetchCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(FetchCache));
      expect(actual.adapter).toBe(ctx.adapter);
    });
  });

  it('should check if bundle cache exists', async () => {
    seeds();
    const actual = await fetchCache.exists('foo-bar');

    expect(actual).toEqual(true);
  });

  it('should remove data from cache', async () => {
    await fetchCache.deleteAll();
    const actual = qewdSession.data.$(['fetchingResource', 'foo-bar']).exists;
    expect(actual).toEqual(false);
  });

});
