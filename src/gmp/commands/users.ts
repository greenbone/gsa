/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Capabilities from 'gmp/capabilities/capabilities';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import {HttpCommandOptions} from 'gmp/commands/http';
import GmpHttp from 'gmp/http/gmp';
import Response from 'gmp/http/response';
import {XmlMeta, XmlResponseData} from 'gmp/http/transform/fastxml';
import logger from 'gmp/log';
import date, {Date} from 'gmp/models/date';
import {Element} from 'gmp/models/model';
import {PortListElement} from 'gmp/models/portlist';
import Setting, {SettingElement} from 'gmp/models/setting';
import Settings from 'gmp/models/settings';
import User, {
  AUTH_METHOD_LDAP,
  AUTH_METHOD_NEW_PASSWORD,
  AUTH_METHOD_RADIUS,
} from 'gmp/models/user';
import {parseInt} from 'gmp/parser';
import {forEach, map} from 'gmp/utils/array';
import {isArray, isDefined} from 'gmp/utils/identity';
import {severityValue} from 'gmp/utils/number';

interface AuthSettingsResponseData extends XmlResponseData {
  auth_settings: {
    describe_auth_response: {
      group: {
        _name: string;
        auth_conf_setting: {
          key: string;
          value: string | boolean;
          certificate_info?: {
            activation_time: string;
            expiration_time: string;
            md5_fingerprint: string;
            issuer: string;
          };
        }[];
      }[];
    };
  };
}

export interface GetSettingsResponse extends XmlResponseData {
  get_settings: {
    get_settings_response: {
      setting: SettingElement | SettingElement[];
    };
  };
}

interface GetCapabilitiesResponse extends XmlResponseData {
  get_capabilities: {
    help_response: {
      schema: {
        command: {
          name: string;
        }[];
      };
    };
    get_features_response: {
      feature: {
        name: string;
        _enabled: string | number;
        description: string;
      }[];
    };
  };
}

export interface CertificateInfo {
  issuer: string;
  activationTime?: Date;
  expirationTime?: Date;
  md5Fingerprint: string;
}

interface AuthSettingsValues {
  enabled?: boolean;
  ldapsOnly?: boolean;
  certificateInfo?: CertificateInfo;
  [key: string]: string | boolean | CertificateInfo | undefined;
}

interface CreateArguments {
  access_hosts: string;
  auth_method: string;
  comment: string;
  group_ids: string;
  hosts_allow: string;
  name: string;
  password: string;
  role_ids: string;
}

interface SaveArguments {
  id: string;
  access_hosts: string;
  auth_method: string;
  comment: string;
  group_ids: string;
  hosts_allow: string;
  name: string;
  old_name: string;
  password: string;
  role_ids: string;
}

interface DeleteArguments {
  id: string;
  inheritorId: string;
}

interface SaveSettingsArguments {
  autoCacheRebuild?: string;
  timezone?: string;
  oldPassword?: string;
  newPassword?: string;
  userInterfaceDateFormat?: string;
  userInterfaceTimeFormat?: string;
  userInterfaceLanguage?: string;
  rowsPerPage?: string;
  detailsExportFileName?: string;
  listExportFileName?: string;
  reportExportFileName?: string;
  dynamicSeverity?: string;
  defaultSeverity?: string;
  defaultAlert?: string;
  defaultEsxiCredential?: string;
  defaultOpenvasScanConfig?: string;
  defaultOspScanConfig?: string;
  defaultSmbCredential?: string;
  defaultSnmpCredential?: string;
  defaultPortList?: string;
  defaultOpenvasScanner?: string;
  defaultOspScanner?: string;
  defaultSchedule?: string;
  defaultTarget?: string;
  alertsFilter?: string;
  assetsFilter?: string;
  auditReportsFilter?: string;
  configsFilter?: string;
  credentialsFilter?: string;
  filtersFilter?: string;
  groupsFilter?: string;
  hostsFilter?: string;
  notesFilter?: string;
  operatingSystemsFilter?: string;
  overridesFilter?: string;
  permissionsFilter?: string;
  portListsFilter?: string;
  reportsFilter?: string;
  reportFormatsFilter?: string;
  resultsFilter?: string;
  rolesFilter?: string;
  scannersFilter?: string;
  schedulesFilter?: string;
  tagsFilter?: string;
  targetsFilter?: string;
  tasksFilter?: string;
  ticketsFilter?: string;
  tlsCertificatesFilter?: string;
  usersFilter?: string;
  vulnerabilitiesFilter?: string;
  cpeFilter?: string;
  cveFilter?: string;
  nvtFilter?: string;
  certBundFilter?: string;
  dfnCertFilter?: string;
}

const log = logger.getLogger('gmp.commands.users');

const REPORT_COMPOSER_DEFAULTS_SETTING_ID =
  'b6b449ee-5d90-4ff0-af20-7e838c389d39';

export const ROWS_PER_PAGE_SETTING_ID = '5f5a8712-8017-11e1-8556-406186ea4fc5';

export const DEFAULT_SETTINGS = {
  defaultalert: 'f9f5a546-8018-48d0-bef5-5ad4926ea899',
  defaultesxicredential: '83545bcf-0c49-4b4c-abbf-63baf82cc2a7',
  defaultopenvasscanconfig: 'fe7ea321-e3e3-4cc6-9952-da836aae83ce',
  defaultospscanconfig: 'fb19ac4b-614c-424c-b046-0bc32bf1be73',
  defaultsmbcredential: 'a25c0cfe-f977-417b-b1da-47da370c03e8',
  defaultsnmpcredential: '024550b8-868e-4b3c-98bf-99bb732f6a0d',
  defaultsshcredential: 'a25c0cfe-f977-417b-b1da-47da370c03e8',
  defaultportlist: 'd74a9ee8-7d35-4879-9485-ab23f1bd45bc',
  defaultopenvasscanner: 'f7d0f6ed-6f9e-45dc-8bd9-05cced84e80d',
  defaultospscanner: 'b20697c9-be0a-4cd4-8b4d-5fe7841ebb03',
  defaultschedule: '778eedad-5550-4de0-abb6-1320d13b5e18',
  defaulttarget: '23409203-940a-4b4a-b70c-447475f18323',
};

export const DEFAULT_FILTER_SETTINGS = {
  alert: 'b833a6f2-dcdc-4535-bfb0-a5154b5b5092',
  asset: '0f040d06-abf9-43a2-8f94-9de178b0e978',
  audit: 'aaf1b63b-55a6-40ee-ae06-e8e50726f55a',
  auditreport: '45414da7-55f0-44c1-abbb-6b7d1126fbdf',
  certbund: 'e4cf514a-17e2-4ab9-9c90-336f15e24750',
  cpe: '3414a107-ae46-4dea-872d-5c4479a48e8f',
  credential: '186a5ac8-fe5a-4fb1-aa22-44031fb339f3',
  cve: 'def63b5a-41ef-43f4-b9ef-03ef1665db5d',
  dfncert: '312350ed-bc06-44f3-8b3f-ab9eb828b80b',
  filter: 'f9691163-976c-47e7-ad9a-38f2d5c81649',
  group: 'f722e5a4-88d8-475f-95b9-e4dcafbc075b',
  host: '37562dfe-1f7e-4cae-a7c0-fa95e6f194c5',
  note: '96abcd5a-9b6d-456c-80b8-c3221bfa499d',
  nvt: 'bef08b33-075c-4f8c-84f5-51f6137e40a3',
  operatingsystem: 'f608c3ec-ce73-4ff6-8e04-7532749783af',
  override: 'eaaaebf1-01ef-4c49-b7bb-955461c78e0a',
  permission: 'ffb16b28-538c-11e3-b8f9-406186ea4fc5',
  policy: 'a17e1497-b27d-4389-9860-2f3b01dff9b2',
  portlist: '7d52d575-baeb-4d98-bb68-e1730dbc6236',
  report: '48ae588e-9085-41bc-abcb-3d6389cf7237',
  reportconfig: 'eca9738b-4339-4a3d-bd13-3c61173236ab',
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
} as const;

const PARAM_KEYS = {
  DATE: 'date_format',
  TIME: 'time_format',
} as const;

const saveDefaultFilterSettingId = (entityType: string) =>
  `settings_filter:${DEFAULT_FILTER_SETTINGS[entityType]}`;

export const transformSettingName = (name: string) =>
  name.toLowerCase().replace(/ |-/g, '');

export class UserCommand extends EntityCommand<User, PortListElement> {
  constructor(http: GmpHttp) {
    super(http, 'user', User);
  }

