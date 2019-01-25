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
    ctx.cache.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = ResourceService.create(ctx);

      expect(actual).toEqual(jasmine.any(ResourceService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  it('should call fetchPatients and cache data', async () => {
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

    patientCache.byNhsNumber.exists.and.resolveValue(false);
    tokenService.get.and.resolveValue(jwt);
    resourceRestService.getPatients.and.resolveValue(data);

    await resourceService.fetchPatients(nhsNumber);
  });

});
