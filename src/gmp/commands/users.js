/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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
import logger from 'gmp/log';

import registerCommand from 'gmp/command';

import {forEach, map} from 'gmp/utils/array';
import {isArray, isDefined} from 'gmp/utils/identity';
import {severityValue} from 'gmp/utils/number';

import Capabilities from 'gmp/capabilities/capabilities';

import moment from 'gmp/models/date';

import User, {
  AUTH_METHOD_LDAP,
  AUTH_METHOD_NEW_PASSWORD,
  AUTH_METHOD_RADIUS,
} from 'gmp/models/user';
import Setting from 'gmp/models/setting';
import Settings from 'gmp/models/settings';

import {parseInt} from 'gmp/parser';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.users');

const BUSINESS_PROCESS_MAPS_SETTING_ID = '3ce2d136-bb52-448a-93f0-20069566f877';

const REPORT_COMPOSER_DEFAULTS_SETTING_ID =
  'b6b449ee-5d90-4ff0-af20-7e838c389d39';

export const ROWS_PER_PAGE_SETTING_ID = '5f5a8712-8017-11e1-8556-406186ea4fc5';

export const DEFAULT_FILTER_SETTINGS = {
  alert: 'b833a6f2-dcdc-4535-bfb0-a5154b5b5092',
  asset: '0f040d06-abf9-43a2-8f94-9de178b0e978',
  certbund: 'e4cf514a-17e2-4ab9-9c90-336f15e24750',
  cpe: '3414a107-ae46-4dea-872d-5c4479a48e8f',
  credential: '186a5ac8-fe5a-4fb1-aa22-44031fb339f3',
  cve: 'def63b5a-41ef-43f4-b9ef-03ef1665db5d',
  dfncert: '312350ed-bc06-44f3-8b3f-ab9eb828b80b',
  filter: 'f9691163-976c-47e7-ad9a-38f2d5c81649',
  group: 'f722e5a4-88d8-475f-95b9-e4dcafbc075b',
  host: '37562dfe-1f7e-4cae-a7c0-fa95e6f194c5',
  operatingsystem: 'f608c3ec-ce73-4ff6-8e04-7532749783af',
  ovaldef: 'adb6ffc8-e50e-4aab-9c31-13c741eb8a16',
  override: 'eaaaebf1-01ef-4c49-b7bb-955461c78e0a',
  note: '96abcd5a-9b6d-456c-80b8-c3221bfa499d',
  nvt: 'bef08b33-075c-4f8c-84f5-51f6137e40a3',
  permission: 'ffb16b28-538c-11e3-b8f9-406186ea4fc5',
  portlist: '7d52d575-baeb-4d98-bb68-e1730dbc6236',
  report: '48ae588e-9085-41bc-abcb-3d6389cf7237',
  reportformat: '249c7a55-065c-47fb-b453-78e11a665565',
  result: '739ab810-163d-11e3-9af6-406186ea4fc5',
  role: 'f38e673a-bcd1-11e2-a19a-406186ea4fc5',
  scanconfig: '1a9fbd91-0182-44cd-bc88-a13a9b3b1bef',
  scanner: 'ba00fe91-bdce-483c-b8df-2372e9774ad6',
  schedule: 'a83e321b-d994-4ae8-beec-bfb5fe3e7336',
  tag: '108eea3b-fc61-483c-9da9-046762f137a8',
  target: '236e2e41-9771-4e7a-8124-c432045985e0',
  task: '1c981851-8244-466c-92c4-865ffe05e721',
  ticket: '801544de-f06d-4377-bb77-bbb23369bad4',
  tlscertificate: '34a176c1-0278-4c29-b84d-3d72117b2169',
  user: 'a33635be-7263-4549-bd80-c04d2dba89b4',
  vulnerability: '17c9d269-95e7-4bfa-b1b2-bc106a2175c7',
};

const saveDefaultFilterSettingId = entityType =>
  `settings_filter:${DEFAULT_FILTER_SETTINGS[entityType]}`;

export const transformSettingName = name =>
  name.toLowerCase().replace(/ |-/g, '');

export class UserCommand extends EntityCommand {
  constructor(http) {
    super(http, 'user', User);
  }

