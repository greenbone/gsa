/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  createResponse,
  createHttp,
  createHttpError,
  createActionResultResponse,
} from 'gmp/commands/testing';
import UserCommand, {
  type CertificateInfo,
  DEFAULT_FILTER_SETTINGS,
  saveDefaultFilterSettingId,
  transformSettingName,
} from 'gmp/commands/user';
import {
  AUTH_METHOD_LDAP,
  AUTH_METHOD_NEW_PASSWORD,
  AUTH_METHOD_RADIUS,
} from 'gmp/models/user';

describe('UserCommand tests', () => {
  test('should parse auth settings in currentAuthSettings', async () => {
    const response = createResponse({
      auth_settings: {
        describe_auth_response: {
          group: [
            {
              _name: 'foo',
              auth_conf_setting: [
                {
                  key: 'enable',
                  value: true,
                },
              ],
            },
            {
              _name: 'bar',
              auth_conf_setting: [
                {
                  key: 'foo',
                  value: 'true',
                },
                {
                  certificate_info: {
                    issuer: 'ipsum',
                  },
                },
              ],
            },
          ],
        },
      },
    });
    const fakeHttp = createHttp(response);
    const cmd = new UserCommand(fakeHttp);
    const resp = await cmd.currentAuthSettings();
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'auth_settings',
        name: '--',
      },
    });
    const {data: settings} = resp;
    expect(settings.has('foo')).toEqual(true);
    expect(settings.has('bar')).toEqual(true);
    expect(settings.has('ipsum')).toEqual(false);
    const fooSettings = settings.get('foo') as {enabled: boolean};
    expect(fooSettings.enabled).toEqual(true);
    const barSettings = settings.get('bar') as {
      foo: string;
      certificateInfo: CertificateInfo;
    };
    expect(barSettings.foo).toEqual('true');
    expect(barSettings.certificateInfo.issuer).toEqual('ipsum');
  });

  test('should return the first single setting value if given an array', async () => {
    const response = createResponse({
      get_settings: {
        get_settings_response: {
          setting: [
            {
              _id: '123',
              name: 'Rows Per Page',
              value: '42',
            },
            {
              _id: '123',
              name: 'Rows Per Page',
              value: '21',
            },
          ],
        },
      },
    });
    const fakeHttp = createHttp(response);
    const cmd = new UserCommand(fakeHttp);
    const {data} = await cmd.getSetting('123');
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_setting',
        setting_id: '123',
      },
    });
    expect(data).toBeDefined();
    expect(data?.id).toEqual('123');
    expect(data?.name).toEqual('Rows Per Page');
    expect(data?.value).toEqual('42');
  });

  test('should return no setting if the response does not contain one', async () => {
    const fakeHttp = createHttp(
      createResponse({get_settings: {get_settings_response: {}}}),
    );
    const cmd = new UserCommand(fakeHttp);

    const {data} = await cmd.getSetting('missing');

    expect(data).toBeUndefined();
  });

  test('should parse all authentication setting variants', async () => {
    const response = createResponse({
      auth_settings: {
        describe_auth_response: {
          group: [
            {
              _name: 'ldap',
              auth_conf_setting: [
                {key: 'ldaps-only', value: true},
                {key: 'custom', value: 'value'},
                {
                  key: 'certificate',
                  value: 'present',
                  certificate_info: {
                    issuer: 'issuer',
                    activation_time: '2024-01-01T00:00:00Z',
                    expiration_time: '2025-01-01T00:00:00Z',
                    md5_fingerprint: 'fingerprint',
                  },
                },
              ],
            },
          ],
        },
      },
    });
    const cmd = new UserCommand(createHttp(response));

    const {data: settings} = await cmd.currentAuthSettings();
    const values = settings.get('ldap') as Record<string, unknown>;

    expect(values.ldapsOnly).toBe(true);
    expect(values.custom).toBe('value');
    expect(values.certificateInfo).toMatchObject({
      issuer: 'issuer',
      md5Fingerprint: 'fingerprint',
    });
    expect(values.certificateInfo).toHaveProperty('activationTime');
    expect(values.certificateInfo).toHaveProperty('expirationTime');
  });

  test('should handle missing authentication settings', async () => {
    const cmd = new UserCommand(
      createHttp(createResponse({auth_settings: {}})),
    );

    const {data: settings} = await cmd.currentAuthSettings();

    expect(settings.has('ldap')).toBe(false);
  });

  test('should allow to change password', async () => {
    const response = createActionResultResponse({
      action: 'Change Password',
    });
    const fakeHttp = createHttp(response);
    const cmd = new UserCommand(fakeHttp);
    await cmd.changePassword('oldPassword', 'newPassword');
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'change_password',
        old_password: 'oldPassword',
        password: 'newPassword',
      },
    });
  });
});

describe('UserCommand user lifecycle actions', () => {
  const user = {
    access_hosts: 'localhost',
    comment: 'comment',
    group_ids: ['group-id'],
    hosts_allow: '127.0.0.1',
    name: 'user',
    old_name: 'old-user',
    password: 'password',
    role_ids: ['role-id'],
  };

  test.each([
    [AUTH_METHOD_LDAP, '1'],
    [AUTH_METHOD_RADIUS, '2'],
    ['password', '0'],
  ])(
    'maps %s authentication when creating a user',
    async (authMethod, expected) => {
      const fakeHttp = createHttp(createActionResultResponse());
      const cmd = new UserCommand(fakeHttp);

      await cmd.create({...user, auth_method: authMethod});

      expect(fakeHttp.request).toHaveBeenCalledWith('post', {
        data: expect.objectContaining({
          cmd: 'create_user',
          auth_method: expected,
          login: user.name,
          'group_ids:': user.group_ids,
          'role_ids:': user.role_ids,
        }),
      });
    },
  );

  test.each([
    [AUTH_METHOD_LDAP, '2'],
    [AUTH_METHOD_RADIUS, '3'],
    [AUTH_METHOD_NEW_PASSWORD, '1'],
    ['password', '0'],
  ])(
    'maps %s authentication when saving a user',
    async (authMethod, expected) => {
      const fakeHttp = createHttp(createActionResultResponse());
      const cmd = new UserCommand(fakeHttp);

      await cmd.save({id: 'user-id', ...user, auth_method: authMethod});

      expect(fakeHttp.request).toHaveBeenCalledWith('post', {
        data: expect.objectContaining({
          cmd: 'save_user',
          user_id: 'user-id',
          modify_password: expected,
          old_login: user.old_name,
        }),
      });
    },
  );

  test('deletes a user and saves a setting', async () => {
    const fakeHttp = createHttp(createResponse({success: true}));
    const cmd = new UserCommand(fakeHttp);

    await cmd.delete({id: 'user-id', inheritorId: 'inheritor-id'});
    await cmd.saveSetting('setting-id', 42);

    expect(fakeHttp.request).toHaveBeenNthCalledWith(1, 'post', {
      data: {
        cmd: 'delete_user',
        user_id: 'user-id',
        inheritor_id: 'inheritor-id',
      },
    });
    expect(fakeHttp.request).toHaveBeenNthCalledWith(2, 'post', {
      data: {
        cmd: 'save_setting',
        setting_id: 'setting-id',
        setting_value: 42,
      },
    });
  });
});

describe('UserCommand report composer defaults', () => {
  const setting = (value?: string) =>
    createResponse({
      get_settings: {
        get_settings_response: {
          setting:
            value === undefined
              ? undefined
              : {_id: 'id', name: 'defaults', value},
        },
      },
    });

  test('returns saved defaults when they contain valid JSON', async () => {
    const cmd = new UserCommand(createHttp(setting('{"foo":"bar"}')));

    const {data} = await cmd.getReportComposerDefaults();

    expect(data).toEqual({foo: 'bar'});
  });

  test('returns empty defaults for missing or invalid saved values', async () => {
    const missing = new UserCommand(createHttp(setting()));
    const invalid = new UserCommand(createHttp(setting('not-json')));

    expect((await missing.getReportComposerDefaults()).data).toEqual({});
    expect((await invalid.getReportComposerDefaults()).data).toEqual({});
  });

  test('saves report composer defaults and applies the empty default', async () => {
    const fakeHttp = createHttp(createActionResultResponse());
    const cmd = new UserCommand(fakeHttp);

    await cmd.saveReportComposerDefaults();

    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: expect.objectContaining({
        cmd: 'save_setting',
        setting_value: '{}',
      }),
    });
  });
});

describe('UserCommand session and root helpers', () => {
  test('renews a session when the response contains seconds', async () => {
    const fakeHttp = createHttp(createActionResultResponse({message: '60'}));
    const cmd = new UserCommand(fakeHttp);

    const {data} = await cmd.renewSession();

    expect(data).toBeDefined();
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {cmd: 'renew_session'},
    });
  });

  test('returns an undefined session date for an invalid duration', async () => {
    const cmd = new UserCommand(
      createHttp(createActionResultResponse({message: 'invalid'})),
    );

    expect((await cmd.renewSession()).data).toBeUndefined();
  });

  test('pings the server and extracts a user from the root', async () => {
    const fakeHttp = createHttp(createResponse({success: true}));
    const cmd = new UserCommand(fakeHttp);
    const user = {name: 'user'};

    await cmd.ping();

    expect(fakeHttp.request).toHaveBeenCalledWith('get', {args: {cmd: 'ping'}});
    expect(
      cmd.getElementFromRoot({
        get_user: {get_users_response: {user}},
      }),
    ).toBe(user);
  });
});

describe('UserCommand transformSettingName() function tests', () => {
  test('should transform string to lower case and remove -', () => {
    const str1 = 'foo';
    const str2 = 'fooBar';
    const str3 = 'foo-bar';
    const str4 = 'foo-Bar';
    expect(transformSettingName(str1)).toEqual('foo');
    expect(transformSettingName(str2)).toEqual('foobar');
    expect(transformSettingName(str3)).toEqual('foobar');
    expect(transformSettingName(str4)).toEqual('foobar');
  });
});

test('should get capabilities', async () => {
  const response = createResponse({
    get_capabilities: {
      help_response: {
        schema: {
          command: [
            {
              name: 'get_reports',
            },
            {
              name: 'get_tasks',
            },
          ],
        },
      },
    },
  });
  const fakeHttp = createHttp(response);
  const cmd = new UserCommand(fakeHttp);
  const {data: caps} = await cmd.currentCapabilities();
  expect(fakeHttp.request).toHaveBeenCalledWith('get', {
    args: {
      cmd: 'get_capabilities',
    },
  });

  expect(caps.length).toBe(2);
  expect(caps.mayAccess('report')).toBe(true);
  expect(caps.mayAccess('task')).toBe(true);
  expect(caps.mayAccess('user')).toBe(false);
});

test('should get features', async () => {
  const response = createResponse({
    get_features: {
      get_features_response: {
        feature: [
          {
            _enabled: 1,
            name: 'ENABLE_AGENTS',
          },
          {
            _enabled: 1,
            name: 'ENABLE_OPENVASD',
          },
        ],
      },
    },
  });
  const fakeHttp = createHttp(response);
  const cmd = new UserCommand(fakeHttp);

  const {data: features} = await cmd.currentFeatures();
  expect(fakeHttp.request).toHaveBeenCalledWith('get', {
    args: {
      cmd: 'get_features',
    },
  });

  expect(features.length).toEqual(2);
  expect(features.featureEnabled('ENABLE_AGENTS')).toBe(true);
  expect(features.featureEnabled('ENABLE_OPENVASD')).toBe(true);
  expect(features.featureEnabled('CVSS3_RATINGS')).toBe(false);
});

describe('UserCommand saveTimezone() tests', () => {
  test('should call httpPost with correct args and handle success', async () => {
    const response = createResponse({success: true});
    const fakeHttp = createHttp(response);
    const cmd = new UserCommand(fakeHttp);
    const settingValue = 'Europe/Berlin';
    await cmd.saveTimezone(settingValue);
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_setting',
        setting_name: 'Timezone',
        setting_value: settingValue,
      },
    });
  });

  test('should throw and log on httpPost error', async () => {
    const error = new Error('fail');
    const fakeHttp = createHttpError(error);
    const cmd = new UserCommand(fakeHttp);
    const settingValue = 'Europe/Berlin';
    await expect(cmd.saveTimezone(settingValue)).rejects.toThrow('fail');
  });
});

