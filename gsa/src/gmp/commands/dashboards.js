/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {v4 as uuid} from 'uuid';

import {isArray, isDefined} from 'gmp/utils/identity';

import logger from 'gmp/log';

import GmpCommand from './gmp';
import registerCommand from 'gmp/command';

const log = logger.getLogger('gmp.commands.dashboards');

export const DEFAULT_ROW_HEIGHT = 250;

export const createRow = (
  items,
  height = DEFAULT_ROW_HEIGHT,
  uuidFunc = uuid,
) => ({
  id: uuidFunc(),
  height,
  items,
});

export const createDisplay = (displayId, props, uuidFunc = uuid) => {
  const id = uuidFunc();

  return {
    id,
    displayId,
    ...props,
  };
};

const settingsV1toDashboardSettings = ({data: rows} = {}, name) => ({
  rows: rows.map(({height, data}) =>
    createRow(
      data.map(item =>
        createDisplay(item.name, {
          filterId: item.filt_id,
        }),
      ),
      height,
    ),
  ),
  name,
});

export const convertLoadedSettings = (settings = {}, name) => {
  if (settings.version === 1) {
    return settingsV1toDashboardSettings(settings, name);
  }
  return {
    name,
    ...settings,
  };
};

class DashboardCommand extends GmpCommand {
  getSetting(id) {
    return this.httpGet({
      cmd: 'get_setting',
      setting_id: id,
    }).then(response => {
      const {data} = response;
      let {setting} = data.get_settings.get_settings_response;

      if (!isDefined(setting)) {
        return response.setData({});
      }

      if (isArray(setting)) {
        // before https://github.com/greenbone/gvmd/pull/1106 it was possible that
        // a setting with the same UUID is added twice to the db
        // therefore use first setting to avoid crash
        setting = setting[0];
      }
      const {value, name} = setting;
      let config;
      try {
        config = JSON.parse(value);
      } catch (e) {
        log.warn('Could not parse dashboard setting', id, value);
        return;
      }
      return response.setData(convertLoadedSettings(config, name));
    });
  }

  saveSetting(id, settings = {}) {
    log.debug('Saving dashboard settings', id, settings);

    return this.action({
      setting_id: id,
      setting_value: JSON.stringify(settings),
      cmd: 'save_setting',
    });
  }
}

registerCommand('dashboard', DashboardCommand);

// vim: set ts=2 sw=2 tw=80:
