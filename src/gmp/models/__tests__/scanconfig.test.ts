/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ScanConfig, {
  filterEmptyScanConfig,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';
import {testModel} from 'gmp/models/testing';

describe('ScanConfig model tests', () => {
  testModel(ScanConfig, 'scanconfig');

  test('should use defaults', () => {
    const scanConfig = new ScanConfig();
    expect(scanConfig.family_list).toEqual([]);
    expect(scanConfig.families).toBeUndefined();
    expect(scanConfig.nvts).toBeUndefined();
    expect(scanConfig.predefined).toBeUndefined();
    expect(scanConfig.preferences).toBeUndefined();
    expect(scanConfig.scanner).toBeUndefined();
    expect(scanConfig.tasks).toEqual([]);
  });

  test('should parse empty element', () => {
    const scanConfig = ScanConfig.fromElement();
    expect(scanConfig.family_list).toEqual([]);
    expect(scanConfig.families).toEqual({count: 0});
    expect(scanConfig.nvts).toBeUndefined();
    expect(scanConfig.predefined).toBeUndefined();
    expect(scanConfig.preferences).toBeUndefined();
    expect(scanConfig.scanner).toBeUndefined();
    expect(scanConfig.tasks).toEqual([]);
  });

  test('should parse families', () => {
    const scanConfig = ScanConfig.fromElement({
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
    expect(scanConfig.family_list).toEqual([
      {
        name: 'foo',
        trend: SCANCONFIG_TREND_DYNAMIC,
        nvts: {
          count: 42,
          max: 42,
        },
      },
    ]);
    expect(scanConfig.families).toEqual({
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

    const scanConfig2 = ScanConfig.fromElement({
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
    expect(scanConfig2.family_list?.[0]?.nvts?.count).toBeUndefined();
    expect(scanConfig2.family_list?.[0]?.nvts?.max).toBeUndefined();
  });

  test('should parse family count', () => {
    const scanConfig = ScanConfig.fromElement({
      family_count: {
        __text: '42',
        growing: 1,
      },
    });
    expect(scanConfig.families?.count).toEqual(42);
    expect(scanConfig.families?.trend).toEqual(SCANCONFIG_TREND_DYNAMIC);
  });

  test('should parse nvts', () => {
    const scanConfig = ScanConfig.fromElement({
      nvt_count: {
        __text: '42',
        growing: 1,
      },
      known_nvt_count: '21',
      max_nvt_count: '1337',
    });

    expect(scanConfig.nvts).toEqual({
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

    const scanConfig = ScanConfig.fromElement({
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
    expect(scanConfig.preferences?.scanner).toEqual(scannerPreferences);
    expect(scanConfig.preferences?.nvt).toEqual(nvtPreferences);
  });

  test('should parse scanner', () => {
    const scanConfig = ScanConfig.fromElement({
      scanner: {
        __text: 'foo',
        _id: '123abc',
      },
    });

    expect(scanConfig.scanner?.entityType).toEqual('scanner');
    expect(scanConfig.scanner?.name).toEqual('foo');
  });

  test('should parse tasks', () => {
    const scanConfig = ScanConfig.fromElement({
      tasks: {
        task: [
          {
            _id: '123',
            name: 'foo',
          },
        ],
      },
    });

    expect(scanConfig.tasks[0].id).toEqual('123');
    expect(scanConfig.tasks[0].entityType).toEqual('task');
  });

  test('should parse predefined', () => {
    const scanConfig = ScanConfig.fromElement({predefined: 0});
    const scanConfig2 = ScanConfig.fromElement({predefined: 1});

    expect(scanConfig.predefined).toEqual(false);
    expect(scanConfig2.predefined).toEqual(true);
  });

  test('should parse deprecated', () => {
    const scanConfig = ScanConfig.fromElement({deprecated: 0});
    const scanConfig2 = ScanConfig.fromElement({deprecated: 1});

    expect(scanConfig.deprecated).toEqual(false);
    expect(scanConfig2.deprecated).toEqual(true);
  });
});

describe('ScanConfigs model function test', () => {
  test('filterEmptyScanConfig() should return filter with correct true/false', () => {
    const config1 = {id: '42'};
    const config2 = {id: '085569ce-73ed-11df-83c3-002264764cea'};

    expect(filterEmptyScanConfig(config1)).toEqual(true);
    expect(filterEmptyScanConfig(config2)).toEqual(false);
  });
});
