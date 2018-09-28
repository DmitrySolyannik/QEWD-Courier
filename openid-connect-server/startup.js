/*

 ----------------------------------------------------------------------------
 | qewd-openid-connect: QEWD-enabled OpenId Connect Server                  |
 |                                                                          |
 | Copyright (c) 2018 M/Gateway Developments Ltd,                           |
 | Redhill, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
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

  29 August 2018

*/

'use strict';

const requireJson = require('qewd-require-json')('/opt/qewd/mapped');
const config = require('./startup_config.json');
const local_routes = require('./local_routes.json');
const debug = '*ewd*';

let app;
let bodyParser;

config.addMiddleware = function(bp, express) {
  bodyParser = bp;
  app = express;
};

function onStarted() {
  const deleteDocuments = (config.delete_documents === true);
  console.log('Wait a couple of seconds for oidc-provider to be available');

  setTimeout(() => {
    const oidcServer = require('./modules/qewd-openid-connect');
    const oidcConfig = requireJson('./oidc-config.json');
    oidcServer.call(this, app, bodyParser, oidcConfig);
  }, 2000);
}

module.exports = {
  debug: debug,
  config: config,
  routes: local_routes,
  onStarted: onStarted
};

