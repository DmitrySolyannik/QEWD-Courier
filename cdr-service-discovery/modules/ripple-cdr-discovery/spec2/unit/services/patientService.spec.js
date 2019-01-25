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
const PatientService = require('../../../lib2/services/patientService');

describe('ripple-cdr-discovery/lib2/services/patientService', () => {
  let ctx;
  let nhsNumber;

  let patientUuids;
  let resultObj;

  let patientService;
  let patientCache;
  let bundleCache;

  function seeds() {
    patientUuids = [
      5558526785,
      8111144490,
    ];
    resultObj = {
      resourceType: 'Bundle',
      entry: [
        {
          patientId: 5558526785,
          name: 'Patient#1'
        },
        {
          patientId: 8111144490,
          name: 'Patient#2'
        }
      ]
    };

  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    nhsNumber = 5558526784;

    patientService = new PatientService(ctx);

    patientCache = ctx.cache.patientCache;
    bundleCache = ctx.cache.bundleCache;

    ctx.cache.freeze();
    ctx.cache.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = PatientService.create(ctx);

      expect(actual).toEqual(jasmine.any(PatientService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  it('should call getPatientBundle if target cache is bundleCache', async () => {
    seeds();

    bundleCache.exists.and.resolveValue(true);
    bundleCache.byNhsNumber.getAllPatientUuids.and.resolveValue(patientUuids);
    bundleCache.byPatientUuid.getByPatientUuids.and.resolveValue(resultObj.entry);

    const actual = await patientService.getPatientBundle(nhsNumber);

    expect(bundleCache.exists).toHaveBeenCalled();
    expect(bundleCache.byNhsNumber.getAllPatientUuids).toHaveBeenCalled();
    expect(bundleCache.byPatientUuid.getByPatientUuids).toHaveBeenCalled();
    expect(actual).toEqual(resultObj);
  });

  it('should call getPatientBundle if target cache is bundleCache', async () => {
    seeds();

    bundleCache.exists.and.resolveValue(false);
    patientCache.byNhsNumber.getAllPatientUuids.and.resolveValue(patientUuids);
    patientCache.byPatientUuid.getByPatientUuids.and.resolveValue(resultObj.entry);

    const actual = await patientService.getPatientBundle(nhsNumber);

    expect(bundleCache.exists).toHaveBeenCalled();
    expect(patientCache.byNhsNumber.getAllPatientUuids).toHaveBeenCalled();
    expect(patientCache.byPatientUuid.getByPatientUuids).toHaveBeenCalled();
    expect(actual).toEqual(resultObj);
  });

  //@TODO Talk regarding this test !!!
  it('should call updateBundle', async () => {
    const d = {
      data: 'foo'
    };
    patientCache.export.and.resolveValue(d);
    bundleCache.import.and.resolveValue();

    await patientService.updateBundle();

    expect(patientCache.export).toHaveBeenCalled();
    expect(bundleCache.import).toHaveBeenCalled();
  });
});
