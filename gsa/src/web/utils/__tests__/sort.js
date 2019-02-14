/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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
import moment from 'gmp/models/date';

import {
  ipToNumber,
  getProperty,
  getValue,
  makeCompareString,
  makeCompareNumber,
  makeCompareIp,
  makeCompareSeverity,
  makeCompareDate,
} from '../sort';

describe('ipToNumber tests', () => {
  test('should convert ipv4 to number', () => {
    expect(ipToNumber('192.168.1.1')).toEqual(3232235777);
    expect(ipToNumber('192.168.1.2')).toEqual(3232235778);
  });

  test('should pass through invalid ip addresses', () => {
    expect(ipToNumber('foo')).toEqual('foo');
    expect(ipToNumber('192.168.1.')).toEqual('192.168.1.');
    expect(ipToNumber('a.168.1.1')).toEqual('a.168.1.1');
    expect(ipToNumber('192.a.1.1')).toEqual('192.a.1.1');
    expect(ipToNumber('192.168.a.1')).toEqual('192.168.a.1');
    expect(ipToNumber('192.168.1.a')).toEqual('192.168.1.a');
  });

  test('should pass through ipv6 address', () => {
    expect(ipToNumber('fe80::ccf8:4cc7:a11a:76a')).toEqual(
      'fe80::ccf8:4cc7:a11a:76a',
    );
  });

  test('should return undefined for undefined ip', () => {
    expect(ipToNumber()).toBeUndefined();
  });
});

describe('getProperty tests', () => {
  test('should get property by name', () => {
    expect(getProperty({value: 1}, 'value')).toEqual(1);
    expect(getProperty({foo: 'bar'}, 'foo')).toEqual('bar');
  });

  test('should get property by function', () => {
    expect(getProperty({value: 1}, obj => obj.value)).toEqual(1);
    expect(getProperty({foo: 'bar'}, obj => obj.foo)).toEqual('bar');
  });

  test('should return undefined for unknown properties', () => {
    expect(getProperty({value: 1}, 'foo')).toBeUndefined();
    expect(getProperty({value: 1}, obj => obj.foo)).toBeUndefined();
    expect(getProperty(undefined, obj => obj.foo)).toBeUndefined();
  });
});

describe('getValue tests', () => {
  test('should return value for property', () => {
    expect(getValue(v => v, {foo: 'bar'}, 'foo')).toEqual('bar');
    expect(getValue(v => v, {foo: 'bar'}, obj => obj.foo)).toEqual('bar');
  });

  test('should return string for property', () => {
    expect(getValue(v => '' + v, {a: 1}, 'a')).toEqual('1');
    expect(getValue(v => '' + v, {a: 1}, obj => obj.a)).toEqual('1');
  });

  test('should return undefined for unknown property', () => {
    expect(getValue(v => v, {foo: 'bar'}, 'bar')).toBeUndefined();
    expect(getValue(v => v, {foo: 'bar'}, obj => obj.bar)).toBeUndefined();
  });

  test('should return default for unknown property', () => {
    expect(getValue(v => v, {foo: 'bar'}, 'bar', 'ipsum')).toEqual('ipsum');
    expect(getValue(v => v, {foo: 'bar'}, obj => obj.bar, 'ipsum')).toEqual(
      'ipsum',
    );
  });
});

describe('makeCompareString tests', () => {
  test('should compare strings asc', () => {
    const objA = {
      value: 'a',
    };
    const objB = {
      value: 'b',
    };
    const objC = {
      value: 'a',
    };
    const objD = {
      value: 1, // will be converted to string
    };

    const compareValues = makeCompareString('value')();
    expect(compareValues(objA, objB)).toEqual(-1);
    expect(compareValues(objB, objA)).toEqual(1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(1);
  });

  test('should compare strings desc', () => {
    const objA = {
      value: 'a',
    };
    const objB = {
      value: 'b',
    };
    const objC = {
      value: 'a',
    };
    const objD = {
      value: 1, // will be converted to string
    };

    const compareValues = makeCompareString('value')(true);
    expect(compareValues(objA, objB)).toEqual(1);
    expect(compareValues(objB, objA)).toEqual(-1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(-1);
  });
});

describe('makeCompareNumber tests', () => {
  test('should compare numbers asc', () => {
    const objA = {
      value: 1,
    };
    const objB = {
      value: 2,
    };
    const objC = {
      value: 1,
    };
    const objD = {
      value: '1', // will be converted to number
    };

    const compareValues = makeCompareNumber(obj => obj.value)();
    expect(compareValues(objA, objB)).toEqual(-1);
    expect(compareValues(objB, objA)).toEqual(1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(0);
  });

  test('should compare numbers desc', () => {
    const objA = {
      value: 1,
    };
    const objB = {
      value: 2,
    };
    const objC = {
      value: 1,
    };
    const objD = {
      value: '1', // will be converted to number
    };

    const compareValues = makeCompareNumber(obj => obj.value)(true);
    expect(compareValues(objA, objB)).toEqual(1);
    expect(compareValues(objB, objA)).toEqual(-1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(0);
  });
});

describe('makeCompareIp tests', () => {
  test('should compare IPs asc', () => {
    const objA = {
      value: '192.168.1.1',
    };
    const objB = {
      value: '192.168.1.2',
    };
    const objC = {
      value: '192.168.1.1',
    };
    const objD = {
      value: 'foo',
    };

    const compareValues = makeCompareIp(obj => obj.value)();
    expect(compareValues(objA, objB)).toEqual(-1);
    expect(compareValues(objB, objA)).toEqual(1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(0);
  });

  test('should compare IPs desc', () => {
    const objA = {
      value: '192.168.1.1',
    };
    const objB = {
      value: '192.168.1.2',
    };
    const objC = {
      value: '192.168.1.1',
    };
    const objD = {
      value: 'foo',
    };

    const compareValues = makeCompareIp(obj => obj.value)(true);
    expect(compareValues(objA, objB)).toEqual(1);
    expect(compareValues(objB, objA)).toEqual(-1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(0);
  });

  test('should compare IPs with default for undefined value', () => {
    const objA = {
      value: '192.168.1.1',
    };
    const objB = {
      value: '192.168.1.2',
    };
    const objC = {
      value: '192.168.1.1',
    };
    const objD = {
      foo: 'bar',
    };

    const compareValues = makeCompareIp('value', ipToNumber('192.168.1.99'))();
    expect(compareValues(objA, objB)).toEqual(-1);
    expect(compareValues(objB, objA)).toEqual(1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(-1);
  });
});

describe('makeCompareSeverity tests', () => {
  test('should compare severity asc', () => {
    const objA = {
      severity: 1,
    };
    const objB = {
      severity: 2,
    };
    const objC = {
      severity: 1,
    };
    const objD = {
      severity: '1', // will be converted to number
    };

    const compareValues = makeCompareSeverity()();
    expect(compareValues(objA, objB)).toEqual(-1);
    expect(compareValues(objB, objA)).toEqual(1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(0);
  });

  test('should compare severity desc', () => {
    const objA = {
      severity: 1,
    };
    const objB = {
      severity: 2,
    };
    const objC = {
      severity: 1,
    };
    const objD = {
      severity: '1', // will be converted to number
    };

    const compareValues = makeCompareSeverity()(true);
    expect(compareValues(objA, objB)).toEqual(1);
    expect(compareValues(objB, objA)).toEqual(-1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(0);
  });

  test('should compare with default severity', () => {
    const objA = {
      severity: 1,
    };
    const objB = {
      severity: 2,
    };
    const objC = {
      severity: 1,
    };
    const objD = {}; // will use default severity of 0

    const compareValues = makeCompareSeverity()();
    expect(compareValues(objA, objB)).toEqual(-1);
    expect(compareValues(objB, objA)).toEqual(1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(1);
  });

  test('should compare severity with property function', () => {
    const objA = {
      value: 1,
    };
    const objB = {
      value: 2,
    };
    const objC = {
      value: 1,
    };
    const objD = {
      value: '1', // will be converted to number
    };

    const compareValues = makeCompareSeverity(obj => obj.value)();
    expect(compareValues(objA, objB)).toEqual(-1);
    expect(compareValues(objB, objA)).toEqual(1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(0);
  });
});

describe('makeCompareDate tests', () => {
  test('should compare dates asc', () => {
    const objA = {
      value: moment('2017-01-01'),
    };
    const objB = {
      value: moment('2018-01-01'),
    };
    const objC = {
      value: moment('2017-01-01'),
    };
    const objD = {};

    const compareValues = makeCompareDate(obj => obj.value)();
    expect(compareValues(objA, objB)).toEqual(-1);
    expect(compareValues(objB, objA)).toEqual(1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(0);
  });

  test('should compare dates desc', () => {
    const objA = {
      value: moment('2017-01-01'),
    };
    const objB = {
      value: moment('2018-01-01'),
    };
    const objC = {
      value: moment('2017-01-01'),
    };
    const objD = {};

    const compareValues = makeCompareDate(obj => obj.value)(true);
    expect(compareValues(objA, objB)).toEqual(1);
    expect(compareValues(objB, objA)).toEqual(-1);
    expect(compareValues(objA, objC)).toEqual(0);
    expect(compareValues(objA, objD)).toEqual(0);
  });
});

// vim: set ts=2 sw=2 tw=80:
