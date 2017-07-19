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

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import {for_each} from '../utils.js';
import logger from '../log.js';

import Capabilities from '../capabilities.js';
import User from '../models/user.js';
import Settings from '../models/settings.js';
import ChartPreferences from '../models/chartpreferences.js';

const log = logger.getLogger('gmp.commands.users');

export class UserCommand extends EntityCommand {

  constructor(http) {
    super(http, 'user', User);
  }

  currentAuthSettings(options = {}) {
    const pauth = this.httpGet({
      cmd: 'auth_settings',
      name: '--', // only used in old xslt and can be any string
    }, options);

    return pauth.then(response => {
      let settings = new Settings();
      let {data} = response;

      for_each(data.auth_settings.describe_auth_response.group, group => {
        let values = {};

        for_each(group.auth_conf_setting, setting => {
          values[setting.key] = setting.value;
        });

        settings.set(group._name, values);
      });

      return response.setData(settings);
    });
  }

  currentSettings(options = {}) {
    return this.httpGet({
      cmd: 'get_my_settings',
    }, options
    ).then(response => {
      let settings = new Settings();
      let {data} = response;
      for_each(data.get_my_settings.get_settings_response.setting, setting => {
        settings.set(setting.name, {
            id: setting._id,
            comment: setting.comment,
            name: setting.name,
            value: setting.value,
        });
      });
      return response.setData(settings);
    });
  }

  currentCapabilities(options = {}) {
    return this.httpGet({
      cmd: 'get_my_settings',
    }, options,
    ).then(response => {
      let caps = response.data.capabilities.help_response.schema.command;
      return response.setData(new Capabilities(caps));
    });
  }

  currentChartPreferences(options = {}) {
    return this.httpGet({
      cmd: 'get_my_settings',
    }, options,
    ).then(response => {
      let prefs = response.data.chart_preferences.chart_preference;
      log.debug('ChartPreferences loaded', prefs);
      return response.setData(new ChartPreferences(prefs));
    });
  }

  create({
    access_hosts,
    access_ifaces,
    auth_method,
    comment,
    group_ids,
    hosts_allow,
    ifaces_allow,
    name,
    password,
    role_ids,
  }) {
    const data = {
      cmd: 'create_user',
      next: 'get_user',
      access_hosts,
      access_ifaces,
      auth_method,
      comment,
      'group_ids:': group_ids,
      hosts_allow,
      ifaces_allow,
      login: name,
      password,
      'role_ids:': role_ids,
    };
    log.debug('Creating new user', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  save({
    id,
    access_hosts,
    access_ifaces,
    auth_method,
    comment,
    group_ids,
    hosts_allow,
    ifaces_allow,
    name,
    old_name,
    password,
    role_ids,
  }) {
    const data = {
      cmd: 'save_user',
      next: 'get_user',
      access_hosts,
      access_ifaces,
      comment,
      'group_ids:': group_ids,
      hosts_allow,
      id,
      ifaces_allow,
      login: name,
      'modify_password': auth_method,
      'old_login': old_name,
      password,
      'role_ids:': role_ids,
    };
    log.debug('Saving user', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  delete({id, inheritor_id}) {
    const data = {
      cmd: 'delete_user',
      id,
      inheritor_id,
      no_redirect: '1',
    };
    log.debug('Deleting user', data);
    return this.httpPost(data);
  }

  getElementFromRoot(root) {
    return root.get_user.get_users_response.user;
  }
}

export class UsersCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'user', User);
  }

  getEntitiesResponse(root) {
    return root.get_users.get_users_response;
  }
}

register_command('user', UserCommand);
register_command('users', UsersCommand);

// vim: set ts=2 sw=2 tw=80:
