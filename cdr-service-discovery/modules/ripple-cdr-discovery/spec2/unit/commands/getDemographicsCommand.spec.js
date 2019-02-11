/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
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

  11 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const { GetDemographicsCommand } = require('../../../lib2/commands');
const { Role } = require('../../../lib2/shared/enums');
const { BadRequestError } = require('../../../lib2/errors');

describe('ripple-cdr-discovery/lib/commands/getDemographicsCommand', () => {
  let ctx;
  let session;
  let patientId;

  let cacheService;
  let resourceService;
  let demographicService;

  function mockDemographicsService(patientId) {
    const responseObj = {
      id: patientId,
      nhsNumber: patientId,
      gender: 'female',
      phone : '+44 58584 5475477',
      name: 'Megan',
      dateOfBirth: 1546300800000,
      gpName: 'Fox',
      gpAddress: 'California',
      address: 'London'
    };
    demographicService.getByPatientId.and.resolveValue(responseObj);
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();

    patientId = 9999999000;
    session = {
      role: 'IDCR',
      nhsNumber: 9999999111
    };

    cacheService = ctx.services.cacheService;
    resourceService = ctx.services.resourceService;
    demographicService = ctx.services.demographicService;

    ctx.services.freeze();
  });

  it('should throw patientId is invalid error', async () => {
    patientId = 'foo';

    const command = new GetDemographicsCommand(ctx, session);
    const actual = command.execute(patientId);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));
  });

  it('should return cached demographics', async () => {
    const expected = {
      id: 9999999000,
      nhsNumber: 9999999000,
      gender: 'female',
      phone : '+44 58584 5475477',
      name: 'Megan',
      dateOfBirth: 1546300800000,
      gpName: 'Fox',
      gpAddress: 'California',
      address: 'London'
    };

    const responseObj = {
      id: 9999999000,
      nhsNumber: 9999999000,
      gender: 'female',
      phone : '+44 58584 5475477',
      name: 'Megan',
      dateOfBirth: 1546300800000,
      gpName: 'Fox',
      gpAddress: 'California',
      address: 'London'
    };
    cacheService.getDemographics.and.resolveValue(responseObj);

    const command = new GetDemographicsCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(cacheService.getDemographics).toHaveBeenCalledWith(patientId);
    expect(actual).toEqual(expected);
  });

  it('should return demographics', async () => {
    const expected = {
      id: 9999999000,
      nhsNumber: 9999999000,
      gender: 'female',
      phone : '+44 58584 5475477',
      name: 'Megan',
      dateOfBirth: 1546300800000,
      gpName: 'Fox',
      gpAddress: 'California',
      address: 'London'
    };

    cacheService.getDemographics.and.resolveValue(null);
    mockDemographicsService(patientId);

    const command = new GetDemographicsCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(cacheService.getDemographics).toHaveBeenCalledWith(9999999000);
    expect(resourceService.fetchPatients).toHaveBeenCalledWith(9999999000);
    expect(resourceService.fetchPatientResources).toHaveBeenCalledWith(9999999000, 'Patient');
    expect(demographicService.getByPatientId).toHaveBeenCalledWith(9999999000);

    expect(actual).toEqual(expected);
  });

  it('should return demographics (phr user)', async () => {
    const expected = {
      id: 9999999111,
      nhsNumber: 9999999111,
      gender: 'female',
      phone : '+44 58584 5475477',
      name: 'Megan',
      dateOfBirth: 1546300800000,
      gpName: 'Fox',
      gpAddress: 'California',
      address: 'London'
    };

    session.role = Role.PHR_USER;

    cacheService.getDemographics.and.resolveValue();
    mockDemographicsService(session.nhsNumber);

    const command = new GetDemographicsCommand(ctx, session);
    const actual = await command.execute(patientId);

    expect(cacheService.getDemographics).toHaveBeenCalledWith(9999999111);
    expect(resourceService.fetchPatients).toHaveBeenCalledWith(9999999111);
    expect(resourceService.fetchPatientResources).toHaveBeenCalledWith(9999999111, 'Patient');
    expect(demographicService.getByPatientId).toHaveBeenCalledWith(9999999111);

    expect(actual).toEqual(expected);
  });
});
