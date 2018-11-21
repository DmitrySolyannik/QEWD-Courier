/*

 ----------------------------------------------------------------------------
 | authentication-service-phr: Ripple User Authentication MicroService      |
 |                                                                          |
 | Copyright (c) 2017-18 Ripple Foundation Community Interest Company       |
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

  20 June 2018

*/

var transform = require('qewd-transform-json').transform;
var global_config = require('/opt/qewd/mapped/settings/configuration.json');
var helpers = require('./helpers');

var config = require('./startup_config.json');
config.jwt = global_config.jwt;
var local_routes = require('./local_routes.json');

// set userDefined to either Auth0 or OpenId Connect version

//var userDefined = require('./userDefined-auth0.json');

function onStarted() {

  var documents;
  try {
    documents = require('./documents.json');
  }
  catch(err) {}

  if (documents) {
    var msg = {
      type: 'ewd-save-documents',
      params: {
        documents: documents,
        password: this.userDefined.config.managementPassword
      }
    };
    console.log('Initialising Documents from documents.json');
    this.handleMessage(msg, function(response) {
      console.log('QEWD Documents created from text file');
    });
  }

  /*

  // set up timed event to dump out documents to a text file

  var self = this;
  this.dumpDocumentsTimer = setInterval(function() {
    var msg = {
      type: 'ewd-dump-documents',
      params: {
        rootPath: __dirname,
        fileName: 'documents.json',
        password: self.userDefined.config.managementPassword
      }
    };
    console.log('Saving QEWD Database to documents.json');
    self.handleMessage(msg, function(response) {
      console.log('QEWD Database saved');
    });

  }, 300000);

  this.on('stop', function() {
    console.log('Stopping dumpDocumentsTimer');
    clearInterval(self.dumpDocumentsTimer);
  });

  */

}

var userDefined_template = require('./userDefined-openid.json');
var userDefined = transform(userDefined_template, global_config, helpers);
if (process.env.NODE_ENV === 'test') {
  userDefined = require('./spec/support/userDefined-openid.json');
}
console.log('userDefined = ' + JSON.stringify(userDefined, null, 2));

module.exports = {
  config: config,
  routes: local_routes,
  userDefined: userDefined,
  onStarted: function() {
    onStarted.call(this);
  }
};

