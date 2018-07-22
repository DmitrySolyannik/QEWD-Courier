/*

 ----------------------------------------------------------------------------
 | ripple-openehr-jumper: Automated OpenEHR Template Access                 |
 |                                                                          |
 | Copyright (c) 2016-18 Ripple Foundation Community Interest Company       |
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

  22 July 2018

*/

'use strict';

const path = require('path');
const fsMock = require('mock-fs');
const fs = require('fs-extra');
const StatMode = require('stat-mode');
const buildJsonFile = require('../../lib/buildJsonFile');

describe('ripple-openehr-jumper/lib/buildJsonFile', () => {
  let contentsObj;
  let rootPath;
  let fileName;

  beforeEach(() => {
    contentsObj = '{"foo":"bar"}';
    rootPath = path.join(__dirname, '../templates/allergies');
    fileName = 'openEHR_to_Pulsetile.json';

    fsMock();
  });

  afterEach(() => {
    fsMock.restore();
  });

  it('should build json file', () => {
    const fp = path.join(rootPath, fileName);

    buildJsonFile(contentsObj, rootPath, fileName);

    const actualContent = fs.readJsonSync(fp).toString();
    expect(actualContent).toBe('{"foo":"bar"}');

    const stat = new StatMode(fs.statSync(fp));
    expect(stat.toString()).toBe('-rw-rw-r--');
  });
});
