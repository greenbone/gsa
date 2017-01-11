/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import {EntityCommand, register_command} from '../command.js';

import {for_each} from '../../utils.js';
import logger from '../../log.js';

import User from '../models/user.js';
import Settings from '../models/settings.js';
import Capabilities from '../models/capabilities.js';
import ChartPreferences from '../models/chartpreferences.js';

const log = logger.getLogger('gmp.commands.users');

export class UserCommand extends EntityCommand {

  constructor(http) {
    super(http, 'user', User);
  }

  currentSettings() {
    return this.httpGet({
      cmd: 'get_my_settings'
    }).then(xhr => {
      let settings = new Settings();
      for_each(xhr.get_my_settings.get_settings_response.setting, setting => {
        settings.set(setting.name, {
            id: setting._id,
            comment: setting.comment,
            name: setting.name,
            value: setting.value,
        });
      });
      return settings;
    });
  }

  currentCapabilities() {
    return this.httpGet({
      cmd: 'get_my_settings'
    }).then(xhr => {
      let caps = xhr.capabilities.help_response.schema.command;
      log.debug('Capabilities loaded', caps);
      return new Capabilities(caps);
    });
  }

  currentChartPreferences() {
    return this.httpGet({
      cmd: 'get_my_settings'
    }).then(xhr => {
      let prefs = xhr.chart_preferences.chart_preference;
      log.debug('ChartPreferences loaded', prefs);
      return new ChartPreferences(prefs);
    });
  }
}

register_command('user', UserCommand);

// vim: set ts=2 sw=2 tw=80:
