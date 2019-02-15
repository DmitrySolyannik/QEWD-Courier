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

  12 January 2018

*/

'use strict';

const P = require('bluebird');
const { logger } = require('../core');
const { ResourceName } = require('../shared/enums');
const { getLocationRef, getPractitionerRef, parseRef, getPatientUuid } = require('../shared/utils');
const debug = require('debug');

class ResourceService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new ResourceService(ctx);
  }

  /**
   * @param {string|int} nhsNumber
   * @returns {Promise}
   */
  async fetchPatients(nhsNumber) {
    logger.info('services/resourceService|fetchPatients', { nhsNumber });

    const { patientCache } = this.ctx.cache;
    const exists = await patientCache.byNhsNumber.exists(nhsNumber);
    logger.info('fetchPatients | exists', { exists });

    // if (exists) return { ok: false }; //@TODO Debugging , remove after
    const { resourceRestService, tokenService } = this.ctx.services;
    try {
      const token = await tokenService.get();
      logger.info('fetchPatients | token', { token });

      debug('token: %j', token);

      let data = await resourceRestService.getPatients(nhsNumber, token);
      data = JSON.parse(data);
      logger.info('fetchPatients | getPatients', { data });

      debug('data: %j', data);

      if (!data || !data.entry) return false;

      await P.each(data.entry, async (x) => {
        const patient = x.resource;
        const patientUuid = patient.id;

        const exists = await patientCache.byPatientUuid.exists(patientUuid);
        if (exists) return;

        await patientCache.byPatientUuid.set(patientUuid, patient);
        await patientCache.byPatientUuid.setNhsNumber(patientUuid, nhsNumber); //@TODO check
        await patientCache.byNhsNumber.setPatientUuid(nhsNumber, patientUuid);
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   *
   * @param {string|number} nhsNumber
   * @param {string} resourceName
   * @returns {Promise}
   */
  async fetchPatientResources(nhsNumber, resourceName) {
    logger.info('services/resourceService|fetchPatientResources', { nhsNumber, resourceName });

    const { patientCache } = this.ctx.cache;
    const exists = await patientCache.byResource.exists(nhsNumber, resourceName);
    if (exists) return false;

    const { resourceCache, fetchCache } = this.ctx.cache;
    const { resourceRestService, patientService, tokenService } = this.ctx.services;
    const patientBundle = await patientService.getPatientBundle(nhsNumber);
    const data = {
      resources: [resourceName],
      patients: patientBundle
    };
    const token = await tokenService.get();

    let response = await resourceRestService.getPatientResources(data, token);
    response = JSON.parse(response);

    debug('response: %j', response);
    if (!response || !response.entry) return false;

    if (resourceName === ResourceName.PATIENT) {
      await patientService.updateBundle();
      await patientCache.byPatientUuid.deleteAll();
    }

    await fetchCache.deleteAll();

    await P.each(response.entry, async (x) => {
      if (x.resource.resourceType !== resourceName) return;

      const resource = x.resource;
      const uuid = resource.id;
      const patientUuid = getPatientUuid(resource);

      await resourceCache.byUuid.set(resourceName, uuid, resource);
      await patientCache.byResource.set(nhsNumber, patientUuid, resourceName, uuid);
      await patientCache.byNhsNumber.setResourceUuid(nhsNumber, resourceName, uuid);

      const practitionerRef = getPractitionerRef(resource);
      if (practitionerRef) {
        const practitionerUuid = parseRef(practitionerRef).uuid;
        await resourceCache.byUuid.setPractitionerUuid(resourceName, uuid, practitionerUuid);
        await this.fetchPractitioner(practitionerRef, resourceName);
      }
    });
  }

  //@TODO think about how to remove resourceName
  async fetchPractitioner(reference, resourceName) {
    logger.info('services/resourceService|fetchPractitioner', { reference, resourceName });

    // resource will be null if either:
    // - the practitioner is already cached; or
    // - the practioner is already in the process of being fetched in an earlier iteration
    const { resource } = await this.fetchResource(reference);

    debug('resource: %j', resource);
    if (!resource) return;

    // console.log('resource.practitionerRole =====', resource.practitionerRole);

    // ensure organisation records for practitioner are also fetched and cached
    await P.each(resource.practitionerRole, async (role) => {
      const organisationRef = role.managingOrganisation.reference;
      const { resource } = await this.fetchResource(organisationRef);
      if (!resource) return;

      if (resourceName === ResourceName.PATIENT) {
        const locationRef = getLocationRef(resource);

        return await this.fetchResource(locationRef);
      }
    });
  }

  async fetchResource(reference) {
    logger.info('services/resourceService|fetchResource', { reference });

    const { resourceName, uuid } = parseRef(reference);
    const { fetchCache, resourceCache } = this.ctx.cache;

    const cached  = await resourceCache.byUuid.exists(resourceName, uuid);
    if (cached) return { ok: false, cached: true };

    const fetching = await fetchCache.exists(reference);
    if (fetching) return { ok: false, fetching: true };

    const { tokenService, resourceRestService } = this.ctx.services;
    const token = await tokenService.get();
    let resource = await resourceRestService.getResource(reference, token);
    resource = JSON.parse(resource);

    debug('resource: %j', resource);

    await resourceCache.byUuid.set(resourceName, uuid, resource, {});

    return {
      ok: true,
      resource
    };
  }

  async getOrganisationLocation(reference) {
    logger.info('services/resourceService|getOrganisationLocation', { reference });

    const { resourceCache } = this.ctx.cache;

    const organisationUuid = parseRef(reference).uuid;
    
    
    console.log('======================================================');
    
    console.log('organisationUuid', organisationUuid);
    
    console.log('======================================================');
    
    
    
    if (!organisationUuid) return null;

    const organisation = await resourceCache.byUuid.get(ResourceName.ORGANIZATION, organisationUuid);
    
    
    console.log('======================================================');
    
    console.log('organisation', organisation);
    
    console.log('======================================================');
    
    
    debug('organisation: %j', organisation);
    if (!organisation || !organisation.extension) return null;

    const locationRef = getLocationRef(organisation);
    const locationUuid = parseRef(locationRef).uuid;
    const location = await resourceCache.byUuid.get(ResourceName.LOCATION, locationUuid);
    debug('location: %j', location);

    return location;
  }

  async getPractitioner(resourceName, uuid) {
    logger.info('services/resourceService|getPractitioner', { resourceName, uuid });

    const { resourceCache } = this.ctx.cache;

    const practitionerUuid = await resourceCache.byUuid.getPractitionerUuid(resourceName, uuid);
    if (!practitionerUuid) return null;

    const practitioner = await resourceCache.byUuid.get(ResourceName.PRACTITIONER, practitionerUuid);
    debug('practioner: %j', practitioner);

    return practitioner;
  }
}

module.exports = ResourceService;
