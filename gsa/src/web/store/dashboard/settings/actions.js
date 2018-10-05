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
import {isDefined} from 'gmp/utils/identity';

import getDashboardSettings from './selectors';
import {
  addDisplayToSettings,
  canAddDisplay,
} from './utils';

export const DASHBOARD_SETTINGS_LOADING_SUCCESS =
  'DASHBOARD_SETTINGS_LOADING_SUCCESS';
export const DASHBOARD_SETTINGS_LOADING_REQUEST =
  'DASHBOARD_SETTINGS_LOADING_REQUEST';
export const DASHBOARD_SETTINGS_LOADING_ERROR =
  'DASHBOARD_SETTINGS_LOADING_ERROR';

export const DASHBOARD_SETTINGS_SAVING_SUCCESS =
  'DASHBOARD_SETTINGS_SAVING_SUCCESS';
export const DASHBOARD_SETTINGS_SAVING_ERROR =
  'DASHBOARD_SETTINGS_SAVING_ERROR';
export const DASHBOARD_SETTINGS_SAVING_REQUEST =
  'DASHBOARD_SETTINGS_SAVING_REQUEST';

/**
 * Create an action to receive dashboard settings
 *
 * @param {String} id              ID of the dashboard
 * @param {Object} settings        Settings loaded for all dashboards
 * @param {Object} defaultSettings Default settings for the dashboard with the
 *                                 passed ID
 *
 * @returns {Object} The action object
 */
export const receivedDashboardSettings = (id, settings, defaultSettings) => ({
  type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
  id,
  settings,
  defaultSettings,
});

export const receivedDashboardSettingsLoadingError = (id, error) => ({
  type: DASHBOARD_SETTINGS_LOADING_ERROR,
  id,
  error,
});

export const requestDashboardSettings = (id, defaults) => ({
  type: DASHBOARD_SETTINGS_LOADING_REQUEST,
  id,
  defaults,
});

export const savedDashboardSettings = () => ({
  type: DASHBOARD_SETTINGS_SAVING_SUCCESS,
});

export const saveDashboardSettingsError = error => ({
  type: DASHBOARD_SETTINGS_SAVING_ERROR,
  error,
});

export const saveDashboardSettings = (id, settings) => ({
  type: DASHBOARD_SETTINGS_SAVING_REQUEST,
  settings,
  id,
});

export const loadSettings = gmp => (id, defaults) =>
  (dispatch, getState) => {

  const rootState = getState();
  const settingsSelector = getDashboardSettings(rootState);

  if (settingsSelector.getIsLoading()) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(requestDashboardSettings(id, defaults));

  const promise = gmp.dashboards.currentSettings();
  return promise.then(
    response => dispatch(receivedDashboardSettings(id, response.data,
       defaults)),
    error => dispatch(receivedDashboardSettingsLoadingError(id, error)),
  );
};

export const saveSettings = gmp => (id, settings) =>
  (dispatch, getState) => {

  dispatch(saveDashboardSettings(id, settings));

  return gmp.dashboard.saveSetting(id, settings)
    .then(
      response => dispatch(savedDashboardSettings()),
      error => dispatch(saveDashboardSettingsError(error)),
    );
};

export const resetSettings = gmp => id =>
  (dispatch, getState) => {

  const rootState = getState();
  const settingsSelector = getDashboardSettings(rootState);
  const defaults = settingsSelector.getDefaultsById(id);

  dispatch(saveDashboardSettings(id, defaults));

  return gmp.dashboard.saveSetting(id, defaults)
    .then(
      response => dispatch(savedDashboardSettings()),
      error => dispatch(saveDashboardSettingsError(error)),
    );
};

export const addDisplay = gmp => (dashboardId, displayId, uuidFunc) =>
  (dispatch, getState) => {
  if (!isDefined(displayId) || !isDefined(dashboardId)) {
    return Promise.resolve();
  }

  const rootState = getState();
  const settingsSelector = getDashboardSettings(rootState);
  const settings = settingsSelector.getById(dashboardId);

  if (!canAddDisplay(settings)) {
    return Promise.resolve();
  }

  const newSettings = addDisplayToSettings(settings, displayId, uuidFunc);

  dispatch(saveDashboardSettings(dashboardId, newSettings));

  return gmp.dashboard.saveSetting(dashboardId, newSettings)
    .then(
      response => dispatch(savedDashboardSettings()),
      error => dispatch(saveDashboardSettingsError(error)),
    );
};

// vim: set ts=2 sw=2 tw=80:
