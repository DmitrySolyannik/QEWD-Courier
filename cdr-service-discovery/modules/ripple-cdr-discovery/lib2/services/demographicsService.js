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

  17 December 2018

*/

'use strict';

const { parseRef, getOrganizationRef, getLocationRef, parseName, parseAddress } = require('../shared/utils');

class DemographicsService {
  constructor(ctx) {
    this.ctx = ctx;
  }

  static create(ctx) {
    return new DemographicsService(ctx);
  }

  async getDemographics(nhsNumber) {
    const {patientCache, demographicsCache} = this.ctx.cache;

    //@TODO talk regarding this functionality
    // var saved = this.db.use('SavedDiscovery');
    // if (patientId !== 5558526785) {
    //   saved.delete();
    //   saved.setDocument(await patientCache.get());
    // }

    const patientUuid = await patientCache.byNhsNumber.get(nhsNumber);
    const patient = await patientCache.byUuid.get(patientUuid);
    const practitionerUuid = await demographicsCache.byUuid.getPractitionerUuid();
    let practitioner = await demographicsCache.byUuid.get(practitionerUuid);

    const organizationRef = getOrganizationRef(practitioner);
    if (organizationRef) {
      const organizationUuid = parseRef(organizationRef).uuid;
      if (organizationUuid) {
        const organisation = await demographicsCache.byOrganization.get(organizationUuid);
        if (organisation.extension) {
          const locationRef = getLocationRef(organisation);
          const locationUuid = parseRef(locationRef).uuid;
          const location = await demographicsCache.byLocation.get(locationUuid);
          if (location.address && location.address.text) {
            practitioner.address = location.address.text;
          }
        }
      }
    }
    let demographics = {};
    demographics.id = nhsNumber;
    demographics.nhsNumber = nhsNumber;
    demographics.gender = Array.isArray(patient.gender) ? patient.gender[0].toUpperCase() + patient.gender.slice(1) : patient.gender;
    demographics.phone =  patient.telecom && Array.isArray(patient.telecom) ? patient.telecom[0].value : patient.telecom;
    demographics.name = parseName(patient.name[0]);
    demographics.dateOfBirth = new Date(patient.birthDate).getTime();
    demographics.gpName = parseName(practitioner.name);
    demographics.gpAddress = practitioner.address || 'Not known';
    demographics.address = parseAddress(patient.address);

    await demographicsCache.delete();

    return demographics;
  }
}

module.exports = DemographicsService;
