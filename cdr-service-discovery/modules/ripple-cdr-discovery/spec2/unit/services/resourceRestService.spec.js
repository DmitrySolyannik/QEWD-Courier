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
const ResourceRestService = require('../../../lib2/services/resourceRestService');
const nock = require('nock');

describe('ripple-cdr-discovery/lib2/services/resourceRestService', () => {
  let ctx;
  let body;
  let patientId;
  let token;

  let resourceRestService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    patientId = 5558526784;

    resourceRestService = new ResourceRestService(ctx, ctx.serversConfig.api);

    body = 'nhsNumber=5558526784';
    token = 'testTOken';
  });

  it('should call getPatients()', async () => {
    const expected = [{
      patientId: 5558526785,
      name: 'Patient#1'
    }, {
      patientId: 5558526786,
      name: 'Patient#2'
    }];

    nock('https://deveds.endeavourhealth.net/data-assurance')
      .get(`/api/fhir/patients?${body}`)
      .reply(200, expected);
    const actual = await resourceRestService.getPatients(patientId, token);
    expect(nock).toHaveBeenDone();
    expect(actual).toEqual(expected);
  });

  it('should call getPatients() with error', async () => {
    const expected = {
      'message': 'Error while trying to patients',
      'code': 503
    };

    nock('https://deveds.endeavourhealth.net/data-assurance')
      .get(`/api/fhir/patients?${body}`)
      .replyWithError(expected);
    try {
      await resourceRestService.getPatients(patientId, token);
    } catch (err) {
      expect(err).toEqual(expected);
    }
    expect(nock).toHaveBeenDone();

  });

  it('should call getPatientResource()', async () => {

    const data = {
      resource: 'Bundle',
      patients: ''
    };

    nock('https://deveds.endeavourhealth.net/data-assurance')
      .get(`/api/fhir/patients?${body}`)
      .reply(200, data);

    await resourceRestService.getPatientResources(patientId, token , token);
    expect(nock).toHaveBeenDone();

  });

});