  async currentAuthSettings(options: HttpCommandOptions = {}) {
    const response = await this.httpGet(
      {
        cmd: 'auth_settings',
        name: '--', // only used in old xslt and can be any string
      },
      options,
    );
    const {data} = response as Response<AuthSettingsResponseData, XmlMeta>;
    const settings = new Settings();
    if (isDefined(data.auth_settings?.describe_auth_response)) {
      forEach(data.auth_settings.describe_auth_response.group, group => {
        const values: AuthSettingsValues = {};

        forEach(group.auth_conf_setting, setting => {
          if (setting.key === 'enable') {
            values.enabled = setting.value === true;
          } else if (setting.key === 'ldaps-only') {
            values.ldapsOnly = setting.value === true;
          } else {
            values[setting.key] = setting.value;
          }
          if (isDefined(setting.certificate_info)) {
            const {certificate_info} = setting;
            values.certificateInfo = {
              issuer: certificate_info.issuer,
              md5Fingerprint: certificate_info.md5_fingerprint,
              activationTime: certificate_info.activation_time
                ? date(certificate_info.activation_time)
                : undefined,
              expirationTime: certificate_info.expiration_time
                ? date(certificate_info.expiration_time)
                : undefined,
            };
          }
        });
        settings.set(group._name, values);
      });
    }
    return response.setData(settings);
  }

  async getSetting(id: string) {
    const response = await this.httpGet({
      cmd: 'get_setting',
      setting_id: id,
    });
    const {data} = response as Response<GetSettingsResponse, XmlMeta>;
    const {setting} = data.get_settings.get_settings_response;
    if (!isDefined(setting)) {
      return response.setData(undefined);
    }
    return response.setData(
      isArray(setting) ? new Setting(setting[0]) : new Setting(setting),
    );
  }

  async currentSettings(options: HttpCommandOptions = {}) {
    const response = await this.httpGet(
      {
        cmd: 'get_settings',
      },
      options,
    );
    const settings: Record<string, Setting> = {};
    const {data} = response as Response<GetSettingsResponse, XmlMeta>;
    forEach(data.get_settings.get_settings_response.setting, setting => {
      // set setting keys to lowercase and remove '-'
      const keyName = transformSettingName(setting.name);
      settings[keyName] = new Setting(setting);
    });
    return response.setData(settings);
  }

  async currentCapabilities(options: HttpCommandOptions = {}) {
    const response = await this.httpGet(
      {
        cmd: 'get_capabilities',
      },
      options,
    );
    const {data} = response as Response<GetCapabilitiesResponse, XmlMeta>;
    const {command: commands} = data.get_capabilities.help_response.schema;
    const featuresList = data.get_capabilities.get_features_response.feature;
    const caps = map(commands, command => command.name);
    return response.setData(new Capabilities(caps, featuresList));
  }

