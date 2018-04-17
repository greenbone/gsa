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

const settingsV1toDashboardItems = settings => {
  const content = {};
  Object.entries(settings).forEach(([id, value]) => {
    const {data: rows} = value;
    content[id] = rows.map(({height, data: items}) =>
      createRow(items.map(item => createItem({name: item.name})), height));
  });
  return content;
};

const dashboardItems2SettingsV1 = items => ({
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

export const receivedDashboardSettings = (id, data, defaults) => ({
  type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
  items: data,
  id,
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

export const saveDashboardSettings = (id, items) => ({
  type: DASHBOARD_SETTINGS_SAVING_REQUEST,
  items,
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
      settingsV1toDashboardItems(response.data), defaults)),
    error => dispatch(receivedDashboardSettingsLoadingError(error)),
  );
};

export const saveSettings = ({gmp}) => (id, items) => (dispatch, getState) => {

  dispatch(saveDashboardSettings(id, items));

  const settings = dashboardItems2SettingsV1(items);

  return gmp.user.saveDashboardSetting({id, settings})
    .then(
      response => dispatch(savedDashboardSettings()),
      error => dispatch(saveDashboardSettingsError(error)),
    );
};

// vim: set ts=2 sw=2 tw=80:
