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

const { ExecutionContextMock } = require('../../mocks');
const { GetHeadingDetailCommand } = require('../../../lib2/commands');
const { BadRequestError } = require('../../../lib2/errors');

describe('ripple-cdr-discovery/lib2/commands/getHeadingDetailCommand', () => {
  let ctx;
  let session;

  let patientId;
  let heading;
  let sourceId;

  let resourceService;
  let headingService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    patientId = 5558526784;
    heading = 'vaccinations';
    sourceId = 'eaf394a9-5e05-49c0-9c69-c710c77eda76';
    session = {
      role : 'phrUser',
      nhsNumber: 5558526784
    };

    resourceService = ctx.services.resourceService;
    headingService = ctx.services.headingService;

    ctx.services.freeze();
  });

  it('should call execute command with valid data', async () => {
    const command = new GetHeadingDetailCommand(ctx, session);
    await command.execute(patientId, heading, sourceId);

    expect(resourceService.fetchPatients).toHaveBeenCalledWith(patientId);
    expect(resourceService.fetchPatientResources).toHaveBeenCalledWith(patientId, 'Immunization');
    expect(headingService.getBySourceId).toHaveBeenCalledWith(patientId, heading, sourceId);
  });

  it('should call execute command with not valid patientId', async () => {

    patientId = undefined;
    session.role = 'patient';

    const command = new GetHeadingDetailCommand(ctx, session);
    const actual = command.execute(patientId, heading, sourceId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId undefined must be defined'));

  });

  it('should call execute command with not valid sourceId', async () => {
    sourceId = undefined;
    session.role = 'patient';
    const command = new GetHeadingDetailCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    await expect(actual).toEqual({
      responseFrom: 'discovery_service',
      results: false
    });
  });

  it('should call execute command with not valid heading', async () => {
    heading = 'unknown-heading';
    const command = new GetHeadingDetailCommand(ctx, session);
    const actual = await command.execute(patientId, heading, sourceId);

    await expect(actual).toEqual({
      responseFrom: 'discovery_service',
      results: false
    });
  });


});
