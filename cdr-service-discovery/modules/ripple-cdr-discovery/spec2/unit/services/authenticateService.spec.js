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

  19 December 2018

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const AuthService = require('../../../lib2/services/authenticateService');

describe('ripple-cdr-discovery/lib/services/authService', () => {
  let ctx;
  let authService;
  let args;

  let tokenCache;



  beforeEach(() => {
    ctx = new ExecutionContextMock();
    authService = new AuthService(ctx);
    tokenCache = ctx.cache.tokenCache;
    ctx.cache.freeze();
    args = {
      session : {
        email: 'jon.snow@example.com',
        password: 'p@$$w0rd'
      }
    };
  });

  // describe('#create (static)', () => {
  //   it('should initialize a new instance', async () => {
  //     const actual = tokenCache.create(ctx.adapter);
  //
  //     expect(actual).toEqual(jasmine.any(tokenCache));
  //     expect(actual.adapter).toBe(ctx.adapter);
  //   });
  // });

  fit('should call authService', async () => {
    tokenCache.get.and.resolveValue({
     jwt: 'some-token'
    });
    //@TODO Mock login method
    await authService.login(args.session);
  });
});
