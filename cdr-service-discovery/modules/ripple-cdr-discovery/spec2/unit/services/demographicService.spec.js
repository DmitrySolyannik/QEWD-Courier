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

  11 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const DemographicService = require('../../../lib2/services/demographicService');

describe('ripple-cdr-discovery/lib2/services/demographicService', () => {
  let ctx;
  let nhsNumber;

  let demographicService;
  let resourceService;

  let demographicCache;
  let discoveryCache;
  let resourceCache;
  let patientCache;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    nhsNumber = 5558526784;

    demographicService = new DemographicService(ctx);
    resourceService = ctx.services.resourceService;

    demographicCache = ctx.cache.demographicCache;
    discoveryCache = ctx.cache.discoveryCache;
    resourceCache = ctx.cache.resourceCache;
    patientCache = ctx.cache.patientCache;

    ctx.cache.freeze();
    ctx.services.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = DemographicService.create(ctx);

      expect(actual).toEqual(jasmine.any(DemographicService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  it('should call getByPatientId and return demographics', async () => {
    const practitioneer = {
      practitionerRole: [
        {
          managingOrganisation: {
            reference : 'practitioneerData'
          }
        }
      ],
      name: 'John Snow'
    };

    const address = {
      address : {
        text: 'California'
      }
    };

    const patient = {
      id: 5558526784,
      nhsNumber: nhsNumber,
      gender: 'female',
      telecom : '+44 58584 5475477',
      name: [
        {
          text: 'Megan'
        }
      ],
      dateOfBirth: '1991-01-01',
      gpName: 'Fox',
      gpAddress: 'California',
      address: 'London'
    };

    patientCache.byNhsNumber.getPatientUuid.and.resolveValue();
    patientCache.byPatientUuid.get.and.resolveValue(patient);
    patientCache.byPatientUuid.getPractitionerUuid.and.resolveValue(5558526785);
    resourceCache.byUuid.get.and.resolveValue(practitioneer);

    resourceService.getOrganisationLocation.and.resolveValue(address);

    await demographicService.getByPatientId(nhsNumber);

    expect(patientCache.byNhsNumber.getPatientUuid).toHaveBeenCalled();
    expect(patientCache.byPatientUuid.get).toHaveBeenCalled();
    expect(patientCache.byPatientUuid.getPractitionerUuid).toHaveBeenCalled();
    expect(resourceCache.byUuid.get).toHaveBeenCalled();
    expect(resourceService.getOrganisationLocation).toHaveBeenCalled();
    expect(discoveryCache.deleteAll).toHaveBeenCalled();
    expect(demographicCache.byNhsNumber.set).toHaveBeenCalled();
  });

  it('should call getByPatientId with array of patient data', async () => {
    const practitioneer = {
      practitionerRole: [
        {
          managingOrganisation: {
            reference : 'practitioneerData'
          }
        }
      ],
      name: 'John Snow'
    };

    const address = {
      address : {
        text: null
      }
    };

    const patient = {
      id: 5558526784,
      nhsNumber: nhsNumber,
      gender: ['M', 'ale'],
      telecom : [
        {
          value: '+44 58584 5475477'
        }
      ],
      name: [
        {
          text: 'Megan'
        }
      ],
      dateOfBirth: '1991-01-01',
      gpName: 'Fox',
      address: 'London'
    };

    patientCache.byNhsNumber.getPatientUuid.and.resolveValue();
    patientCache.byPatientUuid.get.and.resolveValue(patient);
    patientCache.byPatientUuid.getPractitionerUuid.and.resolveValue(5558526785);
    resourceCache.byUuid.get.and.resolveValue(practitioneer);

    resourceService.getOrganisationLocation.and.resolveValue(address);

    await demographicService.getByPatientId(nhsNumber);

    expect(patientCache.byNhsNumber.getPatientUuid).toHaveBeenCalled();
    expect(patientCache.byPatientUuid.get).toHaveBeenCalled();
    expect(patientCache.byPatientUuid.getPractitionerUuid).toHaveBeenCalled();
    expect(resourceCache.byUuid.get).toHaveBeenCalled();
    expect(resourceService.getOrganisationLocation).toHaveBeenCalled();
    expect(discoveryCache.deleteAll).toHaveBeenCalled();
    expect(demographicCache.byNhsNumber.set).toHaveBeenCalled();
  });
});
