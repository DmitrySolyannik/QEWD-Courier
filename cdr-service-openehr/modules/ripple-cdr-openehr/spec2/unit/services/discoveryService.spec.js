/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018 Ripple Foundation Community Interest Company          |
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

  18 December 2018

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const DiscoveryService = require('../../../lib2/services/discoveryService');

describe('ripple-cdr-openehr/lib/services/discoveryService', () => {
  let ctx;
  let discoveryService;

  let ehrSessionService;
  let patientService;
  let headingService;

  let discoveryDb;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    discoveryService = new DiscoveryService(ctx);

    ehrSessionService = ctx.services.ehrSessionService;
    patientService = ctx.services.patientService;
    headingService = ctx.services.headingService;

    discoveryDb = ctx.db.discoveryDb;
  });

  describe('#mergeAll', () => {
    it('should merge data and return false', async () => {
      const expected = false;

      spyOn(discoveryService, 'merge').and.resolveValues(false, false);

      ehrSessionService.start.and.resolveValue({
        sessionId: '182bdb28-d257-4a99-9a41-441c49aead0c'
      });
      patientService.getEhrId.and.resolveValue('41bc6370-33a4-4ae1-8b3d-d2d9cfe606a4');

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const data = [
        {
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
        },
        {
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        }
      ];

      const actual = await discoveryService.mergeAll(host, patientId, heading, data);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(patientService.getEhrId).toHaveBeenCalledWith(
        'ethercis', '182bdb28-d257-4a99-9a41-441c49aead0c', 9999999000
      );

      expect(discoveryService.merge).toHaveBeenCalledTimes(2);
      expect(discoveryService.merge.calls.argsFor(0)).toEqual([
        9999999000,
        'procedures',
        {
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
        }
      ]);
      expect(discoveryService.merge.calls.argsFor(1)).toEqual([
        9999999000,
        'procedures',
        {
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        }
      ]);

      expect(actual).toEqual(expected);
    });

    it('should merge data and return true', async () => {
      const expected = true;

      spyOn(discoveryService, 'merge').and.resolveValues(true, false);

      ehrSessionService.start.and.resolveValue({
        sessionId: '182bdb28-d257-4a99-9a41-441c49aead0c'
      });
      patientService.getEhrId.and.resolveValue('41bc6370-33a4-4ae1-8b3d-d2d9cfe606a4');

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const data = [
        {
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
        },
        {
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        }
      ];

      const actual = await discoveryService.mergeAll(host, patientId, heading, data);

      expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
      expect(patientService.getEhrId).toHaveBeenCalledWith(
        'ethercis', '182bdb28-d257-4a99-9a41-441c49aead0c', 9999999000
      );

      expect(discoveryService.merge).toHaveBeenCalledTimes(2);
      expect(discoveryService.merge.calls.argsFor(0)).toEqual([
        9999999000,
        'procedures',
        {
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
        }
      ]);
      expect(discoveryService.merge.calls.argsFor(1)).toEqual([
        9999999000,
        'procedures',
        {
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        }
      ]);

      expect(actual).toEqual(expected);
    });
  });

  describe('#merge', () => {
    it('should return false when record exists in discovery cache', async () => {
      const expected = false;

      discoveryDb.getSourceIdByDiscoverySourceId.and.resolveValue('foo-bar');

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const item = {
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
      };

      const actual = await discoveryService.merge(host, patientId, heading, item);

      expect(discoveryDb.getSourceIdByDiscoverySourceId).toHaveBeenCalledWith('eaf394a9-5e05-49c0-9c69-c710c77eda76');
      expect(actual).toEqual(expected);
    });

    it('should return false when error thrown', async () => {
      const expected = false;

      discoveryDb.getSourceIdByDiscoverySourceId.and.resolveValue(null);
      headingService.post.and.rejectValue(new Error('custom error'));

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const item = {
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
      };

      const actual = await discoveryService.merge(host, patientId, heading, item);

      expect(discoveryDb.getSourceIdByDiscoverySourceId).toHaveBeenCalledWith('eaf394a9-5e05-49c0-9c69-c710c77eda76');
      expect(headingService.post).toHaveBeenCalledWith(
        9999999000,
        'procedures',
        {
          data: {
            sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
          },
          format: 'pulsetile',
          source: 'GP'
        }
      );

      expect(actual).toEqual(expected);
    });

    it('should return false when no response from OpenEHR server', async () => {
      const expected = false;

      discoveryDb.getSourceIdByDiscoverySourceId.and.resolveValue(null);
      headingService.post.and.resolveValue();

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const item = {
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
      };

      const actual = await discoveryService.merge(host, patientId, heading, item);

      expect(discoveryDb.getSourceIdByDiscoverySourceId).toHaveBeenCalledWith('eaf394a9-5e05-49c0-9c69-c710c77eda76');
      expect(headingService.post).toHaveBeenCalledWith(
        9999999000,
        'procedures',
        {
          data: {
            sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
          },
          format: 'pulsetile',
          source: 'GP'
        }
      );

      expect(actual).toEqual(expected);
    });

    it('should return true when record merged and cached in discovery cache', async () => {
      const expected = true;

      const response = {
        ok: true,
        compositionUid: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1'
      };

      discoveryDb.getSourceIdByDiscoverySourceId.and.resolveValue(null);
      headingService.post.and.resolveValue(response);
      discoveryDb.insert.and.resolveValue();

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';
      const item = {
        sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
      };

      const actual = await discoveryService.merge(host, patientId, heading, item);

      expect(discoveryDb.getSourceIdByDiscoverySourceId).toHaveBeenCalledWith('eaf394a9-5e05-49c0-9c69-c710c77eda76');
      expect(headingService.post).toHaveBeenCalledWith(
        9999999000,
        'procedures',
        {
          data: {
            sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
          },
          format: 'pulsetile',
          source: 'GP'
        }
      );
      expect(discoveryDb.insert).toHaveBeenCalledWith(
        'eaf394a9-5e05-49c0-9c69-c710c77eda76',
        'ethercis-188a6bbe-d823-4fca-a79f-11c64af5c2e6',
        {
          discovery: 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
          openehr: '188a6bbe-d823-4fca-a79f-11c64af5c2e6::vm01.ethercis.org::1',
          patientId: 9999999000,
          heading: 'procedures'
        }
      );

      expect(actual).toEqual(expected);
    });
  });
});
