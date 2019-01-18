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
const { GetDemographicsCommand } = require('../../../lib2/commands');
const { BadRequestError } = require('../../../lib2/errors');

describe('ripple-cdr-discovery/lib2/commands/getDemographicsCommand', () => {
  let ctx;
  let session;

  let patientId;

  let cacheService;

  let resourceService;
  let demographicService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    patientId = 5558526784;
    session = {
      role : 'phrUser',
      nhsNumber: 5558526784
    };

    cacheService = ctx.services.cacheService;

    cacheService.getDemographics.and.resolveValue(null);

    resourceService = ctx.services.resourceService;
    demographicService = ctx.services.demographicService;

    ctx.services.freeze();
  });

  it('should call execute command with valid data', async () => {
    const command = new GetDemographicsCommand(ctx, session);
    await command.execute(patientId);

    expect(resourceService.fetchPatients).toHaveBeenCalledWith(patientId);
    expect(resourceService.fetchPatientResources).toHaveBeenCalledWith(patientId, 'Patient');
    expect(demographicService.getByPatientId).toHaveBeenCalledWith(patientId);
  });

  it('should call execute command with not valid patientId', async () => {

    patientId = undefined;
    session.role = 'patient';

    const command = new GetDemographicsCommand(ctx, session);
    const actual = command.execute(patientId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId undefined must be defined'));

  });

  it('should call execute command already cached data', async () => {
    session.role = 'patient';
    const now = new Date().getTime();
    const expected = {
      id: patientId,
      nhsNumber: session.nhsNumber,
      gender: 'female',
      phone : '+44 58584 5475477',
      name: 'Megan',
      dateOfBirth: now,
      gpName: 'Fox',
      gpAddress: 'California',
      address: 'London'
    };
    cacheService.getDemographics.and.resolveValue(expected);
    const command = new GetDemographicsCommand(ctx, session);
    const actual = await command.execute(patientId);

    await expect(actual).toEqual(expected);
  });


});
