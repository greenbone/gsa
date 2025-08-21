/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  DashboardCommand,
  DEFAULT_ROW_HEIGHT,
  createDisplay,
  createRow,
} from 'gmp/commands/dashboards';
import {createHttp, createResponse} from 'gmp/commands/testing';
import logger from 'gmp/log';

describe('createRow tests', () => {
  test('should create row with default height', () => {
    const uuid = testing.fn().mockReturnValue(1);
    const display1 = {id: 'foo', displayId: 'foo1'};
    const display2 = {id: 'bar', displayId: 'bar1'};
    expect(createRow([display1, display2], undefined, uuid)).toEqual({
      id: 1,
      items: [display1, display2],
      height: DEFAULT_ROW_HEIGHT,
    });
    expect(uuid).toHaveBeenCalled();
  });

  test('should create row with height', () => {
    const uuid = testing.fn().mockReturnValue(1);
    const display1 = {id: 'foo', displayId: 'foo1'};
    const display2 = {id: 'bar', displayId: 'bar1'};
    expect(createRow([display1, display2], 100, uuid)).toEqual({
      id: 1,
      items: [display1, display2],
      height: 100,
    });
    expect(uuid).toHaveBeenCalled();
  });
});

describe('createDisplay tests', () => {
  test('should create a new item with empty props', () => {
    const uuid = testing.fn().mockReturnValue(1);
    expect(createDisplay('foo1', undefined, uuid)).toEqual({
      id: 1,
      displayId: 'foo1',
    });
    expect(uuid).toHaveBeenCalled();
  });

  test('should create a new item with props', () => {
    const uuid = testing.fn().mockReturnValue(1);
    expect(createDisplay('foo1', {state: {show3d: true}}, uuid)).toEqual({
      id: 1,
      displayId: 'foo1',
      state: {show3d: true},
    });
    expect(uuid).toHaveBeenCalled();
  });
});

describe('DashboardCommand tests', () => {
  test('should allow to load dashboard settings', async () => {
    const mockResponse = createResponse({
      get_settings: {
        get_settings_response: {
          setting: [
            {
              value: '{"rows":[]}',
              name: 'Test Dashboard',
            },
          ],
        },
      },
    });

    const http = createHttp(mockResponse);
    const dashboardCommand = new DashboardCommand(http);
    const response = await dashboardCommand.getSetting('test-id');
    expect(response.data).toEqual({
      name: 'Test Dashboard',
      rows: [],
    });
    expect(http.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_setting',
        setting_id: 'test-id',
      },
    });
  });

  test('should allow to load empty settings', async () => {
    const mockResponse = createResponse({
      get_settings: {
        get_settings_response: {},
      },
    });
    const http = createHttp(mockResponse);
    const dashboardCommand = new DashboardCommand(http);
    const response = await dashboardCommand.getSetting('test-id');
    expect(response.data).toEqual({});
  });

  test('should log warning on invalid JSON when getting settings', async () => {
    const log = logger.getLogger('gmp.commands.dashboards');
    log.warn = testing.fn();
    const mockResponse = createResponse({
      get_settings: {
        get_settings_response: {
          setting: {
            value: 'invalid-json',
            name: 'Test Dashboard',
          },
        },
      },
    });

    const http = createHttp(mockResponse);
    const dashboardCommand = new DashboardCommand(http);
    const response = await dashboardCommand.getSetting('test-id');
    expect(log.warn).toHaveBeenCalledWith(
      'Could not parse dashboard setting',
      'test-id',
      'invalid-json',
    );
    expect(response.data).toEqual({});
  });

  test('should save settings', async () => {
    const mockResponse = createResponse({});
    const http = createHttp(mockResponse);
    const dashboardCommand = new DashboardCommand(http);
    await dashboardCommand.saveSetting('test-id', {
      name: 'Test Dashboard',
      rows: [],
    });
    expect(http.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_setting',
        setting_id: 'test-id',
        setting_value: '{"name":"Test Dashboard","rows":[]}',
      },
    });
  });
});
