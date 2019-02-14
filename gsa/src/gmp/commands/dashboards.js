/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import uuid from 'uuid/v4';

import {isDefined} from '../utils/identity';

import logger from '../log';

import GmpCommand from './gmp';
import registerCommand from '../command';

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

const convertLoadedSettings = (settings = {}, name) => {
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
      const {setting} = data.get_settings.get_settings_response;

      if (!isDefined(setting)) {
        return response.setData({});
      }

      const {value, name} = setting;
      let config;
      try {
        config = JSON.parse(value);
      } catch (e) {
        log.warn('Could not parse dashboard setting', value);
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
