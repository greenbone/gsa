/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import getDashboardSettings from './selectors';

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

export const DASHBOARD_SETTINGS_SET_DEFAULTS =
  'DASHBOARD_SETTINGS_SET_DEFAULTS';

export const DASHBOARD_SETTINGS_RESET_REQUEST =
  'DASHBOARD_SETTINGS_RESET_REQUEST';
export const DASHBOARD_SETTINGS_RESET_SUCCESS =
  'DASHBOARD_SETTINGS_RESET_SUCCESS';
export const DASHBOARD_SETTINGS_RESET_ERROR = 'DASHBOARD_SETTINGS_RESET_ERROR';

/**
 * Create a load dashboard settings success action
 *
 * @param {String} id              ID of the dashboard
 * @param {Object} settings        Settings loaded for all dashboards
 * @param {Object} defaultSettings Default settings for the dashboard with the
 *                                 passed ID
 *
 * @returns {Object} The action object
 */
export const loadDashboardSettingsSuccess = (
  id,
  settings,
  defaultSettings,
) => ({
  type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
  id,
  settings,
  defaultSettings,
});

export const loadDashboardSettingsError = (id, error) => ({
  type: DASHBOARD_SETTINGS_LOADING_ERROR,
  id,
  error,
});

export const loadDashboardSettingsRequest = id => ({
  type: DASHBOARD_SETTINGS_LOADING_REQUEST,
  id,
});

export const saveDashboardSettingsSuccess = id => ({
  type: DASHBOARD_SETTINGS_SAVING_SUCCESS,
  id,
});

export const saveDashboardSettingsError = (id, error) => ({
  type: DASHBOARD_SETTINGS_SAVING_ERROR,
  id,
  error,
});

export const saveDashboardSettingsRequest = (id, settings) => ({
  type: DASHBOARD_SETTINGS_SAVING_REQUEST,
  settings,
  id,
});

export const setDashboardSettingDefaults = (id, defaults) => ({
  type: DASHBOARD_SETTINGS_SET_DEFAULTS,
  id,
  defaults,
});

export const resetDashboardSettingsRequest = (id, settings) => ({
  type: DASHBOARD_SETTINGS_RESET_REQUEST,
  id,
  settings,
});

export const resetDashboardSettingsSuccess = id => ({
  type: DASHBOARD_SETTINGS_RESET_SUCCESS,
  id,
});

export const resetDashboardSettingsError = (id, error) => ({
  type: DASHBOARD_SETTINGS_RESET_ERROR,
  id,
  error,
});

export const loadSettings = gmp => (id, defaults) => (dispatch, getState) => {
  const rootState = getState();
  const settingsSelector = getDashboardSettings(rootState);

  if (settingsSelector.getIsLoading(id)) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(loadDashboardSettingsRequest(id));

  return gmp.dashboard.getSetting(id).then(
    ({data}) => dispatch(loadDashboardSettingsSuccess(id, data, defaults)),
    error => dispatch(loadDashboardSettingsError(id, error)),
  );
};

export const saveSettings = gmp => (id, settings) => dispatch => {
  dispatch(saveDashboardSettingsRequest(id, settings));

  return gmp.dashboard.saveSetting(id, settings).then(
    () => dispatch(saveDashboardSettingsSuccess(id)),
    error => dispatch(saveDashboardSettingsError(id, error)),
  );
};

export const resetSettings = gmp => id => (dispatch, getState) => {
  const rootState = getState();
  const settingsSelector = getDashboardSettings(rootState);
  const defaults = settingsSelector.getDefaultsById(id);

  dispatch(resetDashboardSettingsRequest(id, defaults));

  return gmp.dashboard.saveSetting(id, defaults).then(
    () => dispatch(resetDashboardSettingsSuccess(id)),
    error => dispatch(resetDashboardSettingsError(id, error)),
  );
};

// vim: set ts=2 sw=2 tw=80:
