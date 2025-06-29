/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/models/model';
import ScanConfig, {
  filterEmptyScanConfig,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';
import {testModel} from 'gmp/models/testing';

testModel(ScanConfig, 'scanconfig');

describe('ScanConfig model tests', () => {
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
    const scanConfig = ScanConfig.fromElement(elem);

    expect(scanConfig.family_list).toEqual(res);
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
    const scanConfig = ScanConfig.fromElement(elem);

    expect(scanConfig.family_list[0].nvts.count).toBeUndefined();
    expect(scanConfig.family_list[0].nvts.max).toBeUndefined();
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
    const scanConfig = ScanConfig.fromElement(elem);

    expect(scanConfig.families.foo).toEqual(res);
  });

  test('should return empty family_list array if no families are given', () => {
    const scanConfig = ScanConfig.fromElement({});

    expect(scanConfig.family_list).toEqual([]);
  });

  test('should parse family_count', () => {
    const elem = {
      family_count: {
        __text: '42',
        growing: '1',
      },
    };
    const scanConfig = ScanConfig.fromElement(elem);

    expect(scanConfig.families.count).toEqual(42);
    expect(scanConfig.families.trend).toEqual(SCANCONFIG_TREND_DYNAMIC);
    expect(scanConfig.family_count).toBeUndefined();
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
    const scanConfig = ScanConfig.fromElement(elem);

    expect(scanConfig.nvts).toEqual(res);
    expect(scanConfig.nvt_count).toBeUndefined();
    expect(scanConfig.known_nvt_count).toBeUndefined();
    expect(scanConfig.max_nvt_count).toBeUndefined();
  });

  test('should return empty object if no nvt_counts are given', () => {
    const scanConfig = ScanConfig.fromElement({});

    expect(scanConfig.nvts).toEqual({});
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

    const scanConfig = ScanConfig.fromElement(elem);

    expect(scanConfig.preferences.scanner).toEqual(scannerPreferences);
    expect(scanConfig.preferences.nvt).toEqual(nvtPreferences);
  });

  test('should return empty arrays if no preferences are given', () => {
    const scanConfig = ScanConfig.fromElement({});

    expect(scanConfig.preferences.scanner).toEqual([]);
    expect(scanConfig.preferences.nvt).toEqual([]);
  });

  test('should parse scanner', () => {
    const elem = {
      scanner: {
        __text: 'foo',
        id: '123abc',
      },
    };
    const scanConfig = ScanConfig.fromElement(elem);
    const scanConfig2 = ScanConfig.fromElement({});

    expect(scanConfig.scanner).toBeInstanceOf(Model);
    expect(scanConfig.scanner.entityType).toEqual('scanner');
    expect(scanConfig.scanner.name).toEqual('foo');
    expect(scanConfig2.scanner).toBeUndefined();
  });

  test('should parse tasks', () => {
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
    const scanConfig = ScanConfig.fromElement(elem);

    expect(scanConfig.tasks[0]).toBeInstanceOf(Model);
    expect(scanConfig.tasks[0].id).toEqual('123');
    expect(scanConfig.tasks[0].entityType).toEqual('task');
  });

  test('should return empty array if no tasks are given', () => {
    const scanConfig = ScanConfig.fromElement({});

    expect(scanConfig.tasks).toEqual([]);
  });

  test('should parse predefined as boolean correctly', () => {
    const scanConfig = ScanConfig.fromElement({predefined: '0'});
    const scanConfig2 = ScanConfig.fromElement({predefined: '1'});

    expect(scanConfig.predefined).toEqual(false);
    expect(scanConfig2.predefined).toEqual(true);
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
