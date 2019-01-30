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
  let resourceName;
  let reference;

  let resourceService;
  let tokenService;
  let resourceRestService;
  let patientService;

  let patientCache;
  let resourceCache;
  let fetchCache;


  beforeEach(() => {
    ctx = new ExecutionContextMock();
    nhsNumber = 9999999000;
    resourceName = 'Patient';
    reference = 'bar/58583011345';

    resourceService = new ResourceService(ctx);

    patientCache = ctx.cache.patientCache;
    resourceCache = ctx.cache.resourceCache;
    fetchCache = ctx.cache.fetchCache;

    tokenService = ctx.services.tokenService;
    patientService = ctx.services.patientService;
    resourceRestService = ctx.services.resourceRestService;

    ctx.cache.freeze();
    ctx.services.freeze();
  });

  function seeds() {
    const token = {
      jwt: 'jwt-token',
      createdAt: new Date().getTime()
    };
    const patients = {
      entry: [
        {
          resource: {
              id: 8111143494
          }
        },
        {
          resource: {
              id: 8111123469
          }
        }
      ]
    };
    const patientBundle = {
      resource: ['Patient'],
      patients: {
        resourceType: 'Bundle',
        entry: [
          {
            resource: {
              patientId: 8111149212,
              name: 'Patient#1'
            }
          },
          {
            resource : {
              patientId: 8111119593,
              name: 'Patient#2'
            }
          }
        ]
      }
    };

    const patientResource = {
      entry: [
        {
          resource: {
            id: 44444455555,
            uuid: 8111160534,
            resourceType: 'Patient',
            informationSource: {
              reference: 'foo/5900049117'
            }
          }
        },
        {
          resource: {
            id: 3333355555,
            uuid: 5900049116,
            resourceType: 'Patient',
            informationSource: {
              reference: 'bar/5900049118'
            }
          }
        },
        {
          resource: {
            id: 3333355556,
            uuid: 5900049119,
            resourceType: 'Patient',
          }
        }
      ]
    };
    const resource = {
        practitionerRole: [
          {
            managingOrganisation: {
              reference: 'foo/5900049117'
            }
          },
          {
            managingOrganisation: {
              reference: 'bar/5900049118'
            }
          }
        ],
        extension: [
          {
            valueReference: {
              reference: 'foobar/6567744554'
            }
          }
        ]
    };

    return { token, patients, patientBundle, patientResource, resource };
  }

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = ResourceService.create(ctx);

      expect(actual).toEqual(jasmine.any(ResourceService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  it('should call fetchPatients and cache data', async () => {
    const { token , patients } = seeds();

    patientCache.byNhsNumber.exists.and.resolveValue(false);
    tokenService.get.and.resolveValue(token);
    resourceRestService.getPatients.and.resolveValue(patients);
    patientCache.byPatientUuid.exists.and.resolveValue(false);
    patientCache.byPatientUuid.set.and.resolveValue();
    patientCache.byPatientUuid.setNhsNumber.and.resolveValue();
    patientCache.byNhsNumber.setPatientUuid.and.resolveValue();

    await resourceService.fetchPatients(nhsNumber);

    expect(patientCache.byNhsNumber.exists).toHaveBeenCalledWith(nhsNumber);
    expect(tokenService.get).toHaveBeenCalled();
    expect(resourceRestService.getPatients).toHaveBeenCalledWith(nhsNumber, token);

    expect(patientCache.byPatientUuid.exists).toHaveBeenCalledTimes(2);
    expect(patientCache.byPatientUuid.exists.calls.argsFor(0)).toEqual([8111143494]);
    expect(patientCache.byPatientUuid.exists.calls.argsFor(1)).toEqual([8111123469]);

    expect(patientCache.byPatientUuid.set).toHaveBeenCalledTimes(2);
    expect(patientCache.byPatientUuid.set.calls.argsFor(0)).toEqual([8111143494, { id: 8111143494 }]);
    expect(patientCache.byPatientUuid.set.calls.argsFor(1)).toEqual([8111123469, { id: 8111123469 }]);

    expect(patientCache.byPatientUuid.setNhsNumber).toHaveBeenCalledTimes(2);
    expect(patientCache.byPatientUuid.setNhsNumber.calls.argsFor(0)).toEqual([8111143494, 9999999000]);
    expect(patientCache.byPatientUuid.setNhsNumber.calls.argsFor(1)).toEqual([8111123469, 9999999000]);

    expect(patientCache.byNhsNumber.setPatientUuid).toHaveBeenCalledTimes(2);
    expect(patientCache.byNhsNumber.setPatientUuid.calls.argsFor(0)).toEqual([9999999000, 8111143494]);
    expect(patientCache.byNhsNumber.setPatientUuid.calls.argsFor(1)).toEqual([9999999000, 8111123469]);
  });

  it('should call fetchPatients with existing patient cache', async () => {
    patientCache.byNhsNumber.exists.and.resolveValue(true);

    const actual = await resourceService.fetchPatients(nhsNumber);

    expect(patientCache.byNhsNumber.exists).toHaveBeenCalledWith(nhsNumber);
    expect(actual).toEqual({
      ok: false
    });
  });

  it('should call fetchPatients with existing cache by patient uuid', async () => {
    const { token , patients } = seeds();
    patientCache.byNhsNumber.exists.and.resolveValue(false);
    tokenService.get.and.resolveValue(token);
    resourceRestService.getPatients.and.resolveValue(patients);
    patientCache.byPatientUuid.exists.and.resolveValue(true);

    await resourceService.fetchPatients(nhsNumber);

    expect(patientCache.byNhsNumber.exists).toHaveBeenCalled();

    expect(tokenService.get).toHaveBeenCalled();
    expect(resourceRestService.getPatients).toHaveBeenCalledWith(nhsNumber, token);

    expect(patientCache.byPatientUuid.exists).toHaveBeenCalledTimes(2);
    expect(patientCache.byPatientUuid.exists.calls.argsFor(0)).toEqual([8111143494]);
    expect(patientCache.byPatientUuid.exists.calls.argsFor(1)).toEqual([8111123469]);

  });

  it('should call fetchPatient without patients from resource service', async () => {
    const { token } = seeds();
    patientCache.byNhsNumber.exists.and.resolveValue(false);
    tokenService.get.and.resolveValue(token);
    resourceRestService.getPatients.and.resolveValue(null);

    await resourceService.fetchPatients(nhsNumber);

    expect(patientCache.byNhsNumber.exists).toHaveBeenCalledWith(nhsNumber);
    expect(tokenService.get).toHaveBeenCalled();
    expect(resourceRestService.getPatients).toHaveBeenCalledWith(nhsNumber, token);
  });

  it('should call fetchPatient with error', async () => {
    const expectError = 'Sorry, something went wrong';
    patientCache.byNhsNumber.exists.and.resolveValue(false);
    tokenService.get.and.rejectValue(new Error(expectError));

    try {
      await resourceService.fetchPatients(nhsNumber);
    } catch(e) {
      expect(e).toEqual(new Error(expectError));
    }

    expect(patientCache.byNhsNumber.exists).toHaveBeenCalledWith(nhsNumber);
    expect(tokenService.get).toHaveBeenCalled();
  });

  it('should call fetchPatientResources with success response and one of cases without practitioner ref', async () => {
    const { patientBundle, patientResource, token } = seeds();


    patientCache.byResource.exists.and.resolveValue(false);
    patientService.getPatientBundle.and.resolveValue(patientBundle.patients);
    tokenService.get.and.resolveValue(token);
    resourceRestService.getPatientResources.and.resolveValue(patientResource);
    patientService.updateBundle.and.resolveValue();
    patientCache.byPatientUuid.deleteAll.and.resolveValue();
    fetchCache.deleteAll.and.resolveValue();
    resourceCache.byUuid.set.and.resolveValue();
    patientCache.byResource.set.and.resolveValue();
    patientCache.byNhsNumber.setResourceUuid.and.resolveValue();
    resourceCache.byUuid.setPractitionerUuid.and.resolveValue();
    spyOn(resourceService, 'fetchPractitioner').and.resolveValue();

    await resourceService.fetchPatientResources(nhsNumber, resourceName);

    expect(patientCache.byResource.exists).toHaveBeenCalledWith(nhsNumber, resourceName);
    expect(patientService.getPatientBundle).toHaveBeenCalledWith(nhsNumber);
    expect(tokenService.get).toHaveBeenCalled();
    expect(resourceRestService.getPatientResources).toHaveBeenCalledWith(patientBundle, token);
    expect(patientService.updateBundle).toHaveBeenCalled();
    expect(patientCache.byPatientUuid.deleteAll).toHaveBeenCalled();
    expect(fetchCache.deleteAll).toHaveBeenCalled();

    expect(resourceCache.byUuid.set).toHaveBeenCalledTimes(3);
    expect(resourceCache.byUuid.set.calls.argsFor(0)).toEqual(['Patient', 8111160534, {
      id: 44444455555,
      uuid: 8111160534,
      resourceType: 'Patient',
      informationSource: {
        reference: 'foo/5900049117'
      }
    }]);
    expect(resourceCache.byUuid.set.calls.argsFor(1)).toEqual(['Patient', 5900049116, {
      id: 3333355555,
      uuid: 5900049116,
      resourceType: 'Patient',
      informationSource: {
        reference: 'bar/5900049118'
      }
    }]);
    expect(resourceCache.byUuid.set.calls.argsFor(2)).toEqual(['Patient', 5900049119, {
      id: 3333355556,
      uuid: 5900049119,
      resourceType: 'Patient',
    }]);


    expect(patientCache.byResource.set).toHaveBeenCalledTimes(3);
    expect(patientCache.byResource.set.calls.argsFor(0)).toEqual([9999999000, 44444455555, 'Patient', 8111160534]);
    expect(patientCache.byResource.set.calls.argsFor(1)).toEqual([9999999000, 3333355555, 'Patient', 5900049116]);

    expect(patientCache.byNhsNumber.setResourceUuid).toHaveBeenCalledTimes(3);
    expect(patientCache.byNhsNumber.setResourceUuid.calls.argsFor(0)).toEqual([9999999000, 'Patient', 8111160534]);
    expect(patientCache.byNhsNumber.setResourceUuid.calls.argsFor(1)).toEqual([9999999000, 'Patient', 5900049116]);

    expect(resourceCache.byUuid.setPractitionerUuid).toHaveBeenCalledTimes(2);
    expect(resourceCache.byUuid.setPractitionerUuid.calls.argsFor(0)).toEqual(['Patient', 8111160534, '5900049117']);
    expect(resourceCache.byUuid.setPractitionerUuid.calls.argsFor(1)).toEqual(['Patient', 5900049116, '5900049118']);


    expect(resourceService.fetchPractitioner).toHaveBeenCalledTimes(2);
    expect(resourceService.fetchPractitioner.calls.argsFor(0)).toEqual(['foo/5900049117', 'Patient']);
    expect(resourceService.fetchPractitioner.calls.argsFor(1)).toEqual(['bar/5900049118', 'Patient']);
  });

  it('should call fetch patient resource with exsisting patient cache', async () => {
    patientCache.byResource.exists.and.resolveValue(true);

    const actual = await resourceService.fetchPatientResources(nhsNumber, resourceName);

    expect(patientCache.byResource.exists).toHaveBeenCalled();
    expect(actual).toEqual(false);
  });

  it('should call fetch patient resource without data from get patient resource', async () => {
    const { patientBundle, token } = seeds();

    patientCache.byResource.exists.and.resolveValue(false);
    patientService.getPatientBundle.and.resolveValue(patientBundle);
    tokenService.get.and.resolveValue(token);
    resourceRestService.getPatientResources.and.resolveValue({
      entry: null
    });

    const actual = await resourceService.fetchPatientResources(nhsNumber, resourceName);

    expect(patientCache.byResource.exists).toHaveBeenCalled();
    expect(patientService.getPatientBundle).toHaveBeenCalledWith(nhsNumber);
    expect(tokenService.get).toHaveBeenCalled();
    expect(resourceRestService.getPatientResources).toHaveBeenCalled();
    expect(actual).toEqual(false);
  });

  it('should call fetch patient resources with wrong resource type ', async () => {
    const { patientBundle, patientResource, token } = seeds();


    patientCache.byResource.exists.and.resolveValue(false);
    patientService.getPatientBundle.and.resolveValue(patientBundle.patients);
    tokenService.get.and.resolveValue(token);
    resourceRestService.getPatientResources.and.resolveValue(patientResource);

    await resourceService.fetchPatientResources(nhsNumber, 'ResourceName');

    expect(patientCache.byResource.exists).toHaveBeenCalledWith(nhsNumber, 'ResourceName');
    expect(patientService.getPatientBundle).toHaveBeenCalledWith(nhsNumber);
    expect(tokenService.get).toHaveBeenCalled();
    patientBundle.resource = ['ResourceName'];
    expect(resourceRestService.getPatientResources).toHaveBeenCalledWith(patientBundle, token);
  });

  it('should call fetch practitioner with resource', async () => {
    const { resource } = seeds();
    spyOn(resourceService, 'fetchResource').and.resolveValue({
      resource : resource
    });

    await resourceService.fetchPractitioner(reference, resourceName);
    expect(resourceService.fetchResource).toHaveBeenCalledTimes(5);
    expect(resourceService.fetchResource.calls.argsFor(0)).toEqual(['bar/58583011345']);
    expect(resourceService.fetchResource.calls.argsFor(1)).toEqual(['foo/5900049117']);
    expect(resourceService.fetchResource.calls.argsFor(2)).toEqual(['foobar/6567744554']);
    expect(resourceService.fetchResource.calls.argsFor(3)).toEqual(['bar/5900049118']);
    expect(resourceService.fetchResource.calls.argsFor(4)).toEqual(['foobar/6567744554']);
  });

  it('should call fetch practitioner without resource', async () => {
    spyOn(resourceService, 'fetchResource').and.resolveValue({
      resource: null
    });
    await resourceService.fetchPractitioner(reference, resourceName);
    expect(resourceService.fetchResource).toHaveBeenCalledWith(reference);
  });

  it('should call fetch practitioner without organization ref', async () => {
    spyOn(resourceService, 'fetchResource').and.returnValues({
        resource: {
          practitionerRole: [
            {
              managingOrganisation: {
                reference: 'foo/5900049117'
              }
            },
            {
              managingOrganisation: {
                reference: 'bar/58583011345'
              }
            }
          ],
        }
      }, {
        resource: {
          practitionerRole: [
            {
              managingOrganisation: {
                reference: 'bar/58583011345'
              }
            }
          ],
        }
      }, {
        resource: null
      }
    );
    await resourceService.fetchPractitioner(reference, 'resourceName');
    expect(resourceService.fetchResource).toHaveBeenCalledTimes(3);
    expect(resourceService.fetchResource.calls.argsFor(0)).toEqual([reference]);
    expect(resourceService.fetchResource.calls.argsFor(1)).toEqual(['foo/5900049117']);
    expect(resourceService.fetchResource.calls.argsFor(2)).toEqual(['bar/58583011345']);
  });

  it('should call fetch resource with resource', async () => {
    const { token, resource } = seeds();
    resourceCache.byUuid.exists.and.resolveValue(false);
    fetchCache.exists.and.resolveValue(false);
    tokenService.get.and.resolveValue(token.jwt);
    resourceRestService.getResource.and.resolveValue(resource);
    resourceCache.byUuid.set.and.resolveValue();

   const actual = await resourceService.fetchResource(reference);


    expect(resourceCache.byUuid.exists).toHaveBeenCalledWith('bar', '58583011345');
    expect(fetchCache.exists).toHaveBeenCalledWith(reference);
    expect(tokenService.get).toHaveBeenCalled();
    expect(resourceRestService.getResource).toHaveBeenCalledWith(reference, token.jwt);
    expect(resourceCache.byUuid.set).toHaveBeenCalledWith('bar', '58583011345', resource, {});
    expect(actual).toEqual({
      ok: true,
      resource
    });
  });

  it('should call fetch resource with already cached resource', async () => {
    resourceCache.byUuid.exists.and.resolveValue(true);
    const actual = await resourceService.fetchResource(reference);

    expect(resourceCache.byUuid.exists).toHaveBeenCalledWith('bar', '58583011345');
    expect(actual).toEqual({
      ok: false,
      cached: true
    });
  });

  it('should call fetch with already cached fetch', async () => {
    resourceCache.byUuid.exists.and.resolveValue(false);
    fetchCache.exists.and.resolveValue(true);

    const actual = await resourceService.fetchResource(reference);
    expect(resourceCache.byUuid.exists).toHaveBeenCalledWith('bar', '58583011345');
    expect(fetchCache.exists).toHaveBeenCalledWith(reference);
    expect(actual).toEqual({
      ok: false,
      fetching: true
    });
  });

  it('should call get organization location with success response', async () => {
    resourceCache.byUuid.get.and.resolveValues({
        extension: [
          {
            valueReference: {
              reference: 'foobar/6567744554'
            }
          },
          {
            valueReference: {
              reference: 'barfoo/6567744321'
            }
          }
        ]
    },{
      address: {
        text: 'California'
      }
    });

    const actual = await resourceService.getOrganisationLocation(reference);

    expect(resourceCache.byUuid.get).toHaveBeenCalledWith('Organization', '58583011345');
    expect(resourceCache.byUuid.get).toHaveBeenCalledWith('Location', '6567744554');
    expect(actual).toEqual({
      address: {
        text: 'California'
      }
    });
  });

  it('should call get organization with invalid reference', async() => {
    const actual = await resourceService.getOrganisationLocation('foo');
    expect(actual).toEqual(null);
  });

  it('should call get organization location without organization', async () => {
    resourceCache.byUuid.get.and.resolveValue(null);
    const actual = await resourceService.getOrganisationLocation(reference);
    expect(actual).toEqual(null);
  });

  it('should call get practitioner with success response', async () => {
    resourceCache.byUuid.getPractitionerUuid.and.resolveValue(9999999003);
    resourceCache.byUuid.get.and.resolveValue({
      address: {
        text: 'California'
      },
      name: 'Dr.House'
    });

    const actual = await resourceService.getPractitioner(resourceName, '58583011345');
    expect(resourceCache.byUuid.getPractitionerUuid).toHaveBeenCalledWith(resourceName, '58583011345');
    expect(resourceCache.byUuid.get).toHaveBeenCalledWith('Practitioner', 9999999003);
    expect(actual).toEqual({
      address: {
        text: 'California'
      },
      name: 'Dr.House'
    });
  });

  it('should call practitioner and returns null', async() => {
    resourceCache.byUuid.getPractitionerUuid.and.resolveValue(null);

    const actual = await resourceService.getPractitioner(resourceName, '58583011345');
    expect(resourceCache.byUuid.getPractitionerUuid).toHaveBeenCalledWith(resourceName, '58583011345');
    expect(actual).toEqual(null);

  });
});
