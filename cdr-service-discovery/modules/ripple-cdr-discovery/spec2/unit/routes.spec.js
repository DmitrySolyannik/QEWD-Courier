/*

 ----------------------------------------------------------------------------
 | ripple-cdr-openehr: Ripple MicroServices for OpenEHR                     |
 |                                                                          |
 | Copyright (c) 2018-19 Ripple Foundation Community Interest Company       |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://rippleosi.org                                                     |
 | Email: code.custodian@rippleosi.org                                      |
 |                                                                          |
 | Author: Rob Tweed, M/Gateway Developments Ltd                            |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  11 February 2019

*/

'use strict';

const { flatten } = require('../../lib2/shared/utils');

describe('ripple-cdr-openehr/lib/routes', () => {
  let routes;

  function resolveHandler(url, method) {
    return routes[url][method.toUpperCase()];
  }

  beforeAll(() => {
    delete require.cache[require.resolve('../../lib2/routes')];
    routes = require('../../lib2/routes');
  });

  it('should return correct routes count', () => {
    const expected = 4;
    const actual = Object.keys(flatten(routes)).length;
    expect(actual).toBe(expected);
  });

  it('GET /api/patients/:patientId/:heading', () => {
    const expected = require('../../lib2/handlers/getHeadingSummary');
    const actual = resolveHandler('/api/patients/:patientId/:heading', 'GET');
    expect(actual).toBe(expected);
  });

  it('GET /api/discovery/:patientId/:heading', () => {
    const expected = require('../../lib2/handlers/getHeadingSummary');
    const actual = resolveHandler('/api/discovery/:patientId/:heading', 'GET');
    expect(actual).toBe(expected);
  });

  it('GET /api/patients/:patientId/:heading/:sourceId', () => {
    const expected = require('../../lib2/handlers/getHeadingDetail');
    const actual = resolveHandler('/api/patients/:patientId/:heading/:sourceId', 'GET');
    expect(actual).toBe(expected);
  });

  it('GET /api/demographics/:patientId', () => {
    const expected = require('../../lib2/handlers/getDemographics');
    const actual = resolveHandler('/api/demographics/:patientId', 'GET');
    expect(actual).toBe(expected);
  });
});
