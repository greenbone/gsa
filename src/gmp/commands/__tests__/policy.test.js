/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {PolicyCommand} from 'gmp/commands/policies';
import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
  createHttpMany,
  createResponse,
} from 'gmp/commands/testing';
import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
  BASE_SCAN_CONFIG_ID,
} from 'gmp/models/scanconfig';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';

describe('PolicyCommand tests', () => {
  test('should create new policy', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new PolicyCommand(fakeHttp);
    const resp = await cmd.create({
      comment: 'bar',
      name: 'foo',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_config',
        base: BASE_SCAN_CONFIG_ID,
        comment: 'bar',
        name: 'foo',
        usage_type: 'policy',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should save policy', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const trend = {
      'AIX Local Security Checks': SCANCONFIG_TREND_DYNAMIC,
      'Family Foo': SCANCONFIG_TREND_STATIC,
    };
    const select = {
      'AIX Local Security Checks': YES_VALUE,
      'Brute force attacks': YES_VALUE,
      'Foo Family': NO_VALUE,
    };
    const scannerPreferenceValues = {
      foo: 'bar',
    };

    const cmd = new PolicyCommand(fakeHttp);
    const resp = await cmd.save({
      id: 'c1',
      name: 'foo',
      comment: 'somecomment',
      trend,
      select,
      scannerPreferenceValues,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_config',
        config_id: 'c1',
        name: 'foo',
        comment: 'somecomment',
        'preference:scanner:scanner:scanner:foo': 'bar',
        'select:AIX Local Security Checks': 1,
        'select:Brute force attacks': 1,
        'trend:AIX Local Security Checks': 1,
        'trend:Family Foo': 0,
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should save an in use policy with undefined input objects', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new PolicyCommand(fakeHttp);
    await cmd.save({
      id: 'c1',
      name: 'foo',
      comment: 'somecomment',
      trend: undefined,
      select: undefined,
      scannerPreferenceValues: undefined,
      scannerId: undefined,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_config',
        comment: 'somecomment',
        config_id: 'c1',
        name: 'foo',
      },
    });
  });

  test('should return single policy', async () => {
    const response = createEntityResponse('config', {_id: 'foo'});
    const fakeHttp = createHttp(response);
    const cmd = new PolicyCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_config',
        config_id: 'foo',
      },
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should save a policy nvt', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const preferenceValues = {
      Foo: {
        id: 1,
        value: 'bar',
        type: 'entry',
      },
      Bar: {
        id: 2,
        value: 'foo',
        type: 'password',
      },
    };

    const cmd = new PolicyCommand(fakeHttp);
    await cmd.savePolicyNvt({
      id: 'c1',
      oid: '1.2.3',
      timeout: 123,
      preferenceValues,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_config_nvt',
        config_id: 'c1',
        oid: '1.2.3',
        'password:1.2.3:2:password:Bar': 'yes',
        'preference:scanner:0:scanner:timeout.1.2.3': 123,
        'preference:1.2.3:1:entry:Foo': 'bar',
        'preference:1.2.3:2:password:Bar': 'foo',
        timeout: 1,
      },
    });
  });

  test('should request policy family data', async () => {
    const response = createResponse({
      get_config_family_response: {
        get_nvts_response: {
          nvt: [
            {
              _oid: 1,
            },
            {
              _oid: 2,
            },
          ],
        },
      },
    });
    const responseAll = createResponse({
      get_config_family_response: {
        get_nvts_response: {
          nvt: [
            {
              _oid: 1,
              cvss_base: 1.1,
            },
            {
              _oid: 2,
              cvss_base: 2.2,
            },
            {
              _oid: 3,
              cvss_base: 3.3,
            },
          ],
        },
      },
    });
    const responses = [response, responseAll];
    const fakeHttp = createHttpMany(responses);
    const cmd = new PolicyCommand(fakeHttp);
    const resp = await cmd.editPolicyFamilySettings({
      id: 'foo',
      familyName: 'bar',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'edit_config_family',
        config_id: 'foo',
        family: 'bar',
      },
    });
    const {nvts} = resp.data;
    expect(nvts.length).toEqual(3);
    expect(nvts[0].selected).toEqual(YES_VALUE);
    expect(nvts[0].severity).toEqual(1.1);
    expect(nvts[1].selected).toEqual(YES_VALUE);
    expect(nvts[1].severity).toEqual(2.2);
    expect(nvts[2].selected).toEqual(NO_VALUE);
    expect(nvts[2].severity).toEqual(3.3);
  });
});
