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

const ExecutionContextMock = require('../../mocks/context');
const { BadRequestError } = require('../../../lib2/errors');
const CheckNhsNumberCommand = require('../../../lib2/commands/checkNhsNumber');

describe('ripple-cdr-openehr/lib/commands/checkNhsNumber', () => {
  let ctx;
  let session;

  let recordStateService;
  let ehrSessionService;
  let nhsNumberService;
  let phrFeedService;

  beforeEach(() => {
    ctx = new ExecutionContextMock();
    session = {
      nhsNumber: 9999999000,
      email: 'john.doe@example.org'
    };

    recordStateService = ctx.services.recordStateService;
    ehrSessionService = ctx.services.ehrSessionService;
    nhsNumberService = ctx.services.nhsNumberService;
    phrFeedService = ctx.services.phrFeedService;
  });

  it('should throw invalid or missing patientId error', async () => {
    session.nhsNumber = 'foo';

    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = command.execute();

    await expectAsync(actual).toBeRejectedWith(new BadRequestError('patientId foo is invalid'));
  });

  it('should return response when data still loading', async () => {
    const expected = {
      status: 'loading_data',
      new_patient: true,
      responseNo: 2,
      nhsNumber: 9999999000
    };

    const recordState = {
      new_patient: true,
      requestNo: 1,
      status: 'loading_data'
    };
    recordStateService.getByPatientId.and.resolveValue(recordState);

    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = await command.execute();

    expect(recordStateService.getByPatientId).toHaveBeenCalledWith(9999999000);
    expect(recordStateService.update).toHaveBeenCalledWith(9999999000, {
      new_patient: true,
      requestNo: 2,
      status: 'loading_data'
    });

    expect(actual).toEqual(expected);
  });

  it('should return response when data loading finished', async () => {
    const expected = {
      status: 'ready',
      nhsNumber: 9999999000
    };

    const recordState = {
      new_patient: true,
      requestNo: 2,
      status: 'ready'
    };
    recordStateService.getByPatientId.and.resolveValue(recordState);

    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = await command.execute();

    expect(recordStateService.getByPatientId).toHaveBeenCalledWith(9999999000);
    expect(recordStateService.update).toHaveBeenCalledWith(9999999000, {
      new_patient: true,
      requestNo: 3,
      status: 'ready'
    });

    expect(actual).toEqual(expected);
  });

  it('should initiate loading data and return response', async () => {
    const expected = {
      status: 'loading_data',
      new_patient: false,
      responseNo: 2,
      nhsNumber: 9999999000
    };

    recordStateService.getByPatientId.and.resolveValues(
      null,
      {
        status: 'loading_data',
        new_patient: 'not_known_yet',
        requestNo: 2
      }
    );
    recordStateService.create.and.resolveValue();

    const ehrSession = {
      id: '182bdb28-d257-4a99-9a41-441c49aead0c'
    };
    ehrSessionService.start.and.resolveValue(ehrSession);

    const data = {
      created: false
    };
    nhsNumberService.check.and.resolveValue(data);

    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = await command.execute();

    expect(recordStateService.getByPatientId.calls.argsFor(0)).toEqual([9999999000]);
    expect(recordStateService.create).toHaveBeenCalledWith(9999999000, {
      status: 'loading_data',
      new_patient: 'not_known_yet',
      requestNo: 1
    });
    expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
    expect(nhsNumberService.check).toHaveBeenCalledWith('ethercis', '182bdb28-d257-4a99-9a41-441c49aead0c', 9999999000);

    expect(recordStateService.getByPatientId.calls.argsFor(1)).toEqual([9999999000]);
    expect(recordStateService.update).toHaveBeenCalledWith(9999999000, {
      status: 'loading_data',
      new_patient: false,
      requestNo: 2
    });

    expect(actual).toEqual(expected);
  });

  it('should create standard feed when new patient', async () => {
    const expected = {
      status: 'loading_data',
      new_patient: true,
      responseNo: 2,
      nhsNumber: 9999999000
    };

    recordStateService.getByPatientId.and.resolveValues(
      null,
      {
        status: 'loading_data',
        new_patient: 'not_known_yet',
        requestNo: 2
      }
    );
    recordStateService.create.and.resolveValue();

    const ehrSession = {
      id: '182bdb28-d257-4a99-9a41-441c49aead0c'
    };
    ehrSessionService.start.and.resolveValue(ehrSession);

    const data = {
      created: true
    };
    nhsNumberService.check.and.resolveValue(data);
    phrFeedService.create.and.resolveValue();

    const command = new CheckNhsNumberCommand(ctx, session);
    const actual = await command.execute();

    expect(recordStateService.getByPatientId.calls.argsFor(0)).toEqual([9999999000]);
    expect(recordStateService.create).toHaveBeenCalledWith(9999999000, {
      status: 'loading_data',
      new_patient: 'not_known_yet',
      requestNo: 1
    });
    expect(ehrSessionService.start).toHaveBeenCalledWith('ethercis');
    expect(nhsNumberService.check).toHaveBeenCalledWith('ethercis', '182bdb28-d257-4a99-9a41-441c49aead0c', 9999999000);
    expect(phrFeedService.create).toHaveBeenCalledWith({
      email: 'john.doe@example.org',
      author: 'Helm PHR service',
      name: 'Leeds Live - Whats On',
      landingPageUrl: 'https://www.leeds-live.co.uk/best-in-leeds/whats-on-news/',
      rssFeedUrl: 'https://www.leeds-live.co.uk/news/?service=rss'
    });

    expect(recordStateService.getByPatientId.calls.argsFor(1)).toEqual([9999999000]);
    expect(recordStateService.update).toHaveBeenCalledWith(9999999000, {
      status: 'loading_data',
      new_patient: true,
      requestNo: 2
    });

    expect(actual).toEqual(expected);
  });
});