describe('UserCommand saveSetting() agent defaults', () => {
  test('posts agent/agentgroup/agentinstaller default filter IDs with provided values', async () => {
    const fakeHttp = createHttp(createResponse({success: true}));
    const cmd = new UserCommand(fakeHttp);

    const agentsFilterValue = 'agents-filter-id-123';
    const agentGroupsFilterValue = 'agent-groups-filter-id-456';
    const agentInstallersFilterValue = 'agent-installers-filter-id-789';

    await cmd.saveSetting(
      saveDefaultFilterSettingId('agent'),
      agentsFilterValue,
    );

    await cmd.saveSetting(
      saveDefaultFilterSettingId('agentgroup'),
      agentGroupsFilterValue,
    );

    await cmd.saveSetting(
      saveDefaultFilterSettingId('agentinstaller'),
      agentInstallersFilterValue,
    );

    expect(fakeHttp.request).toHaveBeenNthCalledWith(1, 'post', {
      data: {
        cmd: 'save_setting',
        setting_id: `settings_filter:${DEFAULT_FILTER_SETTINGS.agent}`,
        setting_value: agentsFilterValue,
      },
    });
    expect(fakeHttp.request).toHaveBeenNthCalledWith(2, 'post', {
      data: {
        cmd: 'save_setting',
        setting_id: `settings_filter:${DEFAULT_FILTER_SETTINGS.agentgroup}`,
        setting_value: agentGroupsFilterValue,
      },
    });
    expect(fakeHttp.request).toHaveBeenNthCalledWith(3, 'post', {
      data: {
        cmd: 'save_setting',
        setting_id: `settings_filter:${DEFAULT_FILTER_SETTINGS.agentinstaller}`,
        setting_value: agentInstallersFilterValue,
      },
    });
  });

  test('does not overwrite unrelated defaults when only agent fields are provided', async () => {
    const fakeHttp = createHttp(createResponse({success: true}));
    const cmd = new UserCommand(fakeHttp);

    await cmd.saveSetting(saveDefaultFilterSettingId('agent'), 'A');
    await cmd.saveSetting(saveDefaultFilterSettingId('agentgroup'), 'B');
    await cmd.saveSetting(saveDefaultFilterSettingId('agentinstaller'), 'C');

    expect(fakeHttp.request).toHaveBeenCalledTimes(3);

    const post = 'post';
    const expectData = (settingId: string, value: string) =>
      expect.objectContaining({
        cmd: 'save_setting',
        setting_id: settingId,
        setting_value: value,
      });

    expect(fakeHttp.request).toHaveBeenCalledWith(post, {
      data: expectData(`settings_filter:${DEFAULT_FILTER_SETTINGS.agent}`, 'A'),
    });
    expect(fakeHttp.request).toHaveBeenCalledWith(post, {
      data: expectData(
        `settings_filter:${DEFAULT_FILTER_SETTINGS.agentgroup}`,
        'B',
      ),
    });
    expect(fakeHttp.request).toHaveBeenCalledWith(post, {
      data: expectData(
        `settings_filter:${DEFAULT_FILTER_SETTINGS.agentinstaller}`,
        'C',
      ),
    });

    expect(fakeHttp.request).not.toHaveBeenCalledWith(post, {
      data: expect.objectContaining({
        setting_id: `settings_filter:${DEFAULT_FILTER_SETTINGS.alert}`,
      }),
    });
    expect(fakeHttp.request).not.toHaveBeenCalledWith(post, {
      data: expect.objectContaining({
        setting_id: `settings_filter:${DEFAULT_FILTER_SETTINGS.target}`,
      }),
    });
  });
});

describe('UserCommand currentSettings() naming normalization', () => {
  test('normalizes keys for agent-related defaults', async () => {
    const response = createResponse({
      get_settings: {
        get_settings_response: {
          setting: [
            {_id: 'x1', name: 'Agent Groups Filter', value: 'foo'},
            {_id: 'x2', name: 'Agent-Installers Filter', value: 'bar'},
            {_id: 'x3', name: 'Agents Filter', value: 'baz'},
          ],
        },
      },
    });
    const fakeHttp = createHttp(response);
    const cmd = new UserCommand(fakeHttp);

    const {data: settings} = await cmd.currentSettings();

    expect(settings['agentgroupsfilter']).toBeDefined();
    expect(settings['agentinstallersfilter']).toBeDefined();
    expect(settings['agentsfilter']).toBeDefined();

    expect(settings['agentgroupsfilter'].value).toBe('foo');
    expect(settings['agentinstallersfilter'].value).toBe('bar');
    expect(settings['agentsfilter'].value).toBe('baz');
  });
});
