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

  17 July 2018

*/

'use strict';

const mockery = require('mockery');
const Worker = require('../../mocks/worker');

describe('ripple-cdr-openehr/lib/src/getHeadingDetailFromCache', () => {
  let getHeadingDetailFromCache;
  let getHeadingBySourceId;

  let q;
  let sourceId;
  let session;

  beforeAll(() => {
    mockery.enable({
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  beforeEach(() => {
    q = new Worker();

    sourceId = '2c9a7b22-4cdd-484e-a8b5-759a70443be3';
    session = q.sessions.create('app');

    getHeadingBySourceId = jasmine.createSpy();
    mockery.registerMock('./getHeadingBySourceId', getHeadingBySourceId);
    delete require.cache[require.resolve('../../../lib/src/getHeadingDetailFromCache')];
    getHeadingDetailFromCache = require('../../../lib/src/getHeadingDetailFromCache');
  });

  afterEach(() => {
    mockery.deregisterAll();
    q.db.reset();
  });

  xit('should call getHeadingBySourceId with correct parameters', () => {
    const expected = {foo: 'bar'};

    const output = {foo: 'bar'};
    getHeadingBySourceId.and.returnValue(output);

    const actual = getHeadingDetailFromCache.call(q, sourceId, session);

    expect(getHeadingBySourceId).toHaveBeenCalledWithContext(q, sourceId, session, 'detail');
    expect(actual).toEqual(expected);
  });
});
