/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {createResponse, createHttp} from 'gmp/commands/testing';
import {
  CertificateInfo,
  UserCommand,
  transformSettingName,
} from 'gmp/commands/users';

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

    expect.hasAssertions();

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

    expect.hasAssertions();

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

describe('UserCommand capabilities tests', () => {
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
        get_features_response: {
          feature: [
            {
              _enabled: 1,
              name: 'TEST_FEATURE_1',
            },
            {
              _enabled: 1,
              name: 'TEST_FEATURE_2',
            },
          ],
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

    // @ts-expect-error
    expect(caps._hasCaps).toBe(true);
    expect(caps.mayAccess('report')).toBe(true);
    expect(caps.mayAccess('task')).toBe(true);
    expect(caps.mayAccess('user')).toBe(false);

    // @ts-expect-error
    expect(caps._hasFeatures).toBe(true);
    expect(caps.featureEnabled('test_feature_1')).toBe(true);
    expect(caps.featureEnabled('TEST_FEATURE_2')).toBe(true);
    expect(caps.featureEnabled('TEST_FEATURE_3')).toBe(false);
  });
});
