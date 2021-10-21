/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
import {
  createEntityResponse,
  createHttp,
  createActionResultResponse,
  createResponse,
} from '../testing';

import {
  SCANCONFIG_TREND_STATIC,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';

import {convertPreferences, ScanConfigCommand} from '../scanconfigs';
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
  test('should return single config', () => {
    const response = createEntityResponse('config', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ScanConfigCommand(fakeHttp);
    return cmd.get({id: 'foo'}).then(resp => {
      expect(fakeHttp.request).toHaveBeenCalledWith('get', {
        args: {
          cmd: 'get_config',
          config_id: 'foo',
        },
      });

      const {data} = resp;
      expect(data.id).toEqual('foo');
    });
  });

  test('should import a config', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ScanConfigCommand(fakeHttp);
    return cmd.import({xml_file: 'content'}).then(() => {
      expect(fakeHttp.request).toHaveBeenCalledWith('post', {
        data: {
          cmd: 'import_config',
          xml_file: 'content',
        },
      });
    });
  });

  test('should create a config', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ScanConfigCommand(fakeHttp);
    return cmd
      .create({
        baseScanConfig: 'uuid1',
        name: 'foo',
        scannerId: 's1',
        comment: 'somecomment',
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'create_config',
            base: 'uuid1',
            comment: 'somecomment',
            name: 'foo',
            usage_type: 'scan',
            scanner_id: 's1',
          },
        });
      });
  });

  test('should save a config', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

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
    return cmd
      .save({
        id: 'c1',
        name: 'foo',
        comment: 'somecomment',
        trend,
        select,
        scannerId: 's1',
        scannerPreferenceValues,
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'save_config',
            comment: 'somecomment',
            config_id: 'c1',
            name: 'foo',
            scanner_id: 's1',
            'preference:scanner:scanner:scanner:foo': 'bar',
            'select:AIX Local Security Checks': 1,
            'select:Brute force attacks': 1,
            'trend:AIX Local Security Checks': 1,
            'trend:Family Foo': 0,
          },
        });
      });
  });

  test('should save an in use config with undefined input objects', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ScanConfigCommand(fakeHttp);
    return cmd
      .save({
        id: 'c1',
        name: 'foo',
        comment: 'somecomment',
        trend: undefined,
        select: undefined,
        scannerPreferenceValues: undefined,
        scannerId: undefined,
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'save_config',
            comment: 'somecomment',
            config_id: 'c1',
            name: 'foo',
          },
        });
      });
  });

  test('should save a config family', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const selected = {
      'oid:1': YES_VALUE,
      'oid:2': NO_VALUE,
      'oid:3': YES_VALUE,
    };

    const cmd = new ScanConfigCommand(fakeHttp);
    return cmd
      .saveScanConfigFamily({
        id: 'c1',
        familyName: 'foo',
        selected,
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'save_config_family',
            config_id: 'c1',
            family: 'foo',
            'nvt:oid:1': 1,
            'nvt:oid:3': 1,
          },
        });
      });
  });

  test('should save a config nvt', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

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
    return cmd
      .saveScanConfigNvt({
        id: 'c1',
        oid: '1.2.3',
        timeout: 123,
        preferenceValues,
      })
      .then(() => {
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
  });

  test('should request scan config family data', () => {
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
        all: {
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
      },
    });
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ScanConfigCommand(fakeHttp);
    return cmd
      .editScanConfigFamilySettings({id: 'foo', familyName: 'bar'})
      .then(resp => {
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

  test('should request scan config nvt data', () => {
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

    expect.hasAssertions();

    const cmd = new ScanConfigCommand(fakeHttp);
    return cmd
      .editScanConfigNvtSettings({id: 'foo', oid: '1.2.3'})
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('get', {
          args: {
            cmd: 'get_config_nvt',
            config_id: 'foo',
            oid: '1.2.3',
            name: '',
          },
        });

        const {data: nvt} = resp;
        expect(nvt.id).toEqual('1.2.3');
      });
  });
});
