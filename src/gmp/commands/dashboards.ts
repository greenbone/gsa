/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {v4 as uuid} from 'uuid';
import HttpCommand from 'gmp/commands/http';
import {type GetSettingsResponse} from 'gmp/commands/user';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fastxml';
import logger from 'gmp/log';
import {isArray, isDefined} from 'gmp/utils/identity';

interface DisplayState {
  showLegend?: boolean;
  show3d?: boolean;
}

interface Display {
  id: string;
  displayId: string;
  state?: DisplayState;
}

interface DashboardRow {
  id: string;
  height: number;
  items: Display[];
}

interface DashboardSetting {
  rows?: DashboardRow[];
  title?: string;
  name?: string;
}

interface DashboardSettings {
  name?: string;
  byId?: Record<string, DashboardSetting>;
  dashboards?: string[];
  defaults?: Record<string, DashboardSetting>;
}

type UuidFunc = () => string;

const log = logger.getLogger('gmp.commands.dashboards');

export const DEFAULT_ROW_HEIGHT = 250;

export const createRow = (
  items: Display[],
  height: number = DEFAULT_ROW_HEIGHT,
  uuidFunc: UuidFunc = uuid,
): DashboardRow => ({
  id: uuidFunc(),
  height,
  items,
});

export const createDisplay = (
  displayId: string,
  props?: Omit<Display, 'id' | 'displayId'>,
  uuidFunc: UuidFunc = uuid,
) => {
  const id = uuidFunc();

  return {
    id,
    displayId,
    ...props,
  };
};

const convertLoadedSettings = <
  TSettings extends DashboardSetting | DashboardSettings,
>(
  settings: TSettings = {} as TSettings,
  name: string,
): TSettings extends DashboardSetting
  ? DashboardSetting
  : DashboardSettings => {
  return {
    name,
    ...settings,
  };
};

class DashboardCommand extends HttpCommand {
  async getSetting(id: string) {
    const response = await this.httpGet({
      cmd: 'get_setting',
      setting_id: id,
    });
    const {data} = response as Response<GetSettingsResponse, XmlMeta>;
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
    try {
      const config = JSON.parse(value as string) as
        | DashboardSetting
        | DashboardSettings;
      return response.setData(convertLoadedSettings(config, name));
    } catch {
      log.warn('Could not parse dashboard setting', id, value);
    }
    return response.setData({});
  }

  async saveSetting(
    id: string,
    settings: DashboardSetting | DashboardSettings = {},
  ) {
    log.debug('Saving dashboard settings', id, settings);

    await this.httpPost({
      setting_id: id,
      setting_value: JSON.stringify(settings),
      cmd: 'save_setting',
    });
  }
}

export default DashboardCommand;
