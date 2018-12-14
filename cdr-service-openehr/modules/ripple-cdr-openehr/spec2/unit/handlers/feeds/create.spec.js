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
 | Licensed under the Apache License, Version 2.0 (the 'License');          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an 'AS IS' BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  14 December 2018

*/

'use strict';

const mockery = require('mockery');
const CommandMock = require('../../../mocks/command');
const ContextMock = require('../../../mocks/context');

describe('ripple-cdr-openehr/lib/handlers/feeds/create', () => {
  let args;
  let finished;

  let command;
  let CreateFeedCommand;

  let handler;

  beforeAll(() => {
    mockery.enable({
      warnOnUnregistered: false
    });
  });

  afterAll(() => {
    mockery.disable();
  });

  beforeEach(() => {
    args = {
      req: {
        ctx: new ContextMock(),
        body: {
          author: 'ivor.cox@phr.leeds.nhs',
          name: 'BBC News',
          landingPageUrl: 'https://www.bbc.co.uk/news',
          rssFeedUrl: 'https://www.bbc.co.uk/rss'
        }
      },
      session: {
        nhsNumber: 9999999000,
        email: 'john.doe@example.org'
      }
    };
    finished = jasmine.createSpy();

    command = new CommandMock();
    CreateFeedCommand = jasmine.createSpy().and.returnValue(command);
    mockery.registerMock('../../commands/feeds/create', CreateFeedCommand);

    delete require.cache[require.resolve('../../../../lib2/handlers/feeds/create')];
    handler = require('../../../../lib2/handlers/feeds/create');
  });

  afterEach(() => {
    mockery.deregisterAll();
  });

  it('should return response object', async () => {
    const responseObj = {
      author: 'ivor.cox@phr.leeds.nhs',
      name: 'BBC News',
      landingPageUrl: 'https://www.bbc.co.uk/news',
      rssFeedUrl: 'https://www.bbc.co.uk/rss',
      email: 'jane.doe@example.org',
      sourceId: 'eaf394a9-5e05-49c0-9c69-c710c77eda76',
      dateCreated: 1514764800000
    };
    command.execute.and.resolveValue(responseObj);

    await handler(args, finished);

    expect(CreateFeedCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.req.body);

    expect(finished).toHaveBeenCalledWith(responseObj);
  });

  it('should return error object', async () => {
    command.execute.and.rejectValue(new Error('custom error'));

    await handler(args, finished);

    expect(CreateFeedCommand).toHaveBeenCalledWith(args.req.ctx, args.session);
    expect(command.execute).toHaveBeenCalledWith(args.req.body);

    expect(finished).toHaveBeenCalledWith({
      error: 'custom error'
    });
  });
});