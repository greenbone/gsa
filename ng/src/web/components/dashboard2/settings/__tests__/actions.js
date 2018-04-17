/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

/* eslint-disable max-len */

import {
  DASHBOARD_SETTINGS_LOADING_ERROR,
  DASHBOARD_SETTINGS_LOADING_REQUEST,
  DASHBOARD_SETTINGS_LOADING_SUCCESS,
  receivedDashboardSettings,
  requestDashboardSettings,
  receivedDashboardSettingsLoadingError,
} from '../actions';

describe('action tests', () => {

  test('should create an action to request dashboard settings', () => {
    expect(requestDashboardSettings()).toEqual({
      type: DASHBOARD_SETTINGS_LOADING_REQUEST,
    });
  });

  test('should create an action to receive dashboard settings', () => {
    const data = {foo: 'bar'};

    expect(receivedDashboardSettings(data)).toEqual({
      settings: data,
      type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
    });
  });

  test('should create an action to receive dashboard settings with defaults', () => {
    const data = {foo: 'bar'};
    const defaults = {abc: 'def'};

    expect(receivedDashboardSettings(data, defaults)).toEqual({
      settings: data,
      defaults,
      type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
    });
  });

  test('should create an action to receive an error', () => {
    const error = 'An error occured';

    expect(receivedDashboardSettingsLoadingError(error)).toEqual({
      error,
      type: DASHBOARD_SETTINGS_LOADING_ERROR,
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
