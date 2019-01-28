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

  12 January 2018

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const TokenService = require('../../../lib2/services/tokenService');
const { BadRequestError } = require('../../../lib2/errors');

describe('ripple-cdr-discovery/lib2/services/tokenService', () => {
  let ctx;


  let authRestService;
  let tokenService;
  let tokenCache;

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    tokenService = new TokenService(ctx);
    tokenCache = ctx.cache.tokenCache;
    authRestService = ctx.services.authRestService;

    ctx.services.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = TokenService.create(ctx, ctx.serversConfig.api);

      expect(actual).toEqual(jasmine.any(TokenService));
      expect(actual.ctx).toBe(ctx);
    });
  });


  it('should call get token if already exists in cache', async () => {
    const now = Date.now();
    const expected = {
      createdAt: now,
      jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
      + 'eyJpc3MiOiJ0b3B0YWwuY29tIiwiZXhwIjoxNDI2NDIwODAwLCJodHRwOi8vdG9wdGFsLmNvbS9qd3RfY2xhaW1zL2lzX2FkbWluIjp0cnVlLCJjb21wYW55IjoiVG9wdGFsIiwiYXdlc29tZSI6dHJ1ZX0.'
      + 'yRQYnWzskCZUxPwaQupWkiUzKELZ49eM7oWxAQK_ZXw'
    };
    tokenCache.get.and.resolveValue(expected);
    const actual = await tokenService.get();
    expect(actual).toEqual(expected.jwt);
  });

  it('should call authRestService.authenticate', async () => {
    const expected = {
      createdAt: Date.now(),
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
      + 'eyJpc3MiOiJ0b3B0YWwuY29tIiwiZXhwIjoxNDI2NDIwODAwLCJodHRwOi8vdG9wdGFsLmNvbS9qd3RfY2xhaW1zL2lzX2FkbWluIjp0cnVlLCJjb21wYW55IjoiVG9wdGFsIiwiYXdlc29tZSI6dHJ1ZX0.'
      + 'yRQYnWzskCZUxPwaQupWkiUzKELZ49eM7oWxAQK_ZXw'
    };

    tokenCache.get.and.resolveValue(null);
    authRestService.authenticate.and.resolveValue(expected);
    const actual = await tokenService.get();
    expect(actual).toEqual(expected.access_token);
  });

  it('should call get token with error', async () => {
    tokenCache.get.and.resolveValue(null);
    authRestService.authenticate.and.resolveValue(undefined);
    const actual = tokenService.get();
    await expectAsync(actual).toBeRejectedWith(new BadRequestError('Cannot read property \'access_token\' of undefined'));
  });

  it('should call authenticate with already valid token and date', async () => {
    const expected = {
      createdAt: Date.now() - 51000,
      jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
      + 'eyJpc3MiOiJ0b3B0YWwuY29tIiwiZXhwIjoxNDI2NDIwODAwLCJodHRwOi8vdG9wdGFsLmNvbS9qd3RfY2xhaW1zL2lzX2FkbWluIjp0cnVlLCJjb21wYW55IjoiVG9wdGFsIiwiYXdlc29tZSI6dHJ1ZX0.'
      + 'yRQYnWzskCZUxPwaQupWkiUzKELZ49eM7oWxAQK_ZXw'
    };

    tokenCache.get.and.resolveValue(expected);
    authRestService.authenticate.and.resolveValue(expected);
    const actual = await tokenService.get();
    expect(actual).toEqual(expected.jwt);
  });

  it('should call authenticate with already valid token', async () => {
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.'
      + 'eyJpc3MiOiJ0b3B0YWwuY29tIiwiZXhwIjoxNDI2NDIwODAwLCJodHRwOi8vdG9wdGFsLmNvbS9qd3RfY2xhaW1zL2lzX2FkbWluIjp0cnVlLCJjb21wYW55IjoiVG9wdGFsIiwiYXdlc29tZSI6dHJ1ZX0.'
      + 'yRQYnWzskCZUxPwaQupWkiUzKELZ49eM7oWxAQK_ZXw';

    const expectedToken = {
      createdAt: 5500,
      jwt: jwt
    };

    const expected = {
      createdAt: 5500,
      access_token: jwt
    };

    tokenCache.get.and.resolveValue(expectedToken);
    authRestService.authenticate.and.resolveValue(expected);
    const actual = await tokenService.get();
    expect(actual).toEqual(jwt);
  });
});
