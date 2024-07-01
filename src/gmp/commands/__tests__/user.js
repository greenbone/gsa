/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {UserCommand, transformSettingName} from '../users';

import {createResponse, createHttp} from '../testing';

describe('UserCommand tests', () => {
  test('should parse auth settinngs in currentAuthSettings', () => {
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
                  certificate_info: 'ipsum',
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
    return cmd.currentAuthSettings().then(resp => {
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

      const fooSettings = settings.get('foo');
      expect(fooSettings.enabled).toEqual(true);

      const barSettings = settings.get('bar');
      expect(barSettings.foo).toEqual('true');
      expect(barSettings.certificateInfo).toEqual('ipsum');
    });
  });

  test('should return the first single setting value if given an array', () => {
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
    return cmd.getSetting({id: '123'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_setting',
          setting_id: {
            id: '123',
          },
        },
      });

      const {data} = resp;

      expect(data).toEqual({_id: '123', name: 'Rows Per Page', value: '42'});
    });
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
  test('should get capabilities', () => {
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

    cmd.currentCapabilities().then(resp => {
      const {data: caps} = resp;

      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_capabilities',
        },
      });

      expect(caps._hasCaps).toBe(true);
      expect(caps.mayAccess('report')).toBe(true);
      expect(caps.mayAccess('task')).toBe(true);
      expect(caps.mayAccess('user')).toBe(false);

      expect(caps._hasFeatures).toBe(true);
      expect(caps.featureEnabled('test_feature_1')).toBe(true);
      expect(caps.featureEnabled('TEST_FEATURE_2')).toBe(true);
      expect(caps.featureEnabled('TEST_FEATURE_3')).toBe(false);
    });
  });
});
