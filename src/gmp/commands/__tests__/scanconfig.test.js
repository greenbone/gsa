/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {convertPreferences, ScanConfigCommand} from 'gmp/commands/scanconfigs';
import {
  createEntityResponse,
  createHttp,
  createHttpMany,
  createActionResultResponse,
  createResponse,
} from 'gmp/commands/testing';
import transform from 'gmp/http/transform/fastxml';
import {
  SCANCONFIG_TREND_STATIC,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';
import {YES_VALUE, NO_VALUE} from 'gmp/parser';

describe('convertPreferences tests', () => {
  test('should convert preferences', () => {
    const prefenceValues = {
      'foo Password:': {
        id: 1,
        value: undefined,
        type: 'password',
      },
      'foo Username:': {
        id: 2,
        value: 'user',
        type: 'entry',
      },
      bar: {
        id: 3,
        value: 'foo',
        type: 'password',
      },
      foo: {
        id: 4,
        type: 'file',
        value: 'ABC',
      },
    };

    expect(convertPreferences(prefenceValues, '1.2.3')).toEqual({
      'file:1.2.3:4:file:foo': 'yes',
      'password:1.2.3:3:password:bar': 'yes',
      'preference:1.2.3:2:entry:foo Username:': 'user',
      'preference:1.2.3:3:password:bar': 'foo',
      'preference:1.2.3:4:file:foo': 'ABC',
    });
  });

  test('should return empty object if preferences are empty', () => {
    expect(convertPreferences(undefined, '1.2.3')).toEqual({});
    expect(convertPreferences({}, '1.2.3')).toEqual({});
  });
});

describe('ScanConfigCommand tests', () => {
  test('should return single config', async () => {
    const response = createEntityResponse('config', {_id: 'foo'});
    const fakeHttp = createHttp(response);
    const cmd = new ScanConfigCommand(fakeHttp);
    const resp = await cmd.get({id: 'foo'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_config',
        config_id: 'foo',
      },
      transform,
    });
    const {data} = resp;
    expect(data.id).toEqual('foo');
  });

  test('should import a config', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new ScanConfigCommand(fakeHttp);
    await cmd.import({xml_file: 'content'});
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'import_config',
        xml_file: 'content',
      },
      transform,
    });
  });

  test('should create a config', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new ScanConfigCommand(fakeHttp);
    await cmd.create({
      baseScanConfig: 'uuid1',
      name: 'foo',
      comment: 'somecomment',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'create_config',
        base: 'uuid1',
        comment: 'somecomment',
        name: 'foo',
        usage_type: 'scan',
      },
      transform,
    });
  });

  test('should save a config', async () => {
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
    const cmd = new ScanConfigCommand(fakeHttp);
    await cmd.save({
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
        comment: 'somecomment',
        config_id: 'c1',
        name: 'foo',
        'preference:scanner:scanner:scanner:foo': 'bar',
        'select:AIX Local Security Checks': 1,
        'select:Brute force attacks': 1,
        'trend:AIX Local Security Checks': 1,
        'trend:Family Foo': 0,
      },
      transform,
    });
  });

  test('should save an in use config with undefined input objects', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const cmd = new ScanConfigCommand(fakeHttp);
    await cmd.save({
      id: 'c1',
      name: 'foo',
      comment: 'somecomment',
      trend: undefined,
      select: undefined,
      scannerPreferenceValues: undefined,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_config',
        comment: 'somecomment',
        config_id: 'c1',
        name: 'foo',
      },
      transform,
    });
  });

  test('should save a config family', async () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);
    const selected = {
      'oid:1': YES_VALUE,
      'oid:2': NO_VALUE,
      'oid:3': YES_VALUE,
    };
    const cmd = new ScanConfigCommand(fakeHttp);
    await cmd.saveScanConfigFamily({
      id: 'c1',
      familyName: 'foo',
      selected,
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('post', {
      data: {
        cmd: 'save_config_family',
        config_id: 'c1',
        family: 'foo',
        'nvt:oid:1': 1,
        'nvt:oid:3': 1,
      },
      transform,
    });
  });

  test('should save a config nvt', async () => {
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
    const cmd = new ScanConfigCommand(fakeHttp);
    await cmd.saveScanConfigNvt({
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
        'preference:1.2.3:0:entry:timeout': 123,
        'preference:1.2.3:1:entry:Foo': 'bar',
        'preference:1.2.3:2:password:Bar': 'foo',
        timeout: 1,
      },
      transform,
    });
  });

  test('should request scan config family data', async () => {
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
    const cmd = new ScanConfigCommand(fakeHttp);
    const resp = await cmd.editScanConfigFamilySettings({
      id: 'foo',
      familyName: 'bar',
    });
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'edit_config_family',
        config_id: 'foo',
        family: 'bar',
      },
      transform,
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

  test('should request scan config nvt data', async () => {
    const response = createResponse({
      get_config_nvt_response: {
        get_nvts_response: {
          nvt: {
            _oid: '1.2.3',
          },
        },
      },
    });
    const fakeHttp = createHttp(response);
    const cmd = new ScanConfigCommand(fakeHttp);
    const resp = await cmd.editScanConfigNvtSettings({id: 'foo', oid: '1.2.3'});
    expect(fakeHttp.request).toHaveBeenCalledWith('get', {
      args: {
        cmd: 'get_config_nvt',
        config_id: 'foo',
        oid: '1.2.3',
        name: '',
      },
      transform,
    });
    const {data: nvt} = resp;
    expect(nvt.id).toEqual('1.2.3');
  });
});
