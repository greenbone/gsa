/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import {for_each, map} from '../utils/array';
import {is_defined} from '../utils/identity';

import logger from '../log.js';

import Capabilities from '../capabilities/capabilities.js';
import User, {
  AUTH_METHOD_LDAP,
  AUTH_METHOD_NEW_PASSWORD,
  AUTH_METHOD_RADIUS,
} from '../models/user.js';
import Settings from '../models/settings.js';
import ChartPreferences from '../models/chartpreferences.js';

const log = logger.getLogger('gmp.commands.users');

class UserCommand extends EntityCommand {

  constructor(http) {
    super(http, 'user', User);
  }

  currentAuthSettings(options = {}) {
    const pauth = this.httpGet({
      cmd: 'auth_settings',
      name: '--', // only used in old xslt and can be any string
    }, options);

    return pauth.then(response => {
      const settings = new Settings();
      const {data} = response;

      if (is_defined(data.auth_settings) &&
       is_defined(data.auth_settings.describe_auth_response)) {
        for_each(data.auth_settings.describe_auth_response.group, group => {
          const values = {};

          for_each(group.auth_conf_setting, setting => {
            values[setting.key] = setting.value;
            if (is_defined(setting.certificate_info)) {
              values.certificate_info = setting.certificate_info;
            }
          });

          settings.set(group._name, values);
        });
      }

      return response.setData(settings);
    });
  }

  currentSettings(options = {}) {
    return this.httpGet({
      cmd: 'get_my_settings',
    }, options
    ).then(response => {
      const settings = new Settings();
      const {data} = response;
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
      const {data} = response;
      const {command: commands} = data.capabilities.help_response.schema;
      const caps = map(commands, command => command.name);
      return response.setData(new Capabilities(caps));
    });
  }

  currentChartPreferences(options = {}) {
    // FIXME remove after legacy dashboards are obsolete
    return this.httpGet({
      cmd: 'get_my_settings',
    }, options,
    ).then(response => {
      const prefs = response.data.chart_preferences.chart_preference;
      log.debug('ChartPreferences loaded', prefs);
      return response.setData(new ChartPreferences(prefs));
    });
  }

  currentDashboardSettings(options = {}) {
    return this.httpGet({
      cmd: 'get_my_settings',
    }, options,
    ).then(response => {
      const prefs = response.data.chart_preferences.chart_preference;

      log.debug('DashboardSettings loaded', prefs);

      const settings = {};

      for_each(prefs, pref => {
        const {_id: id, value} = pref;

        try {
          settings[id] = JSON.parse(value);
        }
        catch (e) {
          log.warn('Could not parse dashboard setting', pref);
        }
      });

      return response.setData(settings);
    });
  }

