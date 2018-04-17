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
  DASHBOARD_SETTINGS_SAVING_REQUEST,
  DASHBOARD_SETTINGS_SAVING_SUCCESS,
  DASHBOARD_SETTINGS_SAVING_ERROR,
  receivedDashboardSettings,
  requestDashboardSettings,
  receivedDashboardSettingsLoadingError,
  saveDashboardSettings,
  savedDashboardSettings,
  saveDashboardSettingsError,
} from '../actions';

describe('receive settings action tests', () => {

  test('should create an action to request dashboard settings', () => {
    expect(requestDashboardSettings()).toEqual({
      type: DASHBOARD_SETTINGS_LOADING_REQUEST,
    });
  });

  test('should create an action to receive dashboard settings with defaults', () => {
    const id = 'a1';
    const data = {foo: 'bar'};
    const defaults = {abc: 'def'};

    expect(receivedDashboardSettings(id, data, defaults)).toEqual({
      items: data,
      defaults,
      id,
      type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
    });
  });
});

describe('received settings action tests', () => {

  test('should create an action after receiving dashboard settings', () => {
    const id = 'a1';
    const data = {foo: 'bar'};

    expect(receivedDashboardSettings(id, data)).toEqual({
      items: data,
      id,
      type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
    });
  });
});

describe('received settings loading error action tests', () => {

  test('should create an action to receive an error during loading', () => {
    const error = 'An error occured';

    expect(receivedDashboardSettingsLoadingError(error)).toEqual({
      error,
      type: DASHBOARD_SETTINGS_LOADING_ERROR,
    });
  });
});

describe('save settings action tests', () => {

  test('should create an action to save dashboard settings', () => {
    const id = 'a1';
    const items = ['a', 'b'];

    expect(saveDashboardSettings(id, items)).toEqual({
      type: DASHBOARD_SETTINGS_SAVING_REQUEST,
      id,
      items,
    });
  });
});

describe('saved settings action tests', () => {

  test('should create an action after dashboard settings have been saved', () => {
    expect(savedDashboardSettings()).toEqual({
      type: DASHBOARD_SETTINGS_SAVING_SUCCESS,
    });
  });
});

describe('save settings error action tests', () => {

  test('should create an action if an error has occurred during saving', () => {
    const error = 'An error';

    expect(saveDashboardSettingsError(error)).toEqual({
      type: DASHBOARD_SETTINGS_SAVING_ERROR,
      error,
    });
  });
});
// vim: set ts=2 sw=2 tw=80:
