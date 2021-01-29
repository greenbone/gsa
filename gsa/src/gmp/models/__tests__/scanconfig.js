/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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
import ScanConfig, {
  filterEmptyScanConfig,
  openVasScanConfigsFilter,
  ospScanConfigsFilter,
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
  SCANCONFIG_TREND_DYNAMIC,
} from 'gmp/models/scanconfig';
import {testModel} from 'gmp/models/testing';

testModel(ScanConfig, 'scanconfig');

describe('ScanConfig model parseObject tests', () => {
  test('should parse scanConfigType', () => {
    const obj = {
      type: 0,
    };
    const scanConfig = ScanConfig.fromObject(obj);

    expect(scanConfig.scanConfigType).toEqual(0);
  });

  test('should parse families', () => {
    const obj = {
      families: [
        {
          name: 'foo',
          nvtCount: 42,
          maxNvtCount: 42,
          growing: true,
        },
      ],
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
    const scanConfig = ScanConfig.fromObject(obj);

    expect(scanConfig.familyList).toEqual(res);
  });

  test('should parse special nvt counts', () => {
    const obj = {
      families: [
        {
          name: 'foo',
          nvtCount: -1,
          maxNvtCount: null,
          growing: true,
        },
      ],
    };
    const scanConfig = ScanConfig.fromObject(obj);

    expect(scanConfig.familyList[0].nvts.count).toBeUndefined();
    expect(scanConfig.familyList[0].nvts.max).toBeUndefined();
  });

  test('should parse to families', () => {
    const obj = {
      families: [
        {
          name: 'foo',
          nvtCount: 42,
          maxNvtCount: 42,
          growing: true,
        },
      ],
    };
    const res = {
      name: 'foo',
      trend: SCANCONFIG_TREND_DYNAMIC,
      nvts: {
        count: 42,
        max: 42,
      },
    };
    const scanConfig = ScanConfig.fromObject(obj);

    expect(scanConfig.families.foo).toEqual(res);
  });

  test('should return empty familyList array if no families are given', () => {
    const scanConfig = ScanConfig.fromObject({});

    expect(scanConfig.familyList).toEqual([]);
  });

  test('should return empty familyList array if null families are given', () => {
    const scanConfig = ScanConfig.fromObject({families: null});

    expect(scanConfig.familyList).toEqual([]);
  });

  test('should parse familyCount', () => {
    const obj = {
      familyCount: 42,
    };
    const scanConfig = ScanConfig.fromObject(obj);

    expect(scanConfig.families.count).toEqual(42);
    expect(scanConfig.familyCount).toBeUndefined();
  });

  test('should parse nvtCount', () => {
    const obj = {
      nvtCount: 42,
      knownNvtCount: 21,
      maxNvtCount: 1337,
    };
    const res = {
      count: 42,
      known: 21,
      max: 1337,
    };
    const scanConfig = ScanConfig.fromObject(obj);

    expect(scanConfig.nvts).toEqual(res);
    expect(scanConfig.nvtCount).toBeUndefined();
    expect(scanConfig.knownNvtCount).toBeUndefined();
    expect(scanConfig.maxNvtCount).toBeUndefined();
  });

  test('should return empty object if no nvtCounts are given', () => {
    const scanConfig = ScanConfig.fromObject({});

    expect(scanConfig.nvts).toEqual({});
  });

  test('should return empty object if null nvtCounts are given', () => {
    const scanConfig = ScanConfig.fromObject({nvtCount: null});

    expect(scanConfig.nvts).toEqual({});
  });

  test('should parse preferences', () => {
    const obj = {
      preferences: [
        {
          alt: ['postgres', 'regress'],
          default: 'postgres',
          hrName: 'Postgres Username:',
          id: 1,
          name: 'Postgres Username:',
          type: 'entry',
          value: 'regress',
          nvt: {
            oid: 'oid',
            name: 'PostgreSQL Detection',
          },
        },
        {
          alt: ['a', 'b'],
          default: 'c',
          hrName: 'foo',
          id: 2,
          name: 'foo',
          type: 'bar',
          value: 'lorem',
          nvt: {
            oid: null,
            name: null,
          },
        },
      ],
    };
    const nvtPreferences = [
      {
        alt: ['postgres', 'regress'],
        default: 'postgres',
        hrName: 'Postgres Username:',
        id: 1,
        name: 'Postgres Username:',
        type: 'entry',
        value: 'regress',
        nvt: {
          oid: 'oid',
          name: 'PostgreSQL Detection',
        },
      },
    ];
    const scannerPreferences = [
      {
        alt: ['a', 'b'],
        default: 'c',
        hrName: 'foo',
        id: 2,
        name: 'foo',
        type: 'bar',
        value: 'lorem',
      },
    ];

    const scanConfig = ScanConfig.fromObject(obj);

    expect(scanConfig.preferences.scanner).toEqual(scannerPreferences);
    expect(scanConfig.preferences.nvt).toEqual(nvtPreferences);
  });

  test('should return empty arrays if no preferences are given', () => {
    const scanConfig = ScanConfig.fromObject({});

    expect(scanConfig.preferences.scanner).toEqual([]);
    expect(scanConfig.preferences.nvt).toEqual([]);
  });

  test('should return empty arrays if null preferences are given', () => {
    const scanConfig = ScanConfig.fromObject({preferences: null});

    expect(scanConfig.preferences.scanner).toEqual([]);
    expect(scanConfig.preferences.nvt).toEqual([]);
  });

  test('should parse type', () => {
    const scanConfig = ScanConfig.fromObject({type: 21});

    expect(scanConfig.scanConfigType).toEqual(21);
  });

  test('should parse tasks', () => {
    const obj = {
      tasks: [
        {
          id: '123',
          name: 'foo',
        },
      ],
    };
    const scanConfig = ScanConfig.fromObject(obj);

    expect(scanConfig.tasks[0]).toBeInstanceOf(Model);
    expect(scanConfig.tasks[0].id).toEqual('123');
    expect(scanConfig.tasks[0].entityType).toEqual('task');
  });

  test('should return empty array if no tasks are given', () => {
    const scanConfig = ScanConfig.fromObject({});

    expect(scanConfig.tasks).toEqual([]);
  });

  test('should return empty array if null tasks are given', () => {
    const scanConfig = ScanConfig.fromObject({tasks: null});

    expect(scanConfig.tasks).toEqual([]);
  });

  test('should parse trend', () => {
    const obj = {
      familyGrowing: true,
      nvtGrowing: false,
    };

    const obj2 = {
      familyGrowing: null,
      nvtGrowing: null,
    };

    const scanConfig = ScanConfig.fromObject(obj);
    const scanConfig2 = ScanConfig.fromObject(obj2);

    expect(scanConfig.families.trend).toEqual(1);
    expect(scanConfig.nvts.trend).toEqual(0);

    expect(scanConfig2.families).toEqual({count: 0});
    expect(scanConfig2.nvts).toEqual({});
  });

  // predefined is already boolean
  // has no scanner attribute
});

describe('ScanConfig model parseElement tests', () => {
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

  test('should parse type', () => {
    const scanConfig = ScanConfig.fromElement({type: '21'});

    expect(scanConfig.scanConfigType).toEqual(21);
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

  test('openVasScanConfigsFilter() should return filter with correct true/false', () => {
    const config1 = {scanConfigType: OSP_SCAN_CONFIG_TYPE};
    const config2 = {scanConfigType: OPENVAS_SCAN_CONFIG_TYPE};

    expect(openVasScanConfigsFilter(config1)).toEqual(false);
    expect(openVasScanConfigsFilter(config2)).toEqual(true);
  });

  test('ospScanConfigsFilter() should return filter with correct true/false', () => {
    const config1 = {scanConfigType: OSP_SCAN_CONFIG_TYPE};
    const config2 = {scanConfigType: OPENVAS_SCAN_CONFIG_TYPE};

    expect(ospScanConfigsFilter(config1)).toEqual(true);
    expect(ospScanConfigsFilter(config2)).toEqual(false);
  });
});

// vim: set ts=2 sw=2 tw=80:
