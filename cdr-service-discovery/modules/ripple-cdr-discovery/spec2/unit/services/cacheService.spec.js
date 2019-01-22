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
const CacheService = require('../../../lib2/services/cacheService');
const { BadRequestError } = require('../../../lib2/errors');

describe('ripple-cdr-discovery/lib2/services/cacheService', () => {
  let ctx;
  let nhsNumber;
  let patientId;

  let cacheService;
  let demographicCache;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    nhsNumber = 5558526784;
    patientId = 5558526784;

    cacheService = new CacheService(ctx);
    demographicCache = ctx.cache.demographicCache;

    ctx.cache.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = CacheService.create(ctx);

      expect(actual).toEqual(jasmine.any(CacheService));
      expect(actual.ctx).toBe(ctx);
    });
  });



  it('should call getDemographics and return data', async () => {
    const expected = {
      id: patientId,
      nhsNumber: nhsNumber,
      gender: 'female',
      phone : '+44 58584 5475477',
      name: 'Megan',
      dateOfBirth: Date.now(),
      gpName: 'Fox',
      gpAddress: 'California',
      address: 'London'
    };

    demographicCache.byNhsNumber.get.and.resolveValue(expected);
    const actual = await cacheService.getDemographics(nhsNumber);
    expect(actual).toEqual(expected);
  });

  it('should call getDemographics and returns error', async () => {
    ctx.cache.demographicCache = undefined;
    const actual = await cacheService.getDemographics(nhsNumber);
    expect(actual).toEqual(null);
  });
});
