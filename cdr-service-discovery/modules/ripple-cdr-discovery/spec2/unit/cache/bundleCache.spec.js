/*

 ----------------------------------------------------------------------------
 | ripple-cdr-discovery: Ripple MicroServices for OpenEHR                     |
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

  31 December 2018

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const { BundleCache } = require('../../../lib2/cache');


describe('ripple-cdr-discovery/lib2/cache/bundleCache', () => {
  let ctx;
  let nhsNumber;

  let bundleCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['Discovery', 'PatientBundle']).setDocument({
      foo: 'bar'
    });
    qewdSession.data.$(['Discovery', 'PatientBundle', 'by_nhsNumber', nhsNumber, 'Patient']).setDocument([
      { uuid: 1, data: 'some-data-foo' },
      { uuid: 2, data: 'some-data-bar' },
      { uuid: 3, data: 'some-data-foo-bar' },
    ]);

  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    bundleCache = new BundleCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    nhsNumber = 9999999000;

    ctx.cache.freeze();
  });


  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = BundleCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(BundleCache));
      expect(actual.adapter).toBe(ctx.adapter);
      expect(actual.byNhsNumber).toEqual(jasmine.any(Object));
      expect(actual.byPatientUuid).toEqual(jasmine.any(Object));
    });
  });

  it('should check if bundle cache exists', async () => {
    seeds();
    const actual = await bundleCache.exists();

    expect(actual).toEqual(true);
  });

  it('should set data to bundle cache', async () => {
    const expected = {
      foo: 'bar'
    };
    await bundleCache.import(expected);
    const actual = qewdSession.data.$(['Discovery', 'PatientBundle']).getDocument(true);
    expect(actual).toEqual({
      foo: 'bar'
    });
  });

  describe('byNhsNumber', () => {
    it('should return all source ids', async () => {
      const expected = [
        5558526785,
        8111144490,
        8111133448,
        8111162618,
      ];

      seeds();

     await bundleCache.byNhsNumber.getAllPatientUuids(nhsNumber);

      // expect(actual).toEqual(expected); @TODO Add expected values !!!
    });
  });
  describe('byPatientUuid', () => {
    const uuids = [
      5558526785,
      8111144490,
      8111133448,
    ];
    function seeds() {
      uuids.forEach(val => qewdSession.data.$(['Discovery', 'PatientBundle', 'by_uuid', val]).setDocument({
        name: 'Test',
        id: val
      }));
    }

    it('should return all patients', async () => {

      seeds();

      const actual = await bundleCache.byPatientUuid.getByPatientUuids(uuids);

      expect(actual).toEqual([
        { id: 5558526785, name: 'Test' },
        { id: 8111144490, name: 'Test' },
        { id: 8111133448, name: 'Test' },
      ]);
    });
  });
});

