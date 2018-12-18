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

  16 December 2018

*/

'use strict';

// const path = require('path');
// const fs = require('fs');
const traverse = require('traverse');
const { isNumeric } = require('./validation');

function buildSourceId(host, compositionId) {
  return `${host}-${compositionId.split('::')[0]}`;
}

function flatten(obj) {
  const flatObj = {};

  traverse(obj).map(function (node) {
    if (this.isLeaf) {
      let flatPath = '';
      let slash = '';
      let colon = '';

      const lastPathIndex = this.path.length - 1;
      const pathArr = this.path;

      pathArr.forEach(function (path, index) {
        if (isNumeric(path)) {
          flatPath = flatPath + colon + path;
        } else {
          if (index === lastPathIndex && path[0] === '|' && isNumeric(pathArr[index -1])) {
            slash = '';
          }
          flatPath = flatPath + slash + path;
        }

        slash = '/';
        colon = ':';
      });

      flatObj[flatPath] = node;
    }
  });

  return flatObj;
}

function handleResponse(responseObj, successHandler, errorHandler) {
  if (responseObj.error) {
    errorHandler(responseObj);
  } else {
    successHandler(responseObj.message);
  }
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

// function loadAqlFile(heading)

// function getTextFromFile(fileName) {
//   var text = '';
//   if (fs.existsSync(fileName)) {
//     text = fs.readFileSync(fileName).toString().split(/\r?\n/).join(' ');
//   }
//   return text;
// }

// function loadAQLFile(headingName) {
//   var aqlFile = path.join(__dirname, '/../headings/' + headingName + '.aql');
//   console.log('loading aqlFile ' + aqlFile);
//   return getTextFromFile(aqlFile);
// }

module.exports = {
  buildSourceId,
  flatten,
  handleResponse,
  lazyLoadAdapter
};