  currentAuthSettings(options = {}) {
    const pauth = this.httpGet(
      {
        cmd: 'auth_settings',
        name: '--', // only used in old xslt and can be any string
      },
      options,
    );

    return pauth.then(response => {
      const settings = new Settings();
      const {data} = response;

      if (
        isDefined(data.auth_settings) &&
        isDefined(data.auth_settings.describe_auth_response)
      ) {
        forEach(data.auth_settings.describe_auth_response.group, group => {
          const values = {};

          forEach(group.auth_conf_setting, setting => {
            if (setting.key === 'enable') {
              values.enabled = setting.value === true;
            } else {
              values[setting.key] = setting.value;
            }
            if (isDefined(setting.certificate_info)) {
              values.certificateInfo = setting.certificate_info;
            }
          });
          settings.set(group._name, values);
        });
      }

      return response.setData(settings);
    });
  }

  getSetting(id) {
    return this.httpGet({
      cmd: 'get_setting',
      setting_id: id,
    }).then(response => {
      const {data} = response;
      const {setting} = data.get_settings.get_settings_response;
      if (!isDefined(setting)) {
        return response.setData(undefined);
      }
      // used for the rowsPerPage setting which returns two settings with the same id
      return response.setData(isArray(setting) ? setting[0] : setting);
    });
  }

  currentSettings(options = {}) {
    return this.httpGet(
      {
        cmd: 'get_settings',
      },
      options,
    ).then(response => {
      const settings = {};
      const {data} = response;
      forEach(data.get_settings.get_settings_response.setting, setting => {
        // set setting keys to lowercase and remove '-'
        const keyName = transformSettingName(setting.name);
        settings[keyName] = new Setting(setting);
      });
      return response.setData(settings);
    });
  }

