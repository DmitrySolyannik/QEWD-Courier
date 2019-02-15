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

 11 February 2019

*/

'use strict';

const mockery = require('mockery');
const router = require('qewd-router');
const { ExecutionContext } = require('../../lib2/core');
const { ExecutionContextMock, Worker } = require('../mocks');

describe('ripple-cdr-openehr/lib/index', () => {
  let q;
  let target;

  function loadModule() {
    delete require.cache[require.resolve('../../lib2')];

    return require('../../lib2');
  }

  beforeAll(() => {
    mockery.enable({
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  describe('init', () => {
    let routes;

    beforeAll(() => {
      delete require.cache[require.resolve('../../lib2/routes')];
      routes = require('../../lib2/routes');
    });

    beforeEach(() => {
      spyOn(router, 'addMicroServiceHandler');
    });

    it('should add microservice handlers', () => {
      target = loadModule();
      target.init.call(q);

      expect(router.addMicroServiceHandler).toHaveBeenCalledWith(routes, target);
    });
  });

  describe('beforeMicroServiceHandler', () => {
    let req;
    let finished;
    let ctx;

    beforeEach(() => {
      q = new Worker();

      req = {
        session: {
          role: 'admin'
        }
      };
      finished = jasmine.createSpy();

      ctx = new ExecutionContextMock(q);
      spyOn(ExecutionContext, 'fromRequest').and.returnValue(ctx);

      target = loadModule();
    });

    afterEach(() => {
      q.db.reset();
    });

    it('should return true when authorization is successful', () => {
      const expected = true;

      q.jwt.handlers.validateRestRequest.and.returnValue(true);

      const actual = target.beforeMicroServiceHandler.call(q, req, finished);

      expect(q.jwt.handlers.validateRestRequest).toHaveBeenCalledWithContext(q, req, finished);
      expect(req.ctx).toBeDefined();

      expect(actual).toEqual(expected);
    });

    it('should return false when authorization is failed', async () => {
      const expected = false;

      q.jwt.handlers.validateRestRequest.and.returnValue(false);

      const actual = target.beforeMicroServiceHandler.call(q, req, finished);

      expect(q.jwt.handlers.validateRestRequest).toHaveBeenCalledWithContext(q, req, finished);
      expect(req.ctx).toBeUndefined();

      expect(actual).toEqual(expected);
    });

  });

});
