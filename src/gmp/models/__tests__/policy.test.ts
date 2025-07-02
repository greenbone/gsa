/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Policy from 'gmp/models/policy';
import {SCANCONFIG_TREND_DYNAMIC} from 'gmp/models/scanconfig';
import {testModel} from 'gmp/models/testing';

describe('Policy model tests', () => {
  testModel(Policy, 'policy');

  test('should use defaults', () => {
    const policy = new Policy();
    expect(policy.families).toBeUndefined();
    expect(policy.family_list).toEqual([]);
    expect(policy.nvts).toBeUndefined();
    expect(policy.predefined).toBeUndefined();
    expect(policy.preferences).toBeUndefined();
    expect(policy.scanner).toBeUndefined();
    expect(policy.audits).toEqual([]);
  });

  test('should parse empty element', () => {
    const policy = Policy.fromElement();
    expect(policy.families).toEqual({count: 0});
    expect(policy.family_list).toEqual([]);
    expect(policy.nvts).toBeUndefined();
    expect(policy.predefined).toBeUndefined();
    expect(policy.preferences).toBeUndefined();
    expect(policy.scanner).toBeUndefined();
    expect(policy.audits).toEqual([]);
  });

  test('should parse families', () => {
    const policy = Policy.fromElement({
      families: {
        family: [
          {
            name: 'foo',
            nvt_count: '42',
            max_nvt_count: '42',
            growing: 1,
          },
        ],
      },
    });

    expect(policy.family_list).toEqual([
      {
        name: 'foo',
        trend: SCANCONFIG_TREND_DYNAMIC,
        nvts: {
          count: 42,
          max: 42,
        },
      },
    ]);
    expect(policy.families).toEqual({
      foo: {
        name: 'foo',
        trend: SCANCONFIG_TREND_DYNAMIC,
        nvts: {
          count: 42,
          max: 42,
        },
      },
      count: 0,
    });

    const policy2 = Policy.fromElement({
      families: {
        family: [
          {
            name: 'foo',
            nvt_count: '-1',
            max_nvt_count: '',
            growing: 1,
          },
        ],
      },
    });
    expect(policy2.family_list[0]?.nvts?.count).toBeUndefined();
    expect(policy2.family_list[0]?.nvts?.max).toBeUndefined();
  });

  test('should parse family_count', () => {
    const policy = Policy.fromElement({
      family_count: {
        __text: '42',
        growing: 1,
      },
    });
    expect(policy.families?.count).toEqual(42);
    expect(policy.families?.trend).toEqual(SCANCONFIG_TREND_DYNAMIC);
  });

  test('should parse nvt', () => {
    const policy = Policy.fromElement({
      nvt_count: {
        __text: '42',
        growing: 1,
      },
      known_nvt_count: '21',
      max_nvt_count: '1337',
    });

    expect(policy.nvts).toEqual({
      count: 42,
      trend: SCANCONFIG_TREND_DYNAMIC,
      known: 21,
      max: 1337,
    });
  });

  test('should parse preferences', () => {
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

    const policy = Policy.fromElement({
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
    });
    expect(policy.preferences?.scanner).toEqual(scannerPreferences);
    expect(policy.preferences?.nvt).toEqual(nvtPreferences);
  });

  test('should parse scanner', () => {
    const policy = Policy.fromElement({
      scanner: {
        __text: 'foo',
        _id: '123abc',
      },
    });
    expect(policy.scanner?.entityType).toEqual('scanner');
    expect(policy.scanner?.name).toEqual('foo');
  });

  test('should parse audits', () => {
    const policy = Policy.fromElement({
      tasks: {
        task: [
          {
            _id: '123',
            name: 'foo',
          },
        ],
      },
    });
    expect(policy.audits[0].id).toEqual('123');
    expect(policy.audits[0].entityType).toEqual('audit');
  });

  test('should parse predefined as boolean correctly', () => {
    const policy = Policy.fromElement({predefined: 0});
    expect(policy.predefined).toEqual(false);

    const policy2 = Policy.fromElement({predefined: 1});
    expect(policy2.predefined).toEqual(true);
  });
});
