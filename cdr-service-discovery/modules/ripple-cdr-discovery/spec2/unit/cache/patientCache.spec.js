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
const { PatientCache } = require('../../../lib2/cache');


describe('ripple-cdr-discovery/lib2/cache/bundleCache', () => {
  let ctx;

  let patientUuid;
  let uuid;
  let patientUuids;
  let patientCache;
  let qewdSession;
  let nhsNumber;
  let resourceName;
  let patient;

  function seeds() {
    qewdSession.data.$(['Discovery', 'Patient']).setDocument({
      id: 9999990000,
      name: 'Patient#1',
      foo: [
        {
          bar: 'foo-bar'
        }
      ]
    });
  }

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    patientCache = new PatientCache(ctx.adapter);
    qewdSession = ctx.adapter.qewdSession;

    nhsNumber = 999999000;
    patientUuid = 5558526785;
    patientUuids = [
      5558526785,
      8111144490,
    ];
    patient = {
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
    resourceName = 'Patient';
    uuid = 'ce437b97-4f6e-4c96-89bb-0b58b29a79cb';

    ctx.cache.freeze();
  });


  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = PatientCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(PatientCache));
      expect(actual.adapter).toBe(ctx.adapter);
      expect(actual.byResource).toEqual(jasmine.any(Object));
      expect(actual.byPatientUuid).toEqual(jasmine.any(Object));
      expect(actual.byNhsNumber).toEqual(jasmine.any(Object));
    });
  });

  it('should check if bundle cache exists', async () => {
    seeds();
    const actual = await patientCache.export();

    expect(actual).toEqual({
      id: 9999990000,
      name: 'Patient#1',
      foo: [
        {
          bar: 'foo-bar'
        }
      ]
    });
  });
  describe('byResource', () => {
    function seedsByResource() {
      qewdSession.data.$(['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'resources', resourceName]).setDocument(patientUuids);
    }

    it('should check if cache exists', async () => {
      seedsByResource();
      const actual = await patientCache.byResource.exists(nhsNumber, resourceName);
      expect(actual).toEqual(true);
    });

    it('should set cache ', async () => {
      await patientCache.byResource.set(nhsNumber, patientUuid, resourceName, uuid);
      const actualByNhsNumber = qewdSession.data.$(['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'resources', resourceName, uuid]).value;
      const actualByUuidKey = qewdSession.data.$(['Discovery', 'Patient', 'by_uuid', patientUuid, 'resources', resourceName, uuid]).value;

      expect(actualByNhsNumber).toEqual(uuid);
      expect(actualByUuidKey).toEqual(uuid);
    });

    it('should get all resource uuids', async () => {
      seedsByResource();
      await patientCache.byResource.getAllResourceUuids(nhsNumber, resourceName); //@TODO add expect for array of ids
    });
  });
  describe('byNhsNumber', () => {
    function seedsByNhsNumber() {
      qewdSession.data.$(['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'resources', 'Patient']).setDocument(patientUuids);
    }

    it('should check if cache exists', async () => {
      seedsByNhsNumber();
      const actual = await patientCache.byNhsNumber.exists(nhsNumber, resourceName);
      expect(actual).toEqual(true);
    });

    it('should get first patient uuid', async () => {
      qewdSession.data.$(['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'Patient']).setDocument(patientUuids);
      const actual = await patientCache.byNhsNumber.getPatientUuid(nhsNumber);
      expect(actual).toEqual(5558526785);
    });

    it('should get all patients uuid', async () => {
      qewdSession.data.$(['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'Patient']).setDocument(patientUuids);
      const actual = await patientCache.byNhsNumber.getAllPatientUuids(nhsNumber); //@TODO add valid expect

    });

    it('should set patient uuid', async () => {
      await patientCache.byNhsNumber.setPatientUuid(nhsNumber, patientUuid);
      const actual = qewdSession.data.$(['Discovery', 'Patient', 'by_nhsNumber', nhsNumber, 'Patient', patientUuid]).value;
      expect(actual).toEqual(patientUuid);
    });

    it('should set resource uuid', async () => {
      await patientCache.byNhsNumber.setResourceUuid(nhsNumber, resourceName, uuid);
      const actual = qewdSession.data.$(['Discovery', 'Patient','by_nhsNumber', nhsNumber, 'resources', resourceName, uuid]).value;
      expect(actual).toEqual(uuid);
    });
  });
  describe('byPatientUuid', () => {
    function seedsByPatientUuid() {
      qewdSession.data.$(['Discovery', 'Patient', 'by_uuid', patientUuid]).setDocument(patient);
    }

    it('should check it cache exists', async () => {
      seedsByPatientUuid();
      const actual =  await patientCache.byPatientUuid.exists(patientUuid);
      expect(actual).toEqual(true);
    });

    it('should set patient to cache', async () => {
      await patientCache.byPatientUuid.set(patientUuid, patient);
      const actual = qewdSession.data.$(['Discovery', 'Patient', 'by_uuid', patientUuid]).getDocument();
      expect(actual).toEqual(patient);
    });

    it('should get person from cache', async () => {
      seedsByPatientUuid();
      const actual = await patientCache.byPatientUuid.get(patientUuid);
      expect(actual).toEqual(patient);
    });

    it('should set nhsNumber to cache', async () => {
      await patientCache.byPatientUuid.setNhsNumber(patientUuid, nhsNumber);
      const actual = qewdSession.data.$(['Discovery', 'Patient', 'by_uuid', patientUuid, 'nhsNumber', nhsNumber]).value;
      expect(actual).toEqual(nhsNumber);
    });

    it('should delete all cache data', async () => {
      seedsByPatientUuid();
      await patientCache.byPatientUuid.deleteAll();
      const actual = qewdSession.data.$(['Discovery', 'Patient', 'by_uuid']).getDocument();
      expect(actual).toEqual({});
    });

    it('should get practitioner uuid', async () => {
      qewdSession.data.$(['Discovery', 'Patient', 'by_uuid', patientUuid, 'practitioner']).value = 'foo-bar';
      const actual = await patientCache.byPatientUuid.getPractitionerUuid(patientUuid);
      expect(actual).toEqual('foo-bar');
    });

    it('should get all patients', async () => {
      qewdSession.data.$(['Discovery', 'Patient', 'by_uuid', 5558526785]).setDocument(patient);
      qewdSession.data.$(['Discovery', 'Patient', 'by_uuid', 8111144490]).setDocument(patient);
      const actual = await patientCache.byPatientUuid.getByPatientUuids(patientUuids);
      expect(actual).toEqual([
        patient,
        patient
      ]);
    });

  });
});
