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

  4 July 2018

*/

'use strict';

const debug = require('debug')('qewd-openid-connect:account');

function initialise_account(qoper8) {
  debug('initialise account');

  const q = qoper8;

  class Account {
    constructor(id, userObj) {
      this.accountId = id; // the property named accountId is important to oidc-provider
      this.nhsNumber = userObj.nhsNumber;
      this.email = userObj.email;
    }

    // claims() should return or resolve with an object with claims that are mapped 1:1 to
    // what your OP supports, oidc-provider will cherry-pick the requested ones automatically

    claims() {
      debug('claims: for account id = %s', this.accountId);

      return {
        sub: this.accountId,
        email: this.email,
        nhsNumber: this.nhsNumber,
      };
    }

    static async findById(ctx, id) {
      debug('findById: %s', id);

      const results = await q.send_promise({
        type: 'getUser',
        params: {
          id: id
        }
      })
      .then (function(result) {
        debug('result = %j', result);
        if (result.message.error) return undefined;
        delete result.message.ewd_application;
        debug('returned message = %j', result.message);
        return result.message;
      });

      debug('results = %j', results);
      const record = new Account(id, results);
      debug('account = %j', record);

      return record;
    }

    static async authenticate(email, password) {
      if (!email || email === '') return {error: 'Email must be provided'};
      if (!password || password === '') return {error: 'Password must be provided'};

      debug('validating user');
      const results = await q.send_promise({
        type: 'validateUser',
        params: {
          email: email,
          password: password
        }
      })
      .then (function(result) {
        debug('result = %j', result);
        delete result.message.ewd_application;
        if (result.message.error) return result.message;
        debug('returned message = %j', result.message);
        return result.message;
      });

      debug('results = %j', results);

      if (results.error) return results;

      const response = new this(email, results);
      debug('account = %j', response);

      return response;
    }
  }

  return Account;
}

module.exports = initialise_account;
