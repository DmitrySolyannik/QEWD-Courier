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

  23 December 2018

*/

'use strict';

const { ExecutionContextMock } = require('../../mocks');
const { HeadingCache } = require('../../../lib2/cache');

describe('ripple-cdr-openehr/lib/cache/headingCache', () => {
  let ctx;
  let headingCache;
  let qewdSession;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    headingCache = new HeadingCache(ctx.adapter);

    ctx.cache.freeze();

    qewdSession = ctx.adapter.qewdSession;
  });

  afterEach(() => {
    ctx.worker.db.reset();
  });

  describe('#create (static)', () => {
    it('should initialize a new instance', async () => {
      const actual = HeadingCache.create(ctx.adapter);

      expect(actual).toEqual(jasmine.any(HeadingCache));
      expect(actual.adapter).toBe(ctx.adapter);
      expect(actual.adapter).toBe(ctx.adapter);
    });
  });

  describe('#deleteAll', () => {
    function seeds() {
      [
        {
          patientId: 9999999000,
          heading: 'procedures',
          date: 1514764800000,
          host: 'ethercis',
          sourceId: '0f7192e9-168e-4dea-812a-3e1d236ae46d'
        },
        {
          patientId: 9999999000,
          heading: 'vaccinations',
          date: 1514795600000,
          host: 'ethercis',
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010'
        },
        {
          patientId: 9999999111,
          heading: 'procedures',
          date: 1514734500000,
          host: 'ethercis',
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76'
        },
        {
          patientId: 9999999000,
          heading: 'procedures',
          date: 1514767800000,
          host: 'marand',
          sourceId: '33a93da2-6677-42a0-8b39-9d1e012dde12'
        }
      ].forEach(x => {
        const byPatientId = qewdSession.data.$(['headings', 'byPatientId', x.patientId, x.heading]);
        byPatientId.$(['byDate', x.date, x.sourceId]).value = 'true';
        byPatientId.$(['byHost', x.host, x.sourceId]).value = 'true';
        const bySourceId = qewdSession.data.$(['headings', 'bySourceId']);
        bySourceId.$(x.sourceId).setDocument({
          date: x.date
        });
      });
    }

    it('should delete all cache for specific host - patient - heading', async () => {
      const expected = {
        byPatientId: {
          '9999999000': {
            procedures: {
              byDate: {
                '1514767800000': {
                  '33a93da2-6677-42a0-8b39-9d1e012dde12': true
                }
              },
              byHost: {
                marand: {
                  '33a93da2-6677-42a0-8b39-9d1e012dde12': true
                }
              }
            },
            vaccinations: {
              byDate: {
                '1514795600000': {
                  '260a7be5-e00f-4b1e-ad58-27d95604d010': true
                }
              },
              byHost: {
                ethercis: {
                  '260a7be5-e00f-4b1e-ad58-27d95604d010': true
                }
              }
            }
          },
          '9999999111': {
            procedures: {
              byDate: {
                '1514734500000': {
                  'eaf394a9-5e05-49c0-9c69-c710c77eda76': true
                }
              },
              byHost: {
                ethercis: {
                  'eaf394a9-5e05-49c0-9c69-c710c77eda76': true
                }
              }
            }
          }
        },
        bySourceId: {
          '260a7be5-e00f-4b1e-ad58-27d95604d010': {
            date: 1514795600000
          },
          '33a93da2-6677-42a0-8b39-9d1e012dde12': {
            date: 1514767800000
          },
          'eaf394a9-5e05-49c0-9c69-c710c77eda76': {
            date: 1514734500000
          }
        }
      };

      seeds();

      const host = 'ethercis';
      const patientId = 9999999000;
      const heading = 'procedures';

      await headingCache.deleteAll(host, patientId, heading);

      const actual = qewdSession.data.$('headings').getDocument();

      expect(actual).toEqual(expected);
    });
  });

  describe('byDate', () => {
    function seeds() {
      [
        {
          patientId: 9999999000,
          heading: 'procedures',
          sourceId: '33a93da2-6677-42a0-8b39-9d1e012dde12',
          date: 1514734500000
        },
        {
          patientId: 9999999000,
          heading: 'procedures',
          sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
          date: 1514767800000
        },
        {
          patientId: 9999999000,
          heading: 'procedures',
          sourceId: '260a7be5-e00f-4b1e-ad58-27d95604d010',
          date: 1514790100000
        }
      ].forEach(x => {
        const key = ['headings', 'byPatientId', x.patientId, x.heading, 'byDate', x.date, x.sourceId];
        qewdSession.data.$(key).value = 'true';
      });
    }

    describe('#set', () => {
      it('should set correct value', async () => {
        const expected = {
          byPatientId: {
            '9999999000': {
              procedures: {
                byDate: {
                  '1514734500000': {
                    '33a93da2-6677-42a0-8b39-9d1e012dde12': true
                  }
                }
              }
            }
          }
        };

        const patientId = 9999999000;
        const heading = 'procedures';
        const sourceId = '33a93da2-6677-42a0-8b39-9d1e012dde12';
        const date = 1514734500000;

        await headingCache.byDate.set(patientId, heading, sourceId, date);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#delete', () => {
      it('should delete value', async () => {
        const expected = {
          byPatientId: {
            '9999999000': {
              procedures: {
                byDate: {
                  '1514767800000': {
                    'eaf394a9-5e05-49c0-9c69-c710c77eda76': true
                  },
                  '1514790100000': {
                    '260a7be5-e00f-4b1e-ad58-27d95604d010': true
                  }
                }
              }
            }
          }
        };

        seeds();

        const patientId = 9999999000;
        const heading = 'procedures';
        const sourceId = '33a93da2-6677-42a0-8b39-9d1e012dde12';
        const date = 1514734500000;

        await headingCache.byDate.delete(patientId, heading, sourceId, date);

        const actual = qewdSession.data.$('headings').getDocument();

        expect(actual).toEqual(expected);
      });
    });

    describe('#getAllSourceIds', () => {
      it('should return all source ids', async () => {
        const expected = [
          '260a7be5-e00f-4b1e-ad58-27d95604d010',
          'eaf394a9-5e05-49c0-9c69-c710c77eda76'
        ];

        seeds();

        const patientId = 9999999000;
        const heading = 'procedures';

        const actual = await headingCache.byDate.getAllSourceIds(patientId, heading, { limit: 2 });

        expect(actual).toEqual(expected);
      });
    });
  });
});
