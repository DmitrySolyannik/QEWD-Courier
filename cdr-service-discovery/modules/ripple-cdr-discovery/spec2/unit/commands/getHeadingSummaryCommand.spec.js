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
const { GetHeadingSummaryCommand } = require('../../../lib2/commands');
const { BadRequestError } = require('../../../lib2/errors');

describe('ripple-cdr-discovery/lib2/commands/getHeadingSummaryCommand', () => {
  let ctx;
  let session;

  let patientId;
  let heading;

  let resourceService;
  let headingService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    patientId = 5558526784;
    heading = 'vaccinations';
    session = {
      role : 'phrUser',
      nhsNumber: 5558526784
    };

    resourceService = ctx.services.resourceService;
    headingService = ctx.services.headingService;

    ctx.services.freeze();
  });

  it('should call execute command with valid data', async () => {
    const expected = {
    responseFrom: 'discovery_service',
    results: [{
      'vaccinationName': 'Rotavirus',
      'comment': 'Vaccination for 18 yrs old patient',
      'series': 'Inactivated poliovirus',
      'vaccinationDateTime': new Date().getTime(),
      'author': 'Dr. House',
      'dateCreated': new Date().getTime(),
      'source': 'openEHR_to_Pulsetile.json',
      'sourceId': 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
      'patientId': patientId
    },
      {
        'vaccinationName': 'Varicella',
        'comment': 'Vaccination for 20 yrs old patient',
        'series': 'Influenza',
        'vaccinationDateTime': new Date().getTime(),
        'author': 'Dr. Wilson',
        'dateCreated': new Date().getTime(),
        'source': 'openEHR_to_Pulsetile.json',
        'sourceId': 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
        'patientId': patientId
      }]
  };

    headingService.getSummary.and.resolveValue(expected.results);

    const command = new GetHeadingSummaryCommand(ctx, session);
    const actual = await command.execute(patientId, heading);

    expect(resourceService.fetchPatients).toHaveBeenCalledWith(patientId);
    expect(resourceService.fetchPatientResources).toHaveBeenCalledWith(patientId, 'Immunization');
    expect(headingService.getSummary).toHaveBeenCalledWith(patientId, heading);
    expect(actual).toEqual(expected);
  });

  it('should call execute command with not valid patientId', async () => {

    patientId = 'pId';
    session.role = 'patient';

    const command = new GetHeadingSummaryCommand(ctx, session);
    const actual = command.execute(patientId, heading);

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId pId is invalid'));

  });

  it('should call execute command with not valid heading', async () => {
    heading = undefined;
    session.role = 'patient';
    const command = new GetHeadingSummaryCommand(ctx, session);
    const actual = await command.execute(patientId, heading);

    await expect(actual).toEqual({
      responseFrom: 'discovery_service',
      results: []
    });
  });


});
