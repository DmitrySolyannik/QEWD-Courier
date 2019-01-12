/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple Discovery Interface                         |
 |                                                                          |
 | Copyright (c) 2017-19 Ripple Foundation Community Interest Company       |
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

  12 January 2018

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const AuthService = require('../../../lib2/services/authenticateService');
const { TokenCache } = require('../../../lib2/cache');

describe('ripple-cdr-discovery/lib/services/authService', () => {
  let ctx;
  let authService;
  let args;

  let actualTokenCache;

  let tokenCache;


  beforeEach(() => {
    ctx = new ExecutionContextMock();
    actualTokenCache = new TokenCache(ctx.adapter);
    authService = new AuthService(ctx);
    tokenCache = ctx.cache.tokenCache;
    ctx.cache.freeze();
    args = {
      session: {
        email: 'jon.snow@example.com',
        password: 'p@$$w0rd'
      }
    };
  });

  describe('#create (static)', () => {
    fit('should initialize a new instance', async () => {
      const actual = actualTokenCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(actualTokenCache));
      expect(actual.adapter).toBe(ctx.adapter);
    });
  });

  fit('should call authService with token', async () => {
    tokenCache.get.and.resolveValue({
      jwt: 'some-token',
      createdAt: Date.now()
    });
    await authService.login(args.session);
  });

  fit('should call authService without token', async () => {
    tokenCache.get.and.resolveValue({
      createdAt: Date.now()
    });
    await authService.login(args.session);
  });
});
