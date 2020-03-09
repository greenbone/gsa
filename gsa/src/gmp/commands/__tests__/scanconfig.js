/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import {
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
      'file:1.2.3[file]:foo': 'yes',
      'password:1.2.3[password]:bar': 'yes',
      'preference:1.2.3[entry]:foo Username:': 'user',
      'preference:1.2.3[password]:bar': 'foo',
      'preference:1.2.3[file]:foo': 'ABC',
    });
  });

  test('should return empty object if preferences are empty', () => {
    expect(convertPreferences(undefined, '1.2.3')).toEqual({});
    expect(convertPreferences({}, '1.2.3')).toEqual({});
  });
});

describe('ScanConfigCommand tests', () => {
  test('should return single config', () => {
    const response = createResponse({
      get_config_response: {
        get_configs_response: {
          config: {
            _id: 'foo',
          },
        },
      },
    });
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
        base: 'uuid1',
        name: 'foo',
        scanner_id: 's1',
        comment: 'somecomment',
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'create_config',
            base: 'uuid1',
            comment: 'somecomment',
            name: 'foo',
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
        scanner_preference_values: scannerPreferenceValues,
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'save_config',
            comment: 'somecomment',
            config_id: 'c1',
            name: 'foo',
            'preference:scanner[scanner]:foo': 'bar',
            'select:AIX Local Security Checks': 1,
            'select:Brute force attacks': 1,
            'trend:AIX Local Security Checks': 1,
            'trend:Family Foo': 0,
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
        config_name: 'Foo Config',
        family_name: 'foo',
        selected,
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'save_config_family',
            config_id: 'c1',
            name: 'Foo Config',
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
        config_name: 'Foo Config',
        family_name: 'Foo Family',
        id: 'c1',
        nvt_name: 'Foo Nvt',
        oid: '1.2.3',
        manual_timeout: 123,
        preference_values: preferenceValues,
        timeout: 1,
      })
      .then(() => {
        expect(fakeHttp.request).toHaveBeenCalledWith('post', {
          data: {
            cmd: 'save_config_nvt',
            config_id: 'c1',
            oid: '1.2.3',
            name: 'Foo Config',
            family: 'Foo Family',
            'password:Foo Nvt[password]:Bar': 'yes',
            'preference:scanner[scanner]:timeout.1.2.3': 123,
            'preference:Foo Nvt[entry]:Foo': 'bar',
            'preference:Foo Nvt[password]:Bar': 'foo',
            timeout: 1,
          },
        });
      });
  });

  test('should request scan config data', () => {
    const response = createResponse({
      get_config_response: {
        get_configs_response: {
          config: {
            _id: 'c1',
          },
        },
        get_nvt_families_response: {
          families: {
            family: [
              {
                name: 'f1',
                max_nvt_count: '666',
              },
              {
                name: 'f2',
                max_nvt_count: '999',
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
      .editScanConfigSettings({
        id: 'c1',
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('get', {
          args: {
            cmd: 'edit_config',
            config_id: 'c1',
          },
        });

        const {scanconfig, families} = resp.data;
        expect(scanconfig.id).toEqual('c1');
        expect(families.length).toEqual(2);

        const [family1, family2] = families;
        expect(family1.name).toEqual('f1');
        expect(family1.max).toEqual(666);

        expect(family2.name).toEqual('f2');
        expect(family2.max).toEqual(999);
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
        config: {
          _id: 'c1',
        },
        all: {
          get_nvts_response: {
            nvt: [
              {
                _oid: 1,
                cvss_base: '1.1',
              },
              {
                _oid: 2,
                cvss_base: '2.2',
              },
              {
                _oid: 3,
                cvss_base: '3.3',
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
      .editScanConfigFamilySettings({
        id: 'foo',
        family_name: 'bar',
        config_name: 'foo',
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('get', {
          args: {
            cmd: 'edit_config_family',
            config_id: 'foo',
            family: 'bar',
            name: 'foo',
          },
        });

        const {nvts, config} = resp.data;
        expect(nvts.length).toEqual(3);
        expect(nvts[0].selected).toEqual(YES_VALUE);
        expect(nvts[0].severity).toEqual(1.1);
        expect(nvts[1].selected).toEqual(YES_VALUE);
        expect(nvts[1].severity).toEqual(2.2);
        expect(nvts[2].selected).toEqual(NO_VALUE);
        expect(nvts[2].severity).toEqual(3.3);

        expect(config.id).toEqual('c1');
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
        config: {
          _id: 'c1',
        },
      },
      get_notes_response: {
        notes: {
          _start: '1',
          _max: '22',
        },
        note_count: {
          page: '10',
          __text: '33',
          filtered: '20',
        },
      },
      get_overrides_response: {
        overrides: {
          _start: '1',
          _max: '22',
        },
        override_count: {
          page: '10',
          __text: '33',
          filtered: '20',
        },
      },
    });
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new ScanConfigCommand(fakeHttp);
    return cmd
      .editScanConfigNvtSettings({
        config_name: 'Foo Config',
        family_name: 'Foo Family',
        id: 'foo',
        oid: '1.2.3',
      })
      .then(resp => {
        expect(fakeHttp.request).toHaveBeenCalledWith('get', {
          args: {
            cmd: 'edit_config_nvt',
            config_id: 'foo',
            oid: '1.2.3',
            family: 'Foo Family',
            name: 'Foo Config',
          },
        });

        const {nvt, config} = resp.data;
        expect(nvt.id).toEqual('1.2.3');

        expect(nvt.notes_counts.first).toEqual('1');
        expect(nvt.notes_counts.rows).toEqual('22');
        expect(nvt.notes_counts.length).toEqual('10');
        expect(nvt.notes_counts.all).toEqual('33');
        expect(nvt.notes_counts.filtered).toEqual('20');

        expect(nvt.overrides_counts.first).toEqual('1');
        expect(nvt.overrides_counts.rows).toEqual('22');
        expect(nvt.overrides_counts.length).toEqual('10');
        expect(nvt.overrides_counts.all).toEqual('33');
        expect(nvt.overrides_counts.filtered).toEqual('20');

        expect(config.id).toEqual('c1');
      });
  });
});
