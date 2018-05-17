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
import 'core-js/fn/object/entries';

import {is_defined, is_array} from 'gmp/utils/identity';

import {createRow, createItem} from 'web/components/sortable/grid';

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

const settingsV1toDashboardSettings = ({data: rows} = {}) => ({
  rows: rows.map(({height, data}) =>
    createRow(data.map(item => createItem({
      name: item.name,
      filterId: item.filt_id,
    })), height)),
  });

const dashboardSettings2SettingsV1 = ({rows}) => ({
  version: 1,
  data: rows.map(({height, items: rowItems}) => ({
    height,
    type: 'row',
    data: rowItems.map(({id, filterId, ...other}) => ({
      ...other,
      filt_id: filterId,
      type: 'chart',
    })),
  })),
});

const convertSettings = (settings = {}) => {
  if (settings.version === 1) {
    return settingsV1toDashboardSettings(settings);
  }
  return settings;
};

const convertLoadedSettings = (settings = {}) => {
  /* currently the loaded settings contain an object with settings for all dashboards
    {
       dashboardId1: settings1,
       dashboardId2: settings2,
    }
    the format for the settings itself may vary
  */
  const converted = {};
  Object.entries(settings).forEach(([id, value]) => {
    converted[id] = convertSettings(value);
  });
  return converted;
};

export const receivedDashboardSettings = (id, settings, defaults) => ({
  type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
  id,
  settings,
  defaults,
});

export const receivedDashboardSettingsLoadingError = error => ({
  type: DASHBOARD_SETTINGS_LOADING_ERROR,
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

export const loadSettings = ({gmp}) => (id, defaults) =>
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
    response => dispatch(receivedDashboardSettings(id,
      convertLoadedSettings(response.data), defaults)),
    error => dispatch(receivedDashboardSettingsLoadingError(error)),
  );
};

export const saveSettings = ({gmp}) => (id, settings) =>
  (dispatch, getState) => {

  dispatch(saveDashboardSettings(id, settings));

  const settingsV1 = dashboardSettings2SettingsV1(settings);

  return gmp.dashboard.saveSetting(id, settingsV1)
    .then(
      response => dispatch(savedDashboardSettings()),
      error => dispatch(saveDashboardSettingsError(error)),
    );
};

export const resetSettings = ({gmp}) => id =>
  (dispatch, getState) => {

  const rootState = getState();
  const settingsSelector = getDashboardSettings(rootState);
  const defaults = settingsSelector.getDefaultsById(id);

  dispatch(saveDashboardSettings(id, defaults));

  const settingsV1 = dashboardSettings2SettingsV1(defaults);
  return gmp.dashboard.saveSetting(id, settingsV1)
    .then(
      response => dispatch(savedDashboardSettings()),
      error => dispatch(saveDashboardSettingsError(error)),
    );
};

export const canAddDisplay = ({rows, maxItemsPerRow, maxRows} = {}) => {
  if (is_array(rows) && rows.length > 0 &&
    is_defined(maxItemsPerRow) && is_defined(maxRows)) {
    const lastRow = rows[rows.length - 1];
    return lastRow.items.length < maxItemsPerRow || rows.length < maxRows;
  }
  return true;
};

export const addDisplay = ({gmp}) => (dashboardId, displayId) =>
  (dispatch, getState) => {
  if (!is_defined(displayId) || !is_defined(dashboardId)) {
    return;
  }

  const rootState = getState();
  const settingsSelector = getDashboardSettings(rootState);
  const settings = settingsSelector.getById(dashboardId);
  const {rows: currentRows = [], maxItemsPerRow} = settings || {};

  if (!canAddDisplay(settings)) {
    return;
  }

  const lastRow = is_array(currentRows) && currentRows.length > 0 ?
    currentRows[currentRows.length - 1] : {items: []};

  let rows;
  if (is_defined(maxItemsPerRow) && lastRow.items.length >= maxItemsPerRow) {
    // create new row
    const newRow = createRow([createItem({name: displayId})]);
    rows = [...currentRows, newRow];
  }
  else {
    // add new display to last row
    const newRow = {
      ...lastRow,
      items: [...lastRow.items, createItem({name: displayId})],
    };
    rows = [...currentRows];
    rows.pop();
    rows.push(newRow);
  }

  const newSettings = {
    rows,
  };

  dispatch(saveDashboardSettings(dashboardId, newSettings));

  const settingsV1 = dashboardSettings2SettingsV1(newSettings);
  return gmp.dashboard.saveSetting(dashboardId, settingsV1)
    .then(
      response => dispatch(savedDashboardSettings()),
      error => dispatch(saveDashboardSettingsError(error)),
    );
};

// vim: set ts=2 sw=2 tw=80:
