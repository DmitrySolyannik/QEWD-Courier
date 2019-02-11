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

  12 February 2019

*/

'use strict';

const { logger } = require('../core');
const { ResourceName } = require('../shared/enums');
const { getLocationRef, parseRef } = require('../shared/utils');
const { byUuid } = require('./mixins/resource');
const debug = require('debug')('ripple-cdr-discovery:cache:resource');

class ResourceCache {
  constructor(adapter) {
    this.adapter = adapter;
    this.byUuid = byUuid(adapter);
  }

  static create(adapter) {
    return new ResourceCache(adapter);
  }

  /**
   * Gets organization location
   *
   * @param  {string} reference
   * @return {Object}
   */
  getOrganisationLocation(reference) {
    logger.info('cache/resourceCache|getOrganisationLocation', { reference });

    const organisationUuid = parseRef(reference).uuid;
    if (!organisationUuid) return null;

    const organisation = this.byUuid.get(ResourceName.ORGANIZATION, organisationUuid);
    debug('organisation: %j', organisation);
    if (!organisation || !organisation.extension) return null;

    const locationRef = getLocationRef(organisation);
    const locationUuid = parseRef(locationRef).uuid;
    const location = this.byUuid.get(ResourceName.LOCATION, locationUuid);
    debug('location: %j', location);

    return location;
  }

  /**
   * Gets resource practioner
   *
   * @param  {string} resourceName
   * @param  {strijg} uuid
   * @return {Object}
   */
  getPractitioner(resourceName, uuid) {
    logger.info('cache/resourceCache|getPractitioner', { resourceName, uuid });

    const practitionerUuid = this.byUuid.getPractitionerUuid(resourceName, uuid);
    if (!practitionerUuid) return null;

    const practitioner = this.byUuid.get(ResourceName.PRACTITIONER, practitionerUuid);
    debug('practioner: %j', practitioner);

    return practitioner;
  }

}

module.exports = ResourceCache;
