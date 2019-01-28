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
const ResourceService = require('../../../lib2/services/resourceService');

describe('ripple-cdr-discovery/lib2/services/resourceService', () => {
  let ctx;
  let nhsNumber;

  let resourceService;
  let tokenService;
  let resourceRestService;

  let patientCache;


  beforeEach(() => {
    ctx = new ExecutionContextMock();
    nhsNumber = 5558526784;

    resourceService = new ResourceService(ctx);

    patientCache = ctx.cache.patientCache;

    tokenService = ctx.services.tokenService;
    resourceRestService = ctx.services.resourceRestService;

    ctx.cache.freeze();
  });

  function seeds() {
    const jwt = {
      jwt: 'jwt-token',
      createdAt: new Date().getTime()
    };
    const data = {
      entry: [
        {
          resource: {
            patient : {
              id: 5558526785
            }
          }
        },
        {
          resource: {
            patient : {
              id: 5558526786
            }
          }
        },
        {
          resource: {
            patient : {
              id: 5558526787
            }
          }
        }
      ]
    };

    return { jwt, data };
  }

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = ResourceService.create(ctx);

      expect(actual).toEqual(jasmine.any(ResourceService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  it('should call fetchPatients and cache data', async () => {
    const { jwt , data } = seeds();

    patientCache.byNhsNumber.exists.and.resolveValue(false);
    tokenService.get.and.resolveValue(jwt);
    resourceRestService.getPatients.and.resolveValue(data);
    patientCache.byPatientUuid.exists.and.resolveValue(false);
    patientCache.byPatientUuid.set.and.resolveValue();
    patientCache.byPatientUuid.setNhsNumber.and.resolveValue();
    patientCache.byNhsNumber.setPatientUuid.and.resolveValue();

    await resourceService.fetchPatients(nhsNumber);

    expect(patientCache.byNhsNumber.exists).toHaveBeenCalled();
    expect(tokenService.get).toHaveBeenCalled();
    expect(resourceRestService.getPatients).toHaveBeenCalled();
    expect(patientCache.byPatientUuid.set).toHaveBeenCalled();
    expect(patientCache.byPatientUuid.setNhsNumber).toHaveBeenCalled();
    expect(patientCache.byNhsNumber.setPatientUuid).toHaveBeenCalled();
  });

  it('should call fetchPatients with existing patient cache', async () => {
    patientCache.byNhsNumber.exists.and.resolveValue(true);

    const actual = await resourceService.fetchPatients(nhsNumber);

    expect(patientCache.byNhsNumber.exists).toHaveBeenCalled();
    expect(actual).toEqual({
      ok: false
    });
  });

  it('should call fetchPatients with existing cache by patient uuid', async() => {
    const { jwt , data } = seeds();
    patientCache.byNhsNumber.exists.and.resolveValue(false);
    tokenService.get.and.resolveValue(jwt);
    resourceRestService.getPatients.and.resolveValue(data);
    patientCache.byPatientUuid.exists.and.resolveValue(true);

    await resourceService.fetchPatients(nhsNumber);

    expect(patientCache.byNhsNumber.exists).toHaveBeenCalled();
    expect(tokenService.get).toHaveBeenCalled();
    expect(resourceRestService.getPatients).toHaveBeenCalled();
    expect(patientCache.byPatientUuid.exists).toHaveBeenCalled();

  });

});
