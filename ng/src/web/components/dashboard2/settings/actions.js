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
import {is_defined, is_array} from 'gmp/utils/identity';

import getDashboardSettings from './selectors';
import {createRow, createItem} from '../../sortable/grid';

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

const settingsV1toDashboardSettings = settings => {
  const items = {};
  Object.entries(settings).forEach(([id, value]) => {
    const {data: rows} = value;
    items[id] = rows.map(({height, data}) =>
      createRow(data.map(item => createItem({name: item.name})), height));
  });
  return {
    items,
  };
};

const dashboardSettings2SettingsV1 = ({items}) => ({
  version: 1,
  data: items.map(({height, items: rowItems}) => ({
    height,
    type: 'row',
    data: rowItems.map(({id, ...other}) => ({
      ...other,
      type: 'chart',
    })),
  })),
});

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
  const settings = getDashboardSettings(rootState);

  if (settings.getIsLoading()) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(requestDashboardSettings(id, defaults));

  const promise = gmp.user.currentDashboardSettings();
  return promise.then(
    response => dispatch(receivedDashboardSettings(id,
      settingsV1toDashboardSettings(response.data), defaults)),
    error => dispatch(receivedDashboardSettingsLoadingError(error)),
  );
};

export const saveSettings = ({gmp}) => (id, settings) =>
  (dispatch, getState) => {

  dispatch(saveDashboardSettings(id, settings));

  const settingsV1 = dashboardSettings2SettingsV1(settings);

  return gmp.user.saveDashboardSetting(id, settingsV1)
    .then(
      response => dispatch(savedDashboardSettings()),
      error => dispatch(saveDashboardSettingsError(error)),
    );
};

export const resetSettings = ({gmp}) => id =>
  (dispatch, getState) => {

  const rootState = getState();
  const settings = getDashboardSettings(rootState);
  const defaults = settings.getDefaultsById(id);

  dispatch(saveDashboardSettings(id, defaults));

  const settingsV1 = dashboardSettings2SettingsV1(defaults);
  return gmp.user.saveDashboardSetting(id, settingsV1)
    .then(
      response => dispatch(savedDashboardSettings()),
      error => dispatch(saveDashboardSettingsError(error)),
    );
};

export const addDisplay = ({gmp}) => (dashboardId, displayId) =>
  (dispatch, getState) => {
  if (!is_defined(displayId) || !is_defined(dashboardId)) {
    return;
  }

  const rootState = getState();
  const settings = getDashboardSettings(rootState);
  const defaults = settings.getDefaultsById(dashboardId);
  const currentItems = settings.getItemsById(dashboardId) || [];
  const {maxItemsPerRow, maxRows} = defaults;

  const lastRow = is_array(currentItems) && currentItems.length > 0 ?
    currentItems[currentItems.length - 1] : {items: []};

  let items;
  if (is_defined(maxItemsPerRow) && lastRow.items.length >= maxItemsPerRow) {
    if (is_defined(maxRows) && currentItems.length >= maxRows) {
      // dashboard is full
      return;
    }
    const newRow = createRow([createItem({name: displayId})]);
    items = [...currentItems, newRow];
  }
  else {
    const newRow = {
      ...lastRow,
      items: [...lastRow.items, createItem({name: displayId})],
    };
    items = [...currentItems];
    items.pop();
    items.push(newRow);
  }

  const newSettings = {
    ...defaults,
    items,
  };

  dispatch(saveDashboardSettings(dashboardId, newSettings));

  const settingsV1 = dashboardSettings2SettingsV1(newSettings);
  return gmp.user.saveDashboardSetting(dashboardId, settingsV1)
    .then(
      response => dispatch(savedDashboardSettings()),
      error => dispatch(saveDashboardSettingsError(error)),
    );
};

// vim: set ts=2 sw=2 tw=80:
