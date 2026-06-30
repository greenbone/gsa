/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ScheduleCommand from 'gmp/commands/schedule';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
} from 'gmp/commands/testing';

describe('ScheduleCommand tests', () => {
  test('should request single schedule', async () => {
    const response = createEntityResponse('schedule', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    const cmd = new ScheduleCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_schedule',
        schedule_id: 'foo',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should allow to create a schedule', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new ScheduleCommand(fakeHttp);
    const resp = await cmd.create({
      name: 'My Schedule',
      comment: 'This is a test schedule',
      icalendar: 'BEGIN:VCALENDAR\nEND:VCALENDAR',
      timezone: 'UTC',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_schedule',
        name: 'My Schedule',
        comment: 'This is a test schedule',
        icalendar: 'BEGIN:VCALENDAR\nEND:VCALENDAR',
        timezone: 'UTC',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should allow to save a schedule', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    const cmd = new ScheduleCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'foo',
      name: 'Updated Schedule',
      comment: 'Updated comment',
      icalendar: 'BEGIN:VCALENDAR\nEND:VCALENDAR',
      timezone: 'UTC',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_schedule',
        schedule_id: 'foo',
        name: 'Updated Schedule',
        comment: 'Updated comment',
        icalendar: 'BEGIN:VCALENDAR\nEND:VCALENDAR',
        timezone: 'UTC',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });
});