  currentCapabilities(options = {}) {
    return this.httpGet(
      {
        cmd: 'get_capabilities',
      },
      options,
    ).then(response => {
      const {data} = response;
      const {command: commands} = data.get_capabilities.help_response.schema;
      const caps = map(commands, command => command.name);
      return response.setData(new Capabilities(caps));
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
    } else if (auth_method === AUTH_METHOD_RADIUS) {
      auth_method = '2';
    } else {
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
    } else if (auth_method === AUTH_METHOD_RADIUS) {
      auth_method = '3';
    } else if (auth_method === AUTH_METHOD_NEW_PASSWORD) {
      auth_method = '1';
    } else {
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

  delete({id, inheritorId}) {
    const data = {
      cmd: 'delete_user',
      id,
      inheritor_id: inheritorId,
    };
    log.debug('Deleting user', data);
    return this.httpPost(data);
  }

  saveSettings(data) {
    log.debug('Saving settings', data);
    return this.httpPost({
      cmd: 'save_my_settings',
      text: data.timezone,
      old_password: data.oldPassword,
      password: data.newPassword,
      lang: data.userInterfaceLanguage,
      max: data.rowsPerPage,
      details_fname: data.detailsExportFileName,
      list_fname: data.listExportFileName,
      report_fname: data.reportExportFileName,
      dynamic_severity: data.dynamicSeverity,
      default_severity: severityValue(data.defaultSeverity),
      'settings_default:f9f5a546-8018-48d0-bef5-5ad4926ea899':
        data.defaultAlert,
      'settings_default:83545bcf-0c49-4b4c-abbf-63baf82cc2a7':
        data.defaultEsxiCredential,
      'settings_default:fe7ea321-e3e3-4cc6-9952-da836aae83ce':
        data.defaultOpenvasScanConfig,
      'settings_default:fb19ac4b-614c-424c-b046-0bc32bf1be73':
        data.defaultOspScanConfig,
      'settings_default:a25c0cfe-f977-417b-b1da-47da370c03e8':
        data.defaultSmbCredential,
      'settings_default:024550b8-868e-4b3c-98bf-99bb732f6a0d':
        data.defaultSnmpCredential,
      'settings_default:d74a9ee8-7d35-4879-9485-ab23f1bd45bc':
        data.defaultPortList,
      'settings_default:353304fc-645e-11e6-ba7a-28d24461215b':
        data.defaultReportFormat,
      'settings_default:f7d0f6ed-6f9e-45dc-8bd9-05cced84e80d':
        data.defaultOpenvasScanner,
      'settings_default:b20697c9-be0a-4cd4-8b4d-5fe7841ebb03':
        data.defaultOspScanner,
      'settings_default:778eedad-5550-4de0-abb6-1320d13b5e18':
        data.defaultSchedule,
      'settings_default:23409203-940a-4b4a-b70c-447475f18323':
        data.defaultTarget,
      [saveDefaultFilterSettingId('alert')]: data.alertsFilter,
      [saveDefaultFilterSettingId('asset')]: data.assetsFilter,
      [saveDefaultFilterSettingId('scanconfig')]: data.configsFilter,
      [saveDefaultFilterSettingId('credential')]: data.credentialsFilter,
      [saveDefaultFilterSettingId('filter')]: data.filtersFilter,
      [saveDefaultFilterSettingId('group')]: data.groupsFilter,
      [saveDefaultFilterSettingId('host')]: data.hostsFilter,
      [saveDefaultFilterSettingId('note')]: data.notesFilter,
      [saveDefaultFilterSettingId(
        'operatingsystem',
      )]: data.operatingSystemsFilter,
      [saveDefaultFilterSettingId('override')]: data.overridesFilter,
      [saveDefaultFilterSettingId('permission')]: data.permissionsFilter,
      [saveDefaultFilterSettingId('portlist')]: data.portListsFilter,
      [saveDefaultFilterSettingId('report')]: data.reportsFilter,
      [saveDefaultFilterSettingId('reportformat')]: data.reportFormatsFilter,
      [saveDefaultFilterSettingId('result')]: data.resultsFilter,
      [saveDefaultFilterSettingId('role')]: data.rolesFilter,
      [saveDefaultFilterSettingId('scanner')]: data.scannersFilter,
      [saveDefaultFilterSettingId('schedule')]: data.schedulesFilter,
      [saveDefaultFilterSettingId('tag')]: data.tagsFilter,
      [saveDefaultFilterSettingId('target')]: data.targetsFilter,
      [saveDefaultFilterSettingId('task')]: data.tasksFilter,
      [saveDefaultFilterSettingId('ticket')]: data.ticketsFilter,
      [saveDefaultFilterSettingId(
        'tlscertificate',
      )]: data.tlsCertificatesFilter,
      [saveDefaultFilterSettingId('user')]: data.usersFilter,
      [saveDefaultFilterSettingId('vulnerability')]: data.vulnerabilitiesFilter,
      [saveDefaultFilterSettingId('cpe')]: data.cpeFilter,
      [saveDefaultFilterSettingId('cve')]: data.cveFilter,
      [saveDefaultFilterSettingId('nvt')]: data.nvtFilter,
      [saveDefaultFilterSettingId('ovaldef')]: data.ovalFilter,
      [saveDefaultFilterSettingId('certbund')]: data.certBundFilter,
      [saveDefaultFilterSettingId('dfncert')]: data.dfnCertFilter,
      auto_cache_rebuild: data.autoCacheRebuild,
    });
  }

  getReportComposerDefaults() {
    return this.httpGet({
      cmd: 'get_setting',
      setting_id: REPORT_COMPOSER_DEFAULTS_SETTING_ID,
    }).then(response => {
      const {data} = response;
      const {setting = {}} = data.get_settings.get_settings_response;
      const {value} = setting;
      let defaults;

      try {
        defaults = JSON.parse(value);
      } catch (e) {
        log.warn(
          'Could not parse saved report composer defaults, setting ' +
            'back to default defaults...',
        );
        defaults = {};
      }

      return response.setData(defaults);
    });
  }

  saveReportComposerDefaults(defaults = {}) {
    log.debug('Saving report composer defaults', defaults);

    return this.action({
      cmd: 'save_setting',
      setting_id: REPORT_COMPOSER_DEFAULTS_SETTING_ID,
      setting_value: JSON.stringify(defaults),
    });
  }

  getBusinessProcessMaps() {
    return this.httpGet({
      cmd: 'get_setting',
      setting_id: BUSINESS_PROCESS_MAPS_SETTING_ID,
    }).then(response => {
      const {data} = response;
      const {setting = {}} = data.get_settings.get_settings_response;
      const {value} = setting;
      let processMaps;

      try {
        processMaps = JSON.parse(value);
      } catch (e) {
        log.warn(
          'Could not parse saved business process map. Returning empty object.',
        );
        processMaps = {};
      }

      return response.setData(processMaps);
    });
  }

  saveBusinessProcessMaps(processMaps = {}) {
    log.debug('Saving business process maps', processMaps);

    return this.action({
      cmd: 'save_setting',
      setting_id: BUSINESS_PROCESS_MAPS_SETTING_ID,
      setting_value: JSON.stringify(processMaps),
    });
  }

  renewSession() {
    return this.httpPost({
      cmd: 'renew_session',
    }).then(response => {
      const {data} = response;
      const {action_result} = data;
      const seconds = parseInt(action_result.message);
      return response.setData(moment.unix(seconds));
    });
  }

  ping() {
    return this.httpGet({
      cmd: 'ping',
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

registerCommand('user', UserCommand);
registerCommand('users', UsersCommand);

// vim: set ts=2 sw=2 tw=80:
