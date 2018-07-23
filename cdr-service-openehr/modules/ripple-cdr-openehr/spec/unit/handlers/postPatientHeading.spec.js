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

  19 July 2018

*/

'use strict';

const mockery = require('mockery');
const Worker = require('../../mocks/worker');

describe('ripple-cdr-openehr/lib/handlers/postPatientHeading', () => {
  let postPatientHeading;

  let q;
  let args;
  let finished;

  let postHeading;

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

    args = {
      patientId: 9999999000,
      heading: 'procedures',
      req: {
        qewdSession: q.sessions.create('app'),
        query: {},
        body: {
          foo: 'bar'
        }
      },
      session: {
        nhsNumber: 9434765919,
        role: 'IDCR'
      }
    };
    finished = jasmine.createSpy();

    postHeading = jasmine.createSpy();
    mockery.registerMock('../src/postHeading', postHeading);

    delete require.cache[require.resolve('../../../lib/handlers/postPatientHeading')];
    postPatientHeading = require('../../../lib/handlers/postPatientHeading');
  });

  afterEach(() => {
    mockery.deregisterAll();
    q.db.reset();
  });

  it('should return invalid or missing patientId error', () => {
    args.patientId = 'foo';

    postPatientHeading.call(q, args, finished);

    expect(finished).toHaveBeenCalledWith({
      error: 'patientId foo is invalid'
    });
  });

  it('should return invalid or missing heading error', () => {
    args.heading = 'bar';

    postPatientHeading.call(q, args, finished);

    expect(finished).toHaveBeenCalledWith({
      error: 'Invalid or missing heading: bar'
    });
  });

  it('should return no body content was sent for heading error', () => {
    args.req.body = [];

    postPatientHeading.call(q, args, finished);

    expect(finished).toHaveBeenCalledWith({
      error: 'No body content was posted for heading procedures'
    });
  });

  it('should post patient heading with pulsetile format', () => {
    const expectedData = {
      format: 'pulsetile',
      data: {
        foo: 'bar'
      }
    };

    postHeading.and.callFake((patientId, heading, data, session, callback) => {
      callback({quux: 'bar'});
    });

    postPatientHeading.call(q, args, finished);

    expect(postHeading).toHaveBeenCalledWithContext(
      q, 9999999000, 'procedures', expectedData, args.req.qewdSession, jasmine.any(Function)
    );
    expect(finished).toHaveBeenCalledWith({quux: 'bar'});
  });

  it('should post patient heading with openehr-jumper format', () => {
    const expectedData = {
      format: 'openehr-jumper',
      data: {
        foo: 'bar'
      }
    };

    postHeading.and.callFake((patientId, heading, data, session, callback) => {
      callback({quux: 'bar'});
    });

    args.req.query.format = 'openehr-jumper';
    postPatientHeading.call(q, args, finished);

    expect(postHeading).toHaveBeenCalledWithContext(
      q, 9999999000, 'procedures', expectedData, args.req.qewdSession, jasmine.any(Function)
    );
    expect(finished).toHaveBeenCalledWith({quux: 'bar'});
  });

  it('should override patientId for PHR users', () => {
    const expectedData = {
      format: 'pulsetile',
      data: {
        foo: 'bar'
      }
    };

    args.session.role = 'phrUser';

    postPatientHeading.call(q, args, finished);

    expect(postHeading).toHaveBeenCalledWithContext(
      q, 9434765919, 'procedures', expectedData, args.req.qewdSession, jasmine.any(Function)
    );
  });
});