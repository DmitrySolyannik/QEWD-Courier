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
const { TokenCache } = require('../../../lib2/cache');


describe('ripple-cdr-discovery/lib2/cache/tokenCache', () => {
  let ctx;
  let tokenCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['discoveryToken']).setDocument({
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\n'
      + 'eyJpc3MiOiJ0b3B0YWwuY29tIiwiZXhwIjoxNDI2NDIwODAwLCJodHRwOi8vdG9wdGFsLmNvbS9qd3RfY2xhaW1zL2lzX2FkbWluIjp0cnVlLCJjb21wYW55IjoiVG9wdGFsIiwiYXdlc29tZSI6dHJ1ZX0.\n'
      + 'yRQYnWzskCZUxPwaQupWkiUzKELZ49eM7oWxAQK_ZXw',
      createdAt: 1546300800000
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    tokenCache = new TokenCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    ctx.cache.freeze();
  });


  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = TokenCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(TokenCache));
      expect(actual.adapter).toBe(ctx.adapter);
    });
  });

  it('should get token from cache', async () => {
    seeds();
    const expected = {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\n'
      + 'eyJpc3MiOiJ0b3B0YWwuY29tIiwiZXhwIjoxNDI2NDIwODAwLCJodHRwOi8vdG9wdGFsLmNvbS9qd3RfY2xhaW1zL2lzX2FkbWluIjp0cnVlLCJjb21wYW55IjoiVG9wdGFsIiwiYXdlc29tZSI6dHJ1ZX0.\n'
      + 'yRQYnWzskCZUxPwaQupWkiUzKELZ49eM7oWxAQK_ZXw',
      createdAt: 1546300800000
    };
    const actual = await tokenCache.get();

    expect(actual).toEqual(expected);
  });

  it('should set token to cache', async () => {
    const token = {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.\n'
      + 'eyJpc3MiOiJ0b3B0YWwuY29tIiwiZXhwIjoxNDI2NDIwODAwLCJodHRwOi8vdG9wdGFsLmNvbS9qd3RfY2xhaW1zL2lzX2FkbWluIjp0cnVlLCJjb21wYW55IjoiVG9wdGFsIiwiYXdlc29tZSI6dHJ1ZX0.\n'
      + 'yRQYnWzskCZUxPwaQupWkiUzKELZ49eM7oWxAQK_ZXw',
      createdAt: 1546300800000
    };

    await tokenCache.set(token);
    const actual = qewdSession.data.$(['discoveryToken']).getDocument(true);
    expect(actual).toEqual(token);
  });

  it('should delete token from cache', async () => {
    await tokenCache.delete();
    const actual = qewdSession.data.$(['discoveryToken']).getDocument(true);
    expect(actual).toEqual([]);
  });
});
