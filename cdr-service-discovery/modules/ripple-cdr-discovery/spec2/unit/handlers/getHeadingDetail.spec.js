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

  18 December 2018

*/

'use strict';

const mockery = require('mockery');
const { ExecutionContextMock } = require('../../mocks');
// const { GetHeadingDetailCommand } = require('../../../lib2/commands');

describe('ripple-cdr-discovery/lib2/handlers/getHeadingDetail', () => {
  let args;
  let finished;


  let handler;

  beforeAll(() => {
    mockery.enable({
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  beforeEach(() => {
    args = {
      heading: 'procedures',
      patientId: 9999999000,
      sourceId: 'Discovery-MedicationStatement/eaf394a9-5e05-49c0-9c69-c710c77eda76',
      req: {
        ctx: new ExecutionContextMock(),
      },
      session: {
        nhsNumber: 9999999000,
        email: 'john.doe@example.org'
      }
    };
    finished = jasmine.createSpy();

    delete require.cache[require.resolve('../../../lib2/handlers/getHeadingDetail')];
    handler = require('../../../lib2/handlers/getHeadingDetail');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should return response object', async () => {
    await handler(args, finished);
  });

  it('should call auth', async () => {
    await handler(args, finished);
    // const command = new GetHeadingDetailCommand(ctx, session);
    // const actual = command.execute(patientId, heading, sourceId);
  });

});
