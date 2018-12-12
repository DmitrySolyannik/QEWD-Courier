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

  12 December 2018

*/

'use strict';

const { lazyLoadAdapter } = require('../../lib2/shared/utils');
const debug = require('debug')('ripple-cdr-openehr:mocks:services');

class ServiceRegistryMock {
  initialise(id) {
    debug('lazy load initialisation for %s mock', id);

    const Service = require(`../../lib2/services/${id}`);
    const methods = Reflect
      .ownKeys(Service.prototype)
      .filter(x => x !== 'constructor')

    return jasmine.createSpyObj(id, methods);
  }

  static create() {
    return lazyLoadAdapter(new ServiceRegistryMock());
  }
}

module.exports = ServiceRegistryMock;
