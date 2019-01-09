'use strict';

const P = require('bluebird');
const {logger} = require('../core');
const { ResourceName } = require('../shared/enums');
const { getLocationRefs, getPractitionerRef, parseRef, getPatientUuid } = require('../shared/utils');

class ResourceService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new ResourceService(ctx);
  }

  /**
   *
   * @param {string | int} nhsNumber
   * @param {string} token
   * @return Promise
   */
  async fetchPatients(nhsNumber) {
    logger.info('services/resourceService|getPatients', {nhsNumber});

    const { patientCache } = this.ctx.cache;
    const exists = patientCache.byNhsNumber.exists(nhsNumber);
    if (exists) return {ok: false};

    const { resourcesRestService, tokenService } = this.ctx.services;
    try {
      const token = await tokenService.get();
      const data = await resourcesRestService.getPatients(nhsNumber, token);
      await P.each(data.entry, async (x) => {
        const patient = x.resource;
        const uuid = patient.id; //@TODO array of ids ???

        const exists = await patientCache.byUuid.exists(uuid);
        if (exists) return;

        await patientCache.byUuid.set(uuid, nhsNumber, patient);
        await patientCache.byNhsNumber.set(nhsNumber, uuid);
      });
    } catch (err) {
      throw err;
    }
  }

  //@TODO think about name
  /**
   *
   * @param {string | number} nhsNumber
   * @param {string} resourceName
   * @returns {Promise<*>}
   */
  async fetchPatientResources(nhsNumber, resourceName) {
    logger.info('services/resourceService|getPatientResources', {nhsNumber, resourceName});

    const { patientCache, resourceCache, fetchCache } = this.ctx.cache;
    const existsByResource = patientCache.byResource.exists(nhsNumber, resourceName);
    if (existsByResource) return false;

    const { resourcesRestService, patientService, tokenService } = this.ctx.services;
    const patientBundle = await patientService.getPatientBundle(nhsNumber);
    const data = {
      resource: [resourceName],
      patients: patientBundle
    };
    const token = await tokenService.get();
    const response = await resourcesRestService.getPatientResources(nhsNumber, data, token);
    if (!response.entry) return false;

    if (resourceName === ResourceName.PATIENT) {
      await patientService.updateBundle();
      await resourceCache.byUuid.deleteAll(resourceName);
    }

    await fetchCache.deleteAll(); //TODO: resourceCache.byReference ???

    await P.each(data.entry, async (x) => {
      if (x.resource.resourceType !== resourceName) return;

      const resource = x.resource;
      const uuid = resource.uuid;
      const patientUuid = getPatientUuid(resource);

      await resourceCache.byUuid.set(resourceName, uuid, resource);
      await resourceCache.byPatientUuid.set(patientUuid, resourceName, uuid);
      await resourceCache.byNhsNumber.set(nhsNumber, resourceName, uuid);

      const practitionerRef = getPractitionerRef(resource);
      if (practitionerRef) {
        const practitionerUuid = parseRef(practitionerRef).uuid;
        await resourceCache.byUuid.setPractitionerUuid(resourceName, uuid, practitionerUuid);
        await this.fetchPractitioner(practitionerRef, resourceName);
      }
    });
  }

  async fetchPractitioner(reference, resourceName) {
    logger.info('services/resourceService|fetchPractitioner', { reference, resourceName });

    // resource will be null if either:
    // - the practitioner is already cached; or
    // - the practioner is already in the process of being fetched in an earlier iteration
    const { resource } = await this.fetchResource(reference);
    if (!resource) return;

    // ensure organisation records for practioner are also fetched and cached
    await P.each(resource.practitionerRole, async (role) => {
      const organisationRef = role.managingOrganization.reference;
      const { resource } = await this.fetchResource(organisationRef);
      if (!resource) return;

      if (resourceName === ResourceName.PATIENT) {
        const locationRefs = getLocationRefs(resource);
        await P.each(locationRefs, async (locationRef) => this.fetchResource(locationRef));
      }
    });
  }

  async fetchResource(reference) {
    logger.info('services/resourceService|fetchResource', { reference });

    const { resourceName, uuid } = parseRef(reference);
    const { fetchCache, resourceCache } = this.ctx.cache;

    const cached  = await resourceCache.byUuid.exists(resourceName, uuid);
    if (cached) return { ok: false };

    const fetching = await fetchCache.exists(reference);
    if (fetching) return { ok: false };

    const { tokenService, resourceRestService } = this.ctx.services;
    const token = await tokenService.get();
    const resource = await resourceRestService.getResource(reference, token);
    await resourceCache.byUuid.set(resourceName, uuid, resource);

    return {
      ok: true,
      resource
    };
  }
}

module.exports = ResourceService;
