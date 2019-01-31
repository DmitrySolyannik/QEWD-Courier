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
const { ResourceCache } = require('../../../lib2/cache');


describe('ripple-cdr-discovery/lib2/cache/resourceCache', () => {
  let ctx;
  let resourceName;
  let uuid;
  let practitionerUuid;
  let qewdSession;
  let resourceCache;


  beforeEach(() => {
    ctx = new ExecutionContextMock();
    resourceCache = new ResourceCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;
    resourceName = 'Patient';
    uuid = 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb';
    practitionerUuid = 'lr422b91-4f6e-4c36-79bb-0b58z79a79wv';

    ctx.cache.freeze();
  });


  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = ResourceCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(ResourceCache));
      expect(actual.adapter).toBe(ctx.adapter);
      expect(actual.byUuid).toEqual(jasmine.any(Object));
    });
  });
  describe('byUuid',  () => {
    function seeds() {
      qewdSession.data.$(['Discovery', resourceName, 'by_uuid', uuid]).setDocument({
        id: 44444455555,
        uuid: 8111160534,
        resourceType: 'Patient',
        informationSource: {
          reference: 'foo/5900049117',
          foo: [
            {
              bar: 'foo-bar'
            }
          ]
        }
      });
    }

    function seedsPractitioner() {
      qewdSession.data.$(['Discovery', resourceName, 'by_uuid', uuid, 'practitioner']).value = practitionerUuid;
    }

    it('should check if resource exists', async () => {
      seeds();
      const actual = await resourceCache.byUuid.exists(resourceName, uuid);
      expect(actual).toEqual(true);
    });

    it('should try set cache with already existing cache', async () => {

    });

    it('should set cache resource without existing', async () => {
      const expected = {
        id: 44444455555,
        uuid: 8111160534,
        resourceType: 'Patient',
        informationSource: {
          reference: 'foo/5900049117'
        }
      };
      await resourceCache.byUuid.set(resourceName, uuid, expected);
      const actual = qewdSession.data.$(['Discovery', resourceName, 'by_uuid', uuid, 'data']).getDocument(true);
      expect(actual).toEqual(expected);
    });

    it('should get cache from resource ', async () => {
      seeds();
      await resourceCache.byUuid.get(resourceName, uuid);
      const actual = qewdSession.data.$(['Discovery', resourceName, 'by_uuid', uuid]).getDocument(true);
      expect(actual).toEqual({
        id: 44444455555,
        uuid: 8111160534,
        resourceType: 'Patient',
        informationSource: {
          reference: 'foo/5900049117',
          foo: [
            {
              bar: 'foo-bar'
            }
          ]
        }
      });
    });

    it('should set practitioner in resource', async () => {
      seedsPractitioner();
      await resourceCache.byUuid.setPractitionerUuid(resourceName, uuid, practitionerUuid);
      const actual = qewdSession.data.$(['Discovery', resourceName, 'by_uuid', uuid, 'practitioner', practitionerUuid]).value;
      expect(actual).toEqual(practitionerUuid);
    });

    it('should get practitioner uuid from resource', async () => {
      seedsPractitioner();
      const actual = await resourceCache.byUuid.getPractitionerUuid(resourceName, uuid);
      expect(actual).toEqual(practitionerUuid);
    });
  });
});
