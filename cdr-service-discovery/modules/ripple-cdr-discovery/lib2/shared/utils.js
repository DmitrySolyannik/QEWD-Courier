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

  2 January 2019

*/

'use strict';

const { ResourceName } = require('./enums');

function getLocationRefs(resource) {
  if (!resource.extension) return [];

  return resource.extension
  .filter(x => x.valueReference)
  .map(x => x.valueReference.reference);
}

function getPractitionerRef(resource) {
  if (resource.informationSource) {
    return resource.informationSource.reference;
  }

  if (resource.recorder) {
    return resource.recorder.reference;
  }

  if (resource.asserter) {
    return resource.asserter.reference;
  }

  if (resource.careProvider) {
    let practitionerRef = false;
    let found = false;
    resource.careProvider.forEach(function(record) {
      if (!found && record.reference.indexOf('Practitioner') !== -1) {
        practitionerRef = record.reference;
        found = true;
      }
    });
    return practitionerRef;
  }

  if (resource.performer) {
    return resource.performer.reference;
  }

  // debug('bad resource: %j', resource)

}

function getPatientUuid(resource) {
  return resource.resourceType === ResourceName.PATIENT
    ? resource.id
    : parseRef(resource.patient.reference).uuid;
}

function lazyLoadAdapter(target) {
  if (!target.initialise) {
    throw new Error('target must has initialise method defined.');
  }

  return new Proxy(target, {
    get: (obj, prop) => {
      if (typeof prop === 'symbol' || prop === 'inspect' || Reflect.has(obj, prop)) {
        return Reflect.get(obj, prop);
      }

      Reflect.set(obj, prop, obj.initialise(prop));

      return obj[prop];
    }
  });
}

function parseRef(reference, separator = '/') {
  const pieces = reference.split(separator);
  const resourceName = pieces[0];
  const uuid = pieces[1];

  return {
    resourceName,
    uuid
  };
}

function response(data) {
  return {
    responseFrom: 'discovery_service',
    results: data
  }
}

module.exports = {
  getLocationRefs,
  getPractitionerRef,
  getPatientUuid,
  lazyLoadAdapter,
  parseRef,
  response
};
