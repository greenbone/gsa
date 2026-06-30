/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import SchedulesCommand from 'gmp/commands/schedules';
import {createEntitiesResponse, createHttp} from 'gmp/commands/testing';
import Schedule from 'gmp/models/schedule';

describe('SchedulesCommand tests', () => {
  test('should fetch schedules with default params', async () => {
    const response = createEntitiesResponse('schedule', [
      {
        _id: '1',
        name: 'Schedule 1',
      },
      {
        _id: '2',
        name: 'Schedule 2',
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new SchedulesCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_schedules',
      },
    });
    expect(result.data).toEqual([
      new Schedule({
        id: '1',
        name: 'Schedule 1',
      }),
      new Schedule({
        id: '2',
        name: 'Schedule 2',
      }),
    ]);
  });

  test('should fetch schedules with custom params', async () => {
    const response = createEntitiesResponse('schedule', [
      {
        _id: '1',
        name: 'Schedule 1',
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new SchedulesCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Schedule 1'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_schedules',
        filter: "name='Schedule 1'",
      },
    });
    expect(result.data).toEqual([
      new Schedule({
        id: '1',
        name: 'Schedule 1',
      }),
    ]);
  });

  test('should fetch all schedules', async () => {
    const response = createEntitiesResponse('schedule', [
      {
        _id: '1',
        name: 'Schedule 1',
      },
      {
        _id: '2',
        name: 'Schedule 2',
      },
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new SchedulesCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_schedules',
        filter: 'first=1 rows=-1',
      },
    });
    expect(result.data).toEqual([
      new Schedule({
        id: '1',
        name: 'Schedule 1',
      }),
      new Schedule({
        id: '2',
        name: 'Schedule 2',
      }),
    ]);
  });
});
