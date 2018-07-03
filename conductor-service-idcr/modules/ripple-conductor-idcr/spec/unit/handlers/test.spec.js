/*

 ----------------------------------------------------------------------------
 | ripple-admin: Ripple User Administration MicroService                    |
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

  3 July 2018

*/

'use strict';
const Worker = require('../../mocks/worker');
const handler = require('../../../lib/handlers/test');

describe('ripple-conductor-idcr/lib/handlers/test', () => {
  let q;
  let args;
  let finished;

  beforeEach(() => {
    q = new Worker();

    args = {};
    finished = jasmine.createSpy();
  });

  afterEach(() => {
    q.db.reset();
  });

  it('should respond with correct response', () => {
    handler.call(q, args, finished);

    expect(finished).toHaveBeenCalledWith({
      ok: true,
      api: 'test'
    });
  });
});
