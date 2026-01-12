/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import AlertsCommand from 'gmp/commands/alerts';
import {createHttp, createEntitiesResponse} from 'gmp/commands/testing';
import Alert from 'gmp/models/alert';

describe('AlertsCommand tests', () => {
  test('should fetch alerts with default params', async () => {
    const response = createEntitiesResponse('alert', [
      {_id: '1', name: 'Alert1'},
      {_id: '2', name: 'Alert2'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new AlertsCommand(fakeHttp);
    const result = await cmd.get();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_alerts'},
    });
    expect(result.data).toEqual([
      new Alert({
        id: '1',
        name: 'Alert1',
      }),
      new Alert({
        id: '2',
        name: 'Alert2',
      }),
    ]);
  });

  test('should fetch alerts with custom params', async () => {
    const response = createEntitiesResponse('alert', [
      {_id: '3', name: 'Alert3'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new AlertsCommand(fakeHttp);
    const result = await cmd.get({filter: "name='Alert3'"});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_alerts', filter: "name='Alert3'"},
    });
    expect(result.data).toEqual([new Alert({id: '3', name: 'Alert3'})]);
  });

  test('should fetch all alerts', async () => {
    const response = createEntitiesResponse('alert', [
      {_id: '4', name: 'Alert4'},
      {_id: '5', name: 'Alert5'},
    ]);
    const fakeHttp = createHttp(response);

    const cmd = new AlertsCommand(fakeHttp);
    const result = await cmd.getAll();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {cmd: 'get_alerts', filter: 'first=1 rows=-1'},
    });
    expect(result.data).toEqual([
      new Alert({id: '4', name: 'Alert4'}),
      new Alert({id: '5', name: 'Alert5'}),
    ]);
  });
});
