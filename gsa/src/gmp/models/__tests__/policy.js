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

/* eslint-disable max-len */

import Model from 'gmp/model';
import Policy from 'gmp/models/policy';
import {testModel} from 'gmp/models/testing';

import {SCANCONFIG_TREND_DYNAMIC} from '../scanconfig';

testModel(Policy, 'policy');

describe('Policy model tests', () => {
  test('should parse families', () => {
    const elem = {
      families: {
        family: [
          {
            name: 'foo',
            nvt_count: '42',
            max_nvt_count: '42',
            growing: '1',
          },
        ],
      },
    };
    const res = [
      {
        name: 'foo',
        trend: SCANCONFIG_TREND_DYNAMIC,
        nvts: {
          count: 42,
          max: 42,
        },
      },
    ];
    const policy = Policy.fromElement(elem);

    expect(policy.family_list).toEqual(res);
  });

  test('should parse special nvt counts', () => {
    const elem = {
      families: {
        family: [
          {
            name: 'foo',
            nvt_count: '-1',
            max_nvt_count: '',
            growing: '1',
          },
        ],
      },
    };
    const policy = Policy.fromElement(elem);

    expect(policy.family_list[0].nvts.count).toBeUndefined();
    expect(policy.family_list[0].nvts.max).toBeUndefined();
  });

  test('should parse to families', () => {
    const elem = {
      families: {
        family: [
          {
            name: 'foo',
            nvt_count: '42',
            max_nvt_count: '42',
            growing: '1',
          },
        ],
      },
    };
    const res = {
      name: 'foo',
      trend: SCANCONFIG_TREND_DYNAMIC,
      nvts: {
        count: 42,
        max: 42,
      },
    };
    const policy = Policy.fromElement(elem);

    expect(policy.families.foo).toEqual(res);
  });

  test('should return empty family_list array if no families are given', () => {
    const policy = Policy.fromElement({});

    expect(policy.family_list).toEqual([]);
  });

  test('should parse family_count', () => {
    const elem = {
      family_count: {
        __text: '42',
        growing: '1',
      },
    };
    const policy = Policy.fromElement(elem);

    expect(policy.families.count).toEqual(42);
    expect(policy.families.trend).toEqual(SCANCONFIG_TREND_DYNAMIC);
    expect(policy.family_count).toBeUndefined();
  });

  test('should parse nvt_count', () => {
    const elem = {
      nvt_count: {
        __text: '42',
        growing: '1',
      },
      known_nvt_count: '21',
      max_nvt_count: '1337',
    };
    const res = {
      count: 42,
      trend: SCANCONFIG_TREND_DYNAMIC,
      known: 21,
      max: 1337,
    };
    const policy = Policy.fromElement(elem);

    expect(policy.nvts).toEqual(res);
    expect(policy.nvt_count).toBeUndefined();
    expect(policy.known_nvt_count).toBeUndefined();
    expect(policy.max_nvt_count).toBeUndefined();
  });

  test('should return empty object if no nvt_counts are given', () => {
    const policy = Policy.fromElement({});

    expect(policy.nvts).toEqual({});
  });

  test('should parse preferences', () => {
    const elem = {
      preferences: {
        preference: [
          {
            nvt: {
              _oid: '123abc',
              name: '',
            },
            name: 'bar',
            value: '42',
          },
          {
            nvt: {
              _oid: '456def',
              name: 'foo',
            },
            name: 'lorem',
            value: 'ipsum',
          },
        ],
      },
    };
    const nvtPreferences = [
      {
        name: 'lorem',
        nvt: {
          name: 'foo',
          oid: '456def',
        },
        value: 'ipsum',
      },
    ];
    const scannerPreferences = [
      {
        name: 'bar',
        value: '42',
      },
    ];

    const policy = Policy.fromElement(elem);

    expect(policy.preferences.scanner).toEqual(scannerPreferences);
    expect(policy.preferences.nvt).toEqual(nvtPreferences);
  });

  test('should return empty arrays if no preferences are given', () => {
    const policy = Policy.fromElement({});

    expect(policy.preferences.scanner).toEqual([]);
    expect(policy.preferences.nvt).toEqual([]);
  });

  test('should parse type', () => {
    const policy = Policy.fromElement({type: '21'});

    expect(policy.policy_type).toEqual(21);
  });

  test('should parse scanner', () => {
    const elem = {
      scanner: {
        __text: 'foo',
        id: '123abc',
      },
    };
    const policy = Policy.fromElement(elem);
    const policy2 = Policy.fromElement({});

    expect(policy.scanner).toBeInstanceOf(Model);
    expect(policy.scanner.entityType).toEqual('scanner');
    expect(policy.scanner.name).toEqual('foo');
    expect(policy2.scanner).toBeUndefined();
  });

  test('should parse audits', () => {
    const elem = {
      tasks: {
        task: [
          {
            _id: '123',
            name: 'foo',
          },
        ],
      },
    };
    const policy = Policy.fromElement(elem);

    expect(policy.audits[0]).toBeInstanceOf(Model);
    expect(policy.audits[0].entityType).toEqual('audit');
  });

  test('should return empty array if no tasks are given', () => {
    const policy = Policy.fromElement({});

    expect(policy.audits).toEqual([]);
  });

  test('should parse predefined as boolean correctly', () => {
    const policy = Policy.fromElement({predefined: '0'});
    const policy2 = Policy.fromElement({predefined: '1'});

    expect(policy.predefined).toEqual(false);
    expect(policy2.predefined).toEqual(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
