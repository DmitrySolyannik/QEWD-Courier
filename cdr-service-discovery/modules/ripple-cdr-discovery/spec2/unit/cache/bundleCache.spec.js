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

  11 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const { BundleCache } = require('../../../lib2/cache');

describe('ripple-cdr-discovery/lib/cache/bundleCache', () => {
  let ctx;
  let nhsNumber;

  let bundleCache;
  let qewdSession;

  function seeds() {
    qewdSession.data.$(['Discovery', 'PatientBundle', 'by_nhsNumber', nhsNumber, 'Patient']).setDocument({
      'c57c65f2-1ca8-46df-9a29-09373dcff552': {
        value: 'foo'
      },
      'be7b03df-2c9a-4afd-8bc5-6065d0688f15': {
        value: 'bar'
      },
      '4ae63d75-b4bc-45ff-8233-8c8f04ddeca5': {
        value: 'baz'
      }
    });
    qewdSession.data.$(['Discovery', 'PatientBundle', 'by_uuid']).setDocument({
      'c57c65f2-1ca8-46df-9a29-09373dcff552': {
        value: 'foo'
      },
      'be7b03df-2c9a-4afd-8bc5-6065d0688f15': {
        value: 'bar'
      },
      '4ae63d75-b4bc-45ff-8233-8c8f04ddeca5': {
        value: 'baz'
      }
    });
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

  describe('#exists', () => {
    it('should return false', async () => {
      const expected = false;

      const actual = await bundleCache.exists();

      expect(actual).toEqual(expected);
    });

    it('should return true when bundle cache exists', async () => {
      const expected = true;

      seeds();

      const actual = await bundleCache.exists();

      expect(actual).toEqual(expected);
    });
  });

  describe('#import', () => {
    it('should set data to bundle cache', async () => {
      const expected = {
        foo: 'bar'
      };

      const data = {
        foo: 'bar'
      };
      await bundleCache.import(data);

      const actual = qewdSession.data.$(['Discovery', 'PatientBundle']).getDocument(true);
      expect(actual).toEqual(expected);
    });
  });

  describe('byNhsNumber', () => {
    it('should return all patient uuids', async () => {
      const expected = [
        '4ae63d75-b4bc-45ff-8233-8c8f04ddeca5',
        'be7b03df-2c9a-4afd-8bc5-6065d0688f15',
        'c57c65f2-1ca8-46df-9a29-09373dcff552'
      ];

      seeds();

      const actual = await bundleCache.byNhsNumber.getAllPatientUuids(nhsNumber);

      expect(actual).toEqual(expected);
    });
  });

  describe('byPatientUuid', () => {
    it('should return patients by patient uuids', async () => {
      const expected = [
        {
          resource: {
            value: 'baz'
          }
        },
        {
          resource: {
            value: 'bar'
          }
        },
        {
          resource: {
            value: 'foo'
          }
        }
      ];

      seeds();

      const patientUiids = [
        '4ae63d75-b4bc-45ff-8233-8c8f04ddeca5',
        'be7b03df-2c9a-4afd-8bc5-6065d0688f15',
        'c57c65f2-1ca8-46df-9a29-09373dcff552'
      ];
      const actual = await bundleCache.byPatientUuid.getByPatientUuids(patientUiids);

      expect(actual).toEqual(expected);
    });
  });
});