  saveDashboardSetting({id, settings}) {
    log.debug('Saving dashboard settings', id, settings);
    return this.action({
      chart_preference_id: id,
      chart_preference_value: JSON.stringify(settings),
      cmd: 'save_chart_preference',
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
    if (auth_method === AUTH_METHOD_LDAP) {
      auth_method = '1';
    }
    else if (auth_method === AUTH_METHOD_RADIUS) {
      auth_method = '2';
    }
    else {
      auth_method = '0';
    }
    const data = {
      cmd: 'create_user',
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
    return this.action(data);
  }

  save({
    id,
    access_hosts = '',
    access_ifaces = '',
    auth_method,
    comment = '',
    group_ids,
    hosts_allow,
    ifaces_allow,
    name,
    old_name,
    password = '', // needs to be included in httpPost, should be optional in gsad
    role_ids,
  }) {
    if (auth_method === AUTH_METHOD_LDAP) {
      auth_method = '2';
    }
    else if (auth_method === AUTH_METHOD_RADIUS) {
      auth_method = '3';
    }
    else if (auth_method === AUTH_METHOD_NEW_PASSWORD) {
      auth_method = '1';
    }
    else {
      auth_method = '0';
    }
    const data = {
      cmd: 'save_user',
      access_hosts,
      access_ifaces,
      comment,
      'group_ids:': group_ids,
      hosts_allow,
      id,
      ifaces_allow,
      login: name,
      modify_password: auth_method,
      old_login: old_name,
      password,
      'role_ids:': role_ids,
    };
    log.debug('Saving user', data);
    return this.action(data);
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

  saveSettings(data) {
    log.debug('Saving settings', data);
    return this.httpPost({
      cmd: 'save_my_settings',
      text: data.timezone,
      old_password: data.oldpassword,
      password: data.newpassword,
      lang: data.userinterfacelanguage,
      max: data.rowsperpage,
      details_fname: data.detailsexportfilename,
      list_fname: data.listexportfilename,
      report_fname: data.reportexportfilename,
      severity_class: data.severityclass,
      dynamic_severity: data.dynamicseverity,
      default_severity: data.defaultseverity,
      /* eslint-disable max-len */
      'settings_default:f9f5a546-8018-48d0-bef5-5ad4926ea899': data.defaultalert,
      'settings_default:fe7ea321-e3e3-4cc6-9952-da836aae83ce': data.defaultopenvasscanconfig,
      'settings_default:fb19ac4b-614c-424c-b046-0bc32bf1be73': data.defaultospscanconfig,
      'settings_default:a25c0cfe-f977-417b-b1da-47da370c03e8': data.defaultsmbcredential,
      'settings_default:024550b8-868e-4b3c-98bf-99bb732f6a0d': data.defaultsnmpcredential,
      'settings_default:d74a9ee8-7d35-4879-9485-ab23f1bd45bc': data.defaultportlist,
      'settings_default:353304fc-645e-11e6-ba7a-28d24461215b': data.defaultreportformat,
      'settings_default:f7d0f6ed-6f9e-45dc-8bd9-05cced84e80d': data.defaultopenvasscanner,
      'settings_default:b20697c9-be0a-4cd4-8b4d-5fe7841ebb03': data.defaultospscanner,
      'settings_default:778eedad-5550-4de0-abb6-1320d13b5e18': data.defaultschedule,
      'settings_default:23409203-940a-4b4a-b70c-447475f18323': data.defaulttarget,
      'settings_filter:4a1334c1-cb93-4a79-8634-103b0a50bdcd': data.agentsfilter,
      'settings_filter:b833a6f2-dcdc-4535-bfb0-a5154b5b5092': data.alertsfilter,
      'settings_filter:0f040d06-abf9-43a2-8f94-9de178b0e978': data.assetsfilter,
      'settings_filter:1a9fbd91-0182-44cd-bc88-a13a9b3b1bef': data.configsfilter,
      'settings_filter:186a5ac8-fe5a-4fb1-aa22-44031fb339f3': data.credentialsfilter,
      'settings_filter:f9691163-976c-47e7-ad9a-38f2d5c81649': data.filtersfilter,
      'settings_filter:96abcd5a-9b6d-456c-80b8-c3221bfa499d': data.notesfilter,
      'settings_filter:eaaaebf1-01ef-4c49-b7bb-955461c78e0a': data.overidesfilter,
      'settings_filter:ffb16b28-538c-11e3-b8f9-406186ea4fc5': data.permissionsfilter,
      'settings_filter:7d52d575-baeb-4d98-bb68-e1730dbc6236': data.portlistsfilter,
      'settings_filter:48ae588e-9085-41bc-abcb-3d6389cf7237': data.reportsfilter,
      'settings_filter:249c7a55-065c-47fb-b453-78e11a665565': data.reportformatsfilter,
      'settings_filter:739ab810-163d-11e3-9af6-406186ea4fc5': data.resultsfilter,
      'settings_filter:f38e673a-bcd1-11e2-a19a-406186ea4fc5': data.rolesfilter,
      'settings_filter:a83e321b-d994-4ae8-beec-bfb5fe3e7336': data.schedulesfilter,
      'settings_filter:108eea3b-fc61-483c-9da9-046762f137a8': data.tagsfilter,
      'settings_filter:236e2e41-9771-4e7a-8124-c432045985e0': data.targetsfilter,
      'settings_filter:1c981851-8244-466c-92c4-865ffe05e721': data.tasksfilter,
      'settings_filter:3414a107-ae46-4dea-872d-5c4479a48e8f': data.cpefilter,
      'settings_filter:def63b5a-41ef-43f4-b9ef-03ef1665db5d': data.cvefilter,
      'settings_filter:bef08b33-075c-4f8c-84f5-51f6137e40a3': data.nvtfilter,
      'settings_filter:adb6ffc8-e50e-4aab-9c31-13c741eb8a16': data.ovalfilter,
      'settings_filter:e4cf514a-17e2-4ab9-9c90-336f15e24750': data.certbundfilter,
      'settings_filter:312350ed-bc06-44f3-8b3f-ab9eb828b80b': data.dfncertfilter,
      'settings_filter:feefe56b-e2da-4913-81cc-1a6ae3b36e64': data.allsecinfofilter,
      /* eslint-enable max-len */
      auto_cache_rebuild: data.autocacherebuild,
    });
  }

  getElementFromRoot(root) {
    return root.get_user.get_users_response.user;
  }
}

class UsersCommand extends EntitiesCommand {

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
