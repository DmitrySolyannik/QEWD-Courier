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
const AuthRestService = require('../../../lib2/services/authRestService');
const { TokenCache } = require('../../../lib2/cache');
const nock = require('nock');

describe('ripple-cdr-discovery/lib/services/authRestService', () => {
  let ctx;
  let body;
  let authService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    body = 'username=xxxxxxx&password=yyyyyyyyyyyyyyy&client_id=eds-data-checker&grant_type=password';

    authService = new AuthRestService(ctx, ctx.serversConfig.auth);
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = new TokenCache(ctx.adapter);

      expect(actual).toEqual(jasmine.any(TokenCache));
      expect(actual.adapter).toBe(ctx.adapter);
    });
  });

  it('should call authService.authenticate() for token', async () => {
    const now = Date.now();
    const expected = {
      jwt: 'some-token',
      createdAt: now
    };
    nock('https://devauth.endeavourhealth.net')
      .post('/auth/realms/endeavour/protocol/openid-connect/token', body)
      .reply(200, {
        jwt: 'some-token',
        createdAt: now
      });
    const actual = await authService.authenticate();
    expect(nock).toHaveBeenDone();
    expect(actual).toEqual(expected);
  });

  it('should call authService.authenticate() with error', async () => {
    const expected = {
      'message': 'Error while trying to get auth token',
      'code': 401
    };

    nock('https://devauth.endeavourhealth.net')
      .post('/auth/realms/endeavour/protocol/openid-connect/token', body)
      .replyWithError({
        'message': 'Error while trying to get auth token',
        'code': 401
      });
    try {
      await authService.authenticate();
    } catch (err) {
      expect(err).toEqual(expected);
    }
    expect(nock).toHaveBeenDone();
  });
});
