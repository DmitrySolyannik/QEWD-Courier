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

  11 February 2019

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const HeadingService = require('../../../lib2/services/headingService');

describe('ripple-cdr-discovery/lib/services/headingService', () => {
  let ctx;

  let nhsNumber;
  let heading;
  let sourceId;

  let headingService;
  let resourceService;

  let resourceCache;
  let patientCache;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    nhsNumber = 9999999000;
    heading = 'allergies';
    sourceId = 'Discovery-vaccinations_eaf394a9-5e05-49c0-9c69-c710c77eda76';
    headingService = new HeadingService(ctx);

    resourceCache = ctx.cache.resourceCache;
    patientCache = ctx.cache.patientCache;
    resourceService = ctx.services.resourceService;

    ctx.cache.freeze();
    ctx.services.freeze();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = HeadingService.create(ctx, ctx.serversConfig.api);

      expect(actual).toEqual(jasmine.any(HeadingService));
      expect(actual.ctx).toBe(ctx);
    });
  });

  it('should call getBySourceId and returns transformed values', async () => {
    const practitioner = {
        name : {
          text : 'Dr. House'
      }
    };

    const resource = {
        resource : {
          nhsNumber: 9999999001,
          practitionerName: 'Test Name',
          patientId: 9999999000
        }
    };

    resourceCache.byUuid.get.and.resolveValue(resource);
    resourceService.getPractitioner.and.resolveValue(practitioner);

    await headingService.getBySourceId(nhsNumber, heading, sourceId);

    expect(resourceCache.byUuid.get).toHaveBeenCalled();
    expect(resourceService.getPractitioner).toHaveBeenCalled();

    //@todo add correct response for headingService.getBySourceId and check how transform works.
  });

  it('should call getBySourceId without practitioner and returns transformed values', async () => {

    const resource = {
      resource : {
        nhsNumber: 9999999001,
        practitionerName: 'Test Name',
        patientId: 9999999000
      }
    };

    resourceCache.byUuid.get.and.resolveValue(resource);
    resourceService.getPractitioner.and.resolveValue();

    await headingService.getBySourceId(nhsNumber, heading, sourceId);

    expect(resourceCache.byUuid.get).toHaveBeenCalled();
    expect(resourceService.getPractitioner).toHaveBeenCalled();

    //@todo add correct response for headingService.getBySourceId and check how transform works.
  });

  it('should call getSummary returns array of transformed values', async () => {
    const practitioner = {
      name : {
        text : 'Dr. House'
      }
    };

    const uuids = [
      8111133448,
      8111162618,
      8111149212,
      8111137710
    ];

    const resource = {
      resource : {
        nhsNumber: 9999999001,
        practitionerName: 'Test Name',
        patientId: 9999999000
      }
    };

    patientCache.byResource.getUuidsByResourceName.and.resolveValues(uuids);
    resourceCache.byUuid.get.and.resolveValue(resource);
    resourceService.getPractitioner.and.resolveValue(practitioner);

    await headingService.getSummary(nhsNumber, heading);

    expect(patientCache.byResource.getUuidsByResourceName).toHaveBeenCalled();
    expect(resourceCache.byUuid.get).toHaveBeenCalled();
    expect(resourceService.getPractitioner).toHaveBeenCalled();

    //@todo add correct response for headingService.getSummary and check how transform works.
  });

  it('should call getSummary without practitioner and  returns array of transformed values', async () => {
    const uuids = [
      8111133448,
      8111162618,
      8111149212,
      8111137710
    ];

    const resource = {
      resource : {
        nhsNumber: 9999999001,
        practitionerName: 'Test Name',
        patientId: 9999999000
      }
    };

    patientCache.byResource.getUuidsByResourceName.and.resolveValues(uuids);
    resourceCache.byUuid.get.and.resolveValue(resource);
    resourceService.getPractitioner.and.resolveValue();

    await headingService.getSummary(nhsNumber, heading);

    expect(patientCache.byResource.getUuidsByResourceName).toHaveBeenCalled();
    expect(resourceCache.byUuid.get).toHaveBeenCalled();
    expect(resourceService.getPractitioner).toHaveBeenCalled();

    //@todo add correct response for headingService.getSummary and check how transform works.
  });
});