  create({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    access_hosts,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    auth_method,
    comment,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    group_ids,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hosts_allow,
    name,
    password,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    role_ids,
  }: CreateArguments) {
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
      auth_method,
      comment,
      'group_ids:': group_ids,
      hosts_allow,
      login: name,
      password,
      'role_ids:': role_ids,
    };
    log.debug('Creating new user', data);
    return this.action(data);
  }

  save({
    id,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    access_hosts = '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    auth_method,
    comment = '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    group_ids,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    hosts_allow,
    name,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    old_name,
    password = '', // needs to be included in httpPost, should be optional in gsad
    // eslint-disable-next-line @typescript-eslint/naming-convention
    role_ids,
  }: SaveArguments) {
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
      comment,
      'group_ids:': group_ids,
      hosts_allow,
      id,
      login: name,
      modify_password: auth_method,
      old_login: old_name,
      password,
      'role_ids:': role_ids,
    };
    log.debug('Saving user', data);
    return this.action(data);
  }

  async delete({id, inheritorId}: DeleteArguments) {
    const data = {
      cmd: 'delete_user',
      id,
      inheritor_id: inheritorId,
    };
    log.debug('Deleting user', data);
    await this.httpPost(data);
  }

  /**
   * @deprecated Use saveSetting instead.
   */
  saveSettings(data: SaveSettingsArguments) {
    log.debug('Saving settings', data);

    return this.httpPost({
      cmd: 'save_my_settings',
      text: data.timezone,
      [PARAM_KEYS.DATE]: data.userInterfaceDateFormat,
      [PARAM_KEYS.TIME]: data.userInterfaceTimeFormat,
      old_password: data.oldPassword,
      password: data.newPassword,
      lang: data.userInterfaceLanguage,
      max: data.rowsPerPage,
      details_fname: data.detailsExportFileName,
      list_fname: data.listExportFileName,
      report_fname: data.reportExportFileName,
      dynamic_severity: data.dynamicSeverity,
      default_severity: severityValue(data.defaultSeverity),
      [`settings_default:${DEFAULT_SETTINGS.defaultalert}`]: data.defaultAlert,
      [`settings_default:${DEFAULT_SETTINGS.defaultesxicredential}`]:
        data.defaultEsxiCredential,
      [`settings_default:${DEFAULT_SETTINGS.defaultopenvasscanconfig}`]:
        data.defaultOpenvasScanConfig,
      [`settings_default:${DEFAULT_SETTINGS.defaultospscanconfig}`]:
        data.defaultOspScanConfig,
      [`settings_default:${DEFAULT_SETTINGS.defaultsmbcredential}`]:
        data.defaultSmbCredential,
      [`settings_default:${DEFAULT_SETTINGS.defaultsnmpcredential}`]:
        data.defaultSnmpCredential,
      [`settings_default:${DEFAULT_SETTINGS.defaultportlist}`]:
        data.defaultPortList,
      [`settings_default:${DEFAULT_SETTINGS.defaultopenvasscanner}`]:
        data.defaultOpenvasScanner,
      [`settings_default:${DEFAULT_SETTINGS.defaultospscanner}`]:
        data.defaultOspScanner,
      [`settings_default:${DEFAULT_SETTINGS.defaultschedule}`]:
        data.defaultSchedule,
      [`settings_default:${DEFAULT_SETTINGS.defaulttarget}`]:
        data.defaultTarget,
      [saveDefaultFilterSettingId('alert')]: data.alertsFilter,
      [saveDefaultFilterSettingId('asset')]: data.assetsFilter,
      [saveDefaultFilterSettingId('auditreport')]: data.auditReportsFilter,
      [saveDefaultFilterSettingId('scanconfig')]: data.configsFilter,
      [saveDefaultFilterSettingId('credential')]: data.credentialsFilter,
      [saveDefaultFilterSettingId('filter')]: data.filtersFilter,
      [saveDefaultFilterSettingId('group')]: data.groupsFilter,
      [saveDefaultFilterSettingId('host')]: data.hostsFilter,
      [saveDefaultFilterSettingId('note')]: data.notesFilter,
      [saveDefaultFilterSettingId('operatingsystem')]:
        data.operatingSystemsFilter,
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
      [saveDefaultFilterSettingId('tlscertificate')]:
        data.tlsCertificatesFilter,
      [saveDefaultFilterSettingId('user')]: data.usersFilter,
      [saveDefaultFilterSettingId('vulnerability')]: data.vulnerabilitiesFilter,
      [saveDefaultFilterSettingId('cpe')]: data.cpeFilter,
      [saveDefaultFilterSettingId('cve')]: data.cveFilter,
      [saveDefaultFilterSettingId('nvt')]: data.nvtFilter,
      [saveDefaultFilterSettingId('certbund')]: data.certBundFilter,
      [saveDefaultFilterSettingId('dfncert')]: data.dfnCertFilter,
      auto_cache_rebuild: data.autoCacheRebuild,
    });
  }

  async saveSetting(settingId: string, settingValue: string | number) {
    return this.httpPost({
      cmd: 'save_setting',
      setting_id: settingId,
      setting_value: settingValue,
    });
  }

  async saveTimezone(settingValue: string | number) {
    return this.httpPost({
      cmd: 'save_setting',
      setting_name: 'Timezone',
      setting_value: settingValue,
    });
  }

  async getReportComposerDefaults() {
    const response = await this.getSetting(REPORT_COMPOSER_DEFAULTS_SETTING_ID);
    const {data: setting} = response;
    if (!isDefined(setting?.value)) {
      return response.setData({});
    }

    try {
      return response.setData(JSON.parse(setting.value as string));
    } catch {
      log.warn(
        'Could not parse saved report composer defaults, setting ' +
          'back to default defaults...',
      );
      return response.setData({});
    }
  }

  saveReportComposerDefaults(defaults: Record<string, unknown> = {}) {
    log.debug('Saving report composer defaults', defaults);

    return this.action({
      cmd: 'save_setting',
      setting_id: REPORT_COMPOSER_DEFAULTS_SETTING_ID,
      setting_value: JSON.stringify(defaults),
    });
  }

  async renewSession() {
    const response = await this.action({
      cmd: 'renew_session',
    });
    const seconds = parseInt(response.data.message);
    return response.setData(
      isDefined(seconds) ? date.unix(seconds) : undefined,
    );
  }

  changePassword(oldPassword: string, newPassword: string) {
    return this.action({
      cmd: 'change_password',
      old_password: oldPassword,
      password: newPassword,
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

export class UsersCommand extends EntitiesCommand<User> {
  constructor(http: GmpHttp) {
    super(http, 'user', User);
  }

  getEntitiesResponse(root: Element) {
    // @ts-expect-error
    return root.get_users.get_users_response;
  }
}
