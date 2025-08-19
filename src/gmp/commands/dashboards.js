/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {v4 as uuid} from 'uuid';
import registerCommand from 'gmp/command';
import HttpCommand from 'gmp/commands/http';
import logger from 'gmp/log';
import {isArray, isDefined} from 'gmp/utils/identity';

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

class DashboardCommand extends HttpCommand {
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
      } catch {
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
