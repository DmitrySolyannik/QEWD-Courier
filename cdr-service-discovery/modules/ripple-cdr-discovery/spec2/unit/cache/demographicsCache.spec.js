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
const { DemographicCache } = require('../../../lib2/cache');


describe('ripple-cdr-discovery/lib2/cache/demographicsCache', () => {
  let ctx;

  let nhsNumber;
  let demographicsCache;
  let qewdSession;


  beforeEach(() => {
    ctx = new ExecutionContextMock();
    demographicsCache = new DemographicCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;
    nhsNumber = 999999000;
    ctx.cache.freeze();
  });


  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = DemographicCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(DemographicCache));
      expect(actual.adapter).toBe(ctx.adapter);
      expect(actual.byNhsNumber).toEqual(jasmine.any(Object));
    });
  });

  describe('byNhsNumber', () => {
    function seeds() {
      qewdSession.data.$(['Demographics', 'by_nhsNumber', nhsNumber]).setDocument({
        id: nhsNumber,
        nhsNumber: nhsNumber,
        gender: 'female',
        phone : '+44 58584 5475477',
        name: 'Megan',
        dateOfBirth: 1546300800000,
        gpName: 'Fox',
        gpAddress: 'California',
        address: 'London'
      });
    }

    it('should get cache from demographics', async () => {
      seeds();
      const expected = {
        id: nhsNumber,
        nhsNumber: nhsNumber,
        gender: 'female',
        phone : '+44 58584 5475477',
        name: 'Megan',
        dateOfBirth: 1546300800000,
        gpName: 'Fox',
        gpAddress: 'California',
        address: 'London'
      };
      await demographicsCache.byNhsNumber.get(nhsNumber);
      const actual = qewdSession.data.$(['Demographics', 'by_nhsNumber', nhsNumber]).getDocument(true);

      expect(actual).toEqual(expected);
    });

    it('should set cache to demographics', async () => {

      const expected = {
        id: nhsNumber,
        nhsNumber: nhsNumber,
        gender: 'female',
        phone : '+44 58584 5475477',
        name: 'Megan',
        dateOfBirth: 1546300800000,
        gpName: 'Fox',
        gpAddress: 'California',
        address: 'London'
      };
      await demographicsCache.byNhsNumber.set(nhsNumber, expected);
      const actual = qewdSession.data.$(['Demographics', 'by_nhsNumber', nhsNumber]).getDocument(true);
      expect(actual).toEqual(expected);
    });

    it('should delete cache from demographics', async () => {
      qewdSession.data.$(['Discovery']).setDocument({
        foo: 'bar'
      });

      await demographicsCache.byNhsNumber.delete();
      const actual = qewdSession.data.$(['Discovery']).getDocument(true);
      expect(actual).toEqual([]);
    });
  });
});
