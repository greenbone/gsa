/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
  BASE_SCAN_CONFIG_ID,
} from 'gmp/models/scanconfig';

import {YES_VALUE, NO_VALUE} from 'gmp/parser';

import {
  createActionResultResponse,
  createEntityResponse,
  createHttp,
  createResponse,
} from '../testing';

import {PolicyCommand} from '../policies';

describe('PolicyCommand tests', () => {
  test('should create new policy', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new PolicyCommand(fakeHttp);
    return cmd
      .create({
        comment: 'bar',
        name: 'foo',
      })
      .then(resp => {
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
  });

  test('should save policy', () => {
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

    const cmd = new PolicyCommand(fakeHttp);
    return cmd
      .save({
        id: 'c1',
        name: 'foo',
        comment: 'somecomment',
        trend,
        select,
        scannerPreferenceValues,
      })
      .then(resp => {
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
  });

  test('should save an in use policy with undefined input objects', () => {
    const response = createActionResultResponse();
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new PolicyCommand(fakeHttp);
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

  test('should return single policy', () => {
    const response = createEntityResponse('config', {_id: 'foo'});
    const fakeHttp = createHttp(response);

    expect.hasAssertions();

    const cmd = new PolicyCommand(fakeHttp);
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

  test('should save a policy nvt', () => {
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

    const cmd = new PolicyCommand(fakeHttp);
    return cmd
      .savePolicyNvt({
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

  test('should request policy family data', () => {
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

    const cmd = new PolicyCommand(fakeHttp);
    return cmd
      .editPolicyFamilySettings({id: 'foo', familyName: 'bar'})
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
});
