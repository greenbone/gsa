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


const settingsV1toDashboardItems = settings => {
  const content = {};
  Object.entries(settings).forEach(([id, value]) => {
    const {data: rows} = value;
    content[id] = rows.map(({height, data: items}) =>
      createRow(items.map(item => createItem({name: item.name})), height));
  });
  return content;
};

export const receivedDashboardSettings = (data, defaults) => ({
  type: DASHBOARD_SETTINGS_LOADING_SUCCESS,
  items: data,
  defaults,
});

export const receivedDashboardSettingsLoadingError = error => ({
  type: DASHBOARD_SETTINGS_LOADING_ERROR,
  error,
});

export const requestDashboardSettings = () => ({
  type: DASHBOARD_SETTINGS_LOADING_REQUEST,
});

export const loadSettings = ({gmp}) => defaults =>
  (dispatch, getState) => {

  const rootState = getState();
  const settings = getDashboardSettings(rootState);

  if (settings.getIsLoading()) {
    // we are already loading data
    return Promise.resolve();
  }

  dispatch(requestDashboardSettings());

  const promise = gmp.user.currentDashboardSettings();
  return promise.then(
    response => dispatch(receivedDashboardSettings(
      settingsV1toDashboardItems(response.data), defaults)),
    error => dispatch(receivedDashboardSettingsLoadingError(error)),
  );
};

// vim: set ts=2 sw=2 tw=80:
