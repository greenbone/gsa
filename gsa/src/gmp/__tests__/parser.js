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

import {isDate, isDuration} from 'gmp/models/date';

import {
  parseCsv,
  parseBoolean,
  parseDate,
  parseDuration,
  parseEnvelopeMeta,
  parseFloat,
  parseInt,
  parseProgressElement,
  parseProperties,
  parseQod,
  parseSeverity,
  parseXmlEncodedString,
  parseText,
  parseTextElement,
  parseYesNo,
  YES_VALUE,
  NO_VALUE,
  setProperties,
} from '../parser';

import {
  parseCvssV2BaseVector,
  parseCvssV3BaseVector,
  parseCvssV2BaseFromVector,
  parseCvssV3BaseFromVector,
} from '../parser/cvss';

describe('parseInt tests', () => {
  test('should parse int number string', () => {
    expect(parseInt('5')).toBe(5);
  });

  test('should parse float number strings', () => {
    expect(parseInt('5.0')).toBe(5);
  });

  test('should shut cut float strings', () => {
    expect(parseInt('5.9999')).toBe(5);
    expect(parseInt('5.1')).toBe(5);
  });

  test('should parse int numbers', () => {
    expect(parseInt(5)).toBe(5);
    expect(parseInt(-5)).toBe(-5);
  });

  test('should cut float numbers', () => {
    expect(parseInt(5.9999)).toBe(5);
    expect(parseInt(5.1)).toBe(5);
  });

  test('should parse empty string as undefined', () => {
    expect(parseInt('')).toBeUndefined();
    expect(parseInt(' ')).toBeUndefined();
  });

  test('should parse string without a number as undefined', () => {
    expect(parseInt('abc')).toBeUndefined();
    expect(parseInt('5a')).toBeUndefined();
  });

  test('should parse infintiy as undefined', () => {
    expect(parseInt(Infinity)).toBeUndefined();
    expect(parseInt('Infinity')).toBeUndefined();
  });
});

describe('parseSeverity tests', () => {
  test('should parse int number strings', () => {
    expect(parseSeverity('0')).toEqual(0);
    expect(parseSeverity('1')).toEqual(1);
    expect(parseSeverity('5')).toEqual(5);
  });

  test('should parse float number strings', () => {
    expect(parseSeverity('0.0')).toEqual(0);
    expect(parseSeverity('1.1')).toEqual(1.1);
    expect(parseSeverity('5.4')).toEqual(5.4);
  });

  test('should pass through numbers', () => {
    expect(parseSeverity(0)).toEqual(0);
    expect(parseSeverity(1)).toEqual(1);
    expect(parseSeverity(5)).toEqual(5);
    expect(parseSeverity(1.1)).toEqual(1.1);
    expect(parseSeverity(5.4)).toEqual(5.4);
  });

  test('should parse strings as undefined', () => {
    expect(parseSeverity('abc')).toBeUndefined();
    expect(parseSeverity('5a')).toBeUndefined();
  });

  test('should parse empty string as undefined', () => {
    expect(parseSeverity('')).toBeUndefined();
    expect(parseSeverity(' ')).toBeUndefined();
  });
});

describe('parseFloat tests', () => {
  test('should parse int number strings', () => {
    expect(parseFloat('0')).toEqual(0);
    expect(parseFloat('1')).toEqual(1);
    expect(parseFloat('5')).toEqual(5);
  });

  test('should parse float number strings', () => {
    expect(parseFloat('0.0')).toEqual(0);
    expect(parseFloat('1.1')).toEqual(1.1);
    expect(parseFloat('5.4')).toEqual(5.4);
  });

  test('should pass through numbers', () => {
    expect(parseFloat(0)).toEqual(0);
    expect(parseFloat(1)).toEqual(1);
    expect(parseFloat(5)).toEqual(5);
    expect(parseFloat(1.1)).toEqual(1.1);
    expect(parseFloat(5.4)).toEqual(5.4);
  });

  test('should parse strings as undefined', () => {
    expect(parseFloat('abc')).toBeUndefined();
    expect(parseFloat('5a')).toBeUndefined();
  });

  test('should parse empty string as undefined', () => {
    expect(parseFloat('')).toBeUndefined();
    expect(parseFloat(' ')).toBeUndefined();
  });
});

describe('parseTextElement tests', () => {
  test('should convert text elements', () => {
    expect(
      parseTextElement({
        __text: 'foo',
        __excerpt: '1', // this can be provided by gvmd. Make sure it is not parsed
      }),
    ).toEqual('foo');
  });

  test('should convert plain text elements', () => {
    expect(parseTextElement('foo')).toEqual('foo');
  });
});

describe('parseProgressElement tests', () => {
  test('should parse progress as float', () => {
    expect(parseProgressElement('0')).toEqual(0);
    expect(parseProgressElement('1')).toEqual(1);
    expect(parseProgressElement('5')).toEqual(5);
    expect(parseProgressElement('0.0')).toEqual(0);
    expect(parseProgressElement('1.1')).toEqual(1.1);
    expect(parseProgressElement('5.4')).toEqual(5.4);
    expect(parseProgressElement(0)).toEqual(0);
    expect(parseProgressElement(1)).toEqual(1);
    expect(parseProgressElement(5)).toEqual(5);
    expect(parseProgressElement(1.1)).toEqual(1.1);
    expect(parseProgressElement(5.4)).toEqual(5.4);
  });

  test('should parse invalid progress values as zero', () => {
    expect(parseProgressElement()).toEqual(0);
    expect(parseProgressElement('')).toEqual(0);
    expect(parseProgressElement(' ')).toEqual(0);
    expect(parseProgressElement('foo')).toEqual(0);
    expect(parseProgressElement('1a')).toEqual(0);
  });

  test('should parse __text as progress', () => {
    expect(parseProgressElement({__text: '0'})).toEqual(0);
    expect(parseProgressElement({__text: '1'})).toEqual(1);
    expect(parseProgressElement({__text: '5'})).toEqual(5);
    expect(parseProgressElement({__text: '0.0'})).toEqual(0);
    expect(parseProgressElement({__text: '1.1'})).toEqual(1.1);
    expect(parseProgressElement({__text: '5.4'})).toEqual(5.4);
    expect(parseProgressElement({__text: 0})).toEqual(0);
    expect(parseProgressElement({__text: 1})).toEqual(1);
    expect(parseProgressElement({__text: 5})).toEqual(5);
    expect(parseProgressElement({__text: 1.1})).toEqual(1.1);
    expect(parseProgressElement({__text: 5.4})).toEqual(5.4);
  });
});

describe('parseYesNo tests', () => {
  test('should parse yes values', () => {
    expect(parseYesNo('1')).toEqual(YES_VALUE);
    expect(parseYesNo(1)).toEqual(YES_VALUE);
    expect(parseYesNo(true)).toEqual(YES_VALUE);
    expect(parseYesNo(YES_VALUE)).toEqual(YES_VALUE);
  });

  test('should parse other values as no value', () => {
    expect(parseYesNo()).toEqual(NO_VALUE);
    expect(parseYesNo('')).toEqual(NO_VALUE);
    expect(parseYesNo('foo')).toEqual(NO_VALUE);
    expect(parseYesNo('0')).toEqual(NO_VALUE);
    expect(parseYesNo(0)).toEqual(NO_VALUE);
    expect(parseYesNo(false)).toEqual(NO_VALUE);
    expect(parseYesNo(NO_VALUE)).toEqual(NO_VALUE);
  });
});

describe('parseCsv tests', () => {
  test('should parse undefined and empty', () => {
    expect(parseCsv()).toEqual([]);
    expect(parseCsv('')).toEqual([]);
    expect(parseCsv(' ')).toEqual([]);
  });

  test('should parse csv values', () => {
    expect(parseCsv('foo,bar')).toEqual(['foo', 'bar']);
    expect(parseCsv(' foo , bar ')).toEqual(['foo', 'bar']);
    expect(parseCsv(' foo    ,      bar ')).toEqual(['foo', 'bar']);
    expect(parseCsv('foo, bar, ')).toEqual(['foo', 'bar', '']);
    expect(parseCsv('foo, bar,,,,')).toEqual(['foo', 'bar', '', '', '', '']);
  });

  test('should parse non string values', () => {
    expect(parseCsv(123)).toEqual(['123']);
  });
});

describe('parseQod tests', () => {
  test('should convert value to float', () => {
    expect(
      parseQod({
        value: '55',
        type: 'remote_vul',
      }),
    ).toEqual({
      value: 55,
      type: 'remote_vul',
    });
  });

  test('should drop unknown properties', () => {
    expect(
      parseQod({
        value: '55',
        type: 'remote_vul',
        foo: 'bar',
      }),
    ).toEqual({
      value: 55,
      type: 'remote_vul',
    });
  });
});

describe('parseEnvelopeMeta tests', () => {
  test('should parse envelope information', () => {
    expect(
      parseEnvelopeMeta({
        version: '1.0',
        backend_operation: '0.01',
        vendor_version: '1.1',
        i18n: 'en',
        time: 'Fri Sep 14 11:26:40 2018 CEST',
        timezone: 'Europe/Berlin',
      }),
    ).toEqual({
      version: '1.0',
      backendOperation: '0.01',
      vendorVersion: '1.1',
      i18n: 'en',
      time: 'Fri Sep 14 11:26:40 2018 CEST',
      timezone: 'Europe/Berlin',
    });
  });

  test('should drop unknown envelope information', () => {
    expect(
      parseEnvelopeMeta({
        version: '1.0',
        backend_operation: '0.01',
        vendor_version: '1.1',
        i18n: 'en',
        time: 'Fri Sep 14 11:26:40 2018 CEST',
        timezone: 'Europe/Berlin',
        foo: 'bar',
        lorem: 'ipsum',
      }),
    ).toEqual({
      version: '1.0',
      backendOperation: '0.01',
      vendorVersion: '1.1',
      i18n: 'en',
      time: 'Fri Sep 14 11:26:40 2018 CEST',
      timezone: 'Europe/Berlin',
    });
  });
});

describe('setProperties tests', () => {
  test('should create new object', () => {
    expect(setProperties()).toEqual({});
  });

  test('should not change object', () => {
    const obj = {foo: 'bar'};
    expect(setProperties(undefined, obj)).toBe(obj);
  });

  test('should set properties on new object', () => {
    const obj = setProperties({
      foo: 'bar',
      lorem: 'ipsum',
    });

    expect(obj.foo).toEqual('bar');
    expect(obj.lorem).toEqual('ipsum');

    expect(Object.keys(obj)).toEqual(expect.arrayContaining(['foo', 'lorem']));
  });

  test('should not allow to override set properties', () => {
    const obj = setProperties({
      foo: 'bar',
      lorem: 'ipsum',
    });

    expect(() => {
      obj.foo = 'a';
    }).toThrow();
    expect(() => {
      obj.lorem = 'a';
    }).toThrow();
  });

  test('should allow to override set properties if requested', () => {
    const obj = setProperties(
      {
        foo: 'bar',
        lorem: 'ipsum',
      },
      {},
      {writable: true},
    );

    expect(obj.foo).toEqual('bar');
    expect(obj.lorem).toEqual('ipsum');

    obj.foo = 'a';
    obj.lorem = 'b';

    expect(obj.foo).toEqual('a');
    expect(obj.lorem).toEqual('b');
  });

  test('should skip properties starting with underscore', () => {
    const obj = setProperties({
      foo: 'bar',
      _lorem: 'ipsum',
    });

    expect(obj.foo).toEqual('bar');
    expect(obj.lorem).toBeUndefined();
    expect(obj._lorem).toBeUndefined();
  });

  test('should set properties on existing object', () => {
    const orig = {foo: 'bar'};
    const obj = setProperties(
      {
        bar: 'foo',
        lorem: 'ipsum',
      },
      orig,
    );

    expect(obj).toBe(orig);
    expect(obj.foo).toEqual('bar');
    expect(obj.bar).toEqual('foo');
    expect(obj.lorem).toEqual('ipsum');

    expect(Object.keys(obj)).toEqual(
      expect.arrayContaining(['bar', 'foo', 'lorem']),
    );

    expect(() => {
      obj.bar = 'a';
    }).toThrow();
    expect(() => {
      obj.lorem = 'a';
    }).toThrow();

    obj.foo = 1;
    expect(obj.foo).toEqual(1);
  });
});

describe('parseProperties tests', () => {
  test('should create new object', () => {
    expect(parseProperties()).toEqual({});
  });

  test('should create a shallow copy', () => {
    const foo = {
      a: 1,
    };

    const obj = {
      foo,
      lorem: 'ipsum',
    };

    const parsed = parseProperties(obj);

    expect(parsed).not.toBe(obj);
    expect(parsed.foo).toBe(obj.foo);
    expect(parsed.lorem).toEqual('ipsum');
  });

  test('should copy additional properties', () => {
    const obj = {
      foo: 'bar',
      lorem: 'ipsum',
    };

    const parsed = parseProperties(obj, {bar: 'foo'});

    expect(parsed.bar).toEqual('foo');
    expect(parsed.foo).toEqual('bar');
    expect(parsed.lorem).toEqual('ipsum');
  });

  test('should not override properties with additional properties', () => {
    const obj = {
      foo: 'bar',
      lorem: 'ipsum',
    };

    const parsed = parseProperties(obj, {foo: 'foo'});

    expect(parsed.foo).toEqual('bar');
    expect(parsed.lorem).toEqual('ipsum');
  });

  test('should parse id', () => {
    const parsed = parseProperties({_id: 'a1'});
    expect(parsed.id).toEqual('a1');
  });

  test('should parse creation_time', () => {
    const parsed = parseProperties({creation_time: '2018-01-01'});

    expect(parsed.creation_time).toBeUndefined();
    expect(parsed.creationTime).toBeDefined();
    expect(isDate(parsed.creationTime)).toEqual(true);
  });

  test('should parse modification_time', () => {
    const parsed = parseProperties({modification_time: '2018-01-01'});

    expect(parsed.modification_time).toBeUndefined();
    expect(parsed.modificationTime).toBeDefined();
    expect(isDate(parsed.modificationTime)).toEqual(true);
  });

  test('should prefix type', () => {
    const parsed = parseProperties({type: 'foo'});

    expect(parsed.type).toBeUndefined();
    expect(parsed._type).toEqual('foo');
  });
});

describe('parseDate tests', () => {
  test('should return undefined', () => {
    expect(parseDate()).toBeUndefined();
  });

  test('should return a date', () => {
    const date = parseDate('2018-01-01');

    expect(date).toBeDefined();
    expect(isDate(date)).toEqual(true);
  });
});

describe('parseDuration tests', () => {
  test('should return undefined', () => {
    expect(parseDuration()).toBeUndefined();
  });

  test('should parse duration', () => {
    expect(isDuration(parseDuration('666'))).toEqual(true);
    expect(isDuration(parseDuration(666))).toEqual(true);
  });
});

describe('parseCvssV2BaseVector tests', () => {
  test('should return undefined', () => {
    expect(parseCvssV2BaseVector()[0]).toBeUndefined();
    expect(parseCvssV2BaseVector()[1]).toBeUndefined();
    expect(parseCvssV2BaseVector({})[0]).toBeUndefined();
    expect(parseCvssV2BaseVector({})[1]).toBeUndefined();
    expect(parseCvssV2BaseVector({foo: 'bar'})[0]).toBeUndefined();
    expect(parseCvssV2BaseVector({foo: 'bar'})[1]).toBeUndefined();
  });

  test('should parse accessVector', () => {
    expect(parseCvssV2BaseVector({accessVector: 'foo'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({accessVector: 'LOCAL'})).toEqual([
      'AV:L/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({accessVector: 'NETWORK'})).toEqual([
      'AV:N/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({accessVector: 'ADJACENT_NETWORK'})).toEqual([
      'AV:A/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
  });

  test('should parse accessComplexity', () => {
    expect(parseCvssV2BaseVector({accessComplexity: 'foo'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({accessComplexity: 'LOW'})).toEqual([
      'AV:ERROR/AC:L/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({accessComplexity: 'MEDIUM'})).toEqual([
      'AV:ERROR/AC:M/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({accessComplexity: 'HIGH'})).toEqual([
      'AV:ERROR/AC:H/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
  });

  test('should parse authentication', () => {
    expect(parseCvssV2BaseVector({authentication: 'foo'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({authentication: 'NONE'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:N/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(
      parseCvssV2BaseVector({authentication: 'MULTIPLE_INSTANCES'}),
    ).toEqual(['AV:ERROR/AC:ERROR/Au:M/C:ERROR/I:ERROR/A:ERROR', undefined]);
    expect(parseCvssV2BaseVector({authentication: 'SINGLE_INSTANCE'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:S/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
  });

  test('should parse confidentialityImpact', () => {
    expect(parseCvssV2BaseVector({confidentialityImpact: 'foo'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({confidentialityImpact: 'NONE'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:N/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({confidentialityImpact: 'PARTIAL'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:P/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({confidentialityImpact: 'COMPLETE'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:C/I:ERROR/A:ERROR',
      undefined,
    ]);
  });

  test('should parse integrityImpact', () => {
    expect(parseCvssV2BaseVector({integrityImpact: 'foo'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({integrityImpact: 'NONE'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:N/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({integrityImpact: 'PARTIAL'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:P/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({integrityImpact: 'COMPLETE'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:C/A:ERROR',
      undefined,
    ]);
  });

  test('should parse availabilityImpact', () => {
    expect(parseCvssV2BaseVector({availabilityImpact: 'foo'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({availabilityImpact: 'NONE'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:N',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({availabilityImpact: 'PARTIAL'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:P',
      undefined,
    ]);
    expect(parseCvssV2BaseVector({availabilityImpact: 'COMPLETE'})).toEqual([
      'AV:ERROR/AC:ERROR/Au:ERROR/C:ERROR/I:ERROR/A:C',
      undefined,
    ]);
  });
});

describe('parseCvssV3BaseVector tests', () => {
  test('should return undefined', () => {
    expect(parseCvssV3BaseVector()[0]).toBeUndefined();
    expect(parseCvssV3BaseVector()[1]).toBeUndefined();
    expect(parseCvssV3BaseVector({})[0]).toBeUndefined();
    expect(parseCvssV3BaseVector({})[1]).toBeUndefined();
    expect(parseCvssV3BaseVector({foo: 'bar'})[0]).toBeUndefined();
    expect(parseCvssV3BaseVector({foo: 'bar'})[1]).toBeUndefined();
  });

  test('should parse attackVector', () => {
    expect(parseCvssV3BaseVector({attackVector: 'foo'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({attackVector: 'LOCAL'})).toEqual([
      'CVSS:3.1/AV:L/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({attackVector: 'NETWORK'})).toEqual([
      'CVSS:3.1/AV:N/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({attackVector: 'PHYSICAL'})).toEqual([
      'CVSS:3.1/AV:P/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
  });

  test('should parse attackComplexity', () => {
    expect(parseCvssV3BaseVector({attackComplexity: 'foo'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({attackComplexity: 'LOW'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:L/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({attackComplexity: 'HIGH'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:H/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
  });

  test('should parse privilegesRequired', () => {
    expect(parseCvssV3BaseVector({privilegesRequired: 'foo'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({privilegesRequired: 'NONE'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:N/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({privilegesRequired: 'HIGH'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:H/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({privilegesRequired: 'LOW'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:L/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
  });

  test('should parse userInteraction', () => {
    expect(parseCvssV3BaseVector({userInteraction: 'foo'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({userInteraction: 'NONE'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:N/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({userInteraction: 'REQUIRED'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:R/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
  });

  test('should parse scope', () => {
    expect(parseCvssV3BaseVector({scope: 'foo'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({scope: 'UNCHANGED'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:U/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({scope: 'CHANGED'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:C/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
  });

  test('should parse confidentialityImpact', () => {
    expect(parseCvssV3BaseVector({confidentialityImpact: 'foo'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({confidentialityImpact: 'NONE'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:N/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({confidentialityImpact: 'LOW'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:L/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({confidentialityImpact: 'HIGH'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:H/I:ERROR/A:ERROR',
      undefined,
    ]);
  });

  test('should parse integrityImpact', () => {
    expect(parseCvssV3BaseVector({integrityImpact: 'foo'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({integrityImpact: 'NONE'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:N/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({integrityImpact: 'LOW'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:L/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({integrityImpact: 'HIGH'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:H/A:ERROR',
      undefined,
    ]);
  });

  test('should parse availabilityImpact', () => {
    expect(parseCvssV3BaseVector({availabilityImpact: 'foo'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:ERROR',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({availabilityImpact: 'NONE'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:N',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({availabilityImpact: 'LOW'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:L',
      undefined,
    ]);
    expect(parseCvssV3BaseVector({availabilityImpact: 'HIGH'})).toEqual([
      'CVSS:3.1/AV:ERROR/AC:ERROR/PR:ERROR/UI:ERROR/S:ERROR/C:ERROR/I:ERROR/A:H',
      undefined,
    ]);
  });
});

describe('parseXmlEncodedString tests', () => {
  test('should unescape xml entities', () => {
    expect(parseXmlEncodedString('unesc &lt;')).toEqual('unesc <');
    expect(parseXmlEncodedString('unesc &gt;')).toEqual('unesc >');
    expect(parseXmlEncodedString('unesc &amp;')).toEqual('unesc &');
    expect(parseXmlEncodedString('unesc &apos;')).toEqual(`unesc '`);
    expect(parseXmlEncodedString('unesc &quot;')).toEqual('unesc "');
    expect(parseXmlEncodedString('unesc &#x2F;')).toEqual('unesc /');
    expect(parseXmlEncodedString('unesc &#x5C;')).toEqual('unesc \\');
    expect(parseXmlEncodedString(`unes <>&'" &quot;`)).toEqual(`unes <>&'" "`);
  });
});

describe('parseCvssV2BaseFromVector tests', () => {
  test('should return empty object', () => {
    expect(parseCvssV2BaseFromVector()).toEqual({});
    expect(parseCvssV2BaseFromVector('')).toEqual({});
    expect(parseCvssV2BaseFromVector(' ')).toEqual({});
  });

  test('should set vectors to undefined', () => {
    expect(parseCvssV2BaseFromVector('foo')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse av', () => {
    expect(parseCvssV2BaseFromVector('AV:L')).toEqual({
      accessVector: 'LOCAL',
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('AV:A')).toEqual({
      accessVector: 'ADJACENT_NETWORK',
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('AV:N')).toEqual({
      accessVector: 'NETWORK',
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse ac', () => {
    expect(parseCvssV2BaseFromVector('AC:L')).toEqual({
      accessVector: undefined,
      accessComplexity: 'LOW',
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('AC:M')).toEqual({
      accessVector: undefined,
      accessComplexity: 'MEDIUM',
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('AC:H')).toEqual({
      accessVector: undefined,
      accessComplexity: 'HIGH',
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse au', () => {
    expect(parseCvssV2BaseFromVector('AU:M')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: 'MULTIPLE_INSTANCES',
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('AU:S')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: 'SINGLE_INSTANCE',
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('AU:N')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: 'NONE',
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse c', () => {
    expect(parseCvssV2BaseFromVector('C:C')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: 'COMPLETE',
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('C:P')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: 'PARTIAL',
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('C:N')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: 'NONE',
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse i', () => {
    expect(parseCvssV2BaseFromVector('I:C')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: 'COMPLETE',
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('I:P')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: 'PARTIAL',
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('I:N')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: 'NONE',
      cvssScore: undefined,
    });
  });

  test('should parse a', () => {
    expect(parseCvssV2BaseFromVector('A:C')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: 'COMPLETE',
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('A:P')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: 'PARTIAL',
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV2BaseFromVector('A:N')).toEqual({
      accessVector: undefined,
      accessComplexity: undefined,
      authentication: undefined,
      availabilityImpact: 'NONE',
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse full vector', () => {
    expect(parseCvssV2BaseFromVector('AV:N/AC:H/AU:S/C:C/I:C/A:C')).toEqual({
      accessVector: 'NETWORK',
      accessComplexity: 'HIGH',
      authentication: 'SINGLE_INSTANCE',
      availabilityImpact: 'COMPLETE',
      confidentialityImpact: 'COMPLETE',
      integrityImpact: 'COMPLETE',
      cvssScore: 7.1,
    });
  });
});

describe('parseCvssV3BaseFromVector tests', () => {
  test('should return empty object', () => {
    expect(parseCvssV3BaseFromVector()).toEqual({});
    expect(parseCvssV3BaseFromVector('')).toEqual({});
    expect(parseCvssV3BaseFromVector(' ')).toEqual({});
  });

  test('should set vectors to undefined', () => {
    expect(parseCvssV3BaseFromVector('foo')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse av', () => {
    expect(parseCvssV3BaseFromVector('AV:L')).toEqual({
      attackVector: 'LOCAL',
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('AV:A')).toEqual({
      attackVector: 'ADJACENT_NETWORK',
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('AV:N')).toEqual({
      attackVector: 'NETWORK',
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('AV:L')).toEqual({
      attackVector: 'LOCAL',
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse ac', () => {
    expect(parseCvssV3BaseFromVector('AC:L')).toEqual({
      attackVector: undefined,
      attackComplexity: 'LOW',
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('AC:H')).toEqual({
      attackVector: undefined,
      attackComplexity: 'HIGH',
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse pr', () => {
    expect(parseCvssV3BaseFromVector('PR:H')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: 'HIGH',
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('PR:L')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: 'LOW',
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('PR:N')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: 'NONE',
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse ui', () => {
    expect(parseCvssV3BaseFromVector('UI:R')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: 'REQUIRED',
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('UI:N')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: 'NONE',
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse s', () => {
    expect(parseCvssV3BaseFromVector('S:C')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: 'CHANGED',
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('S:U')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: 'UNCHANGED',
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse c', () => {
    expect(parseCvssV3BaseFromVector('C:H')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: 'HIGH',
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('C:L')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: 'LOW',
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('C:N')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: 'NONE',
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse i', () => {
    expect(parseCvssV3BaseFromVector('I:H')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: 'HIGH',
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('I:L')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: 'LOW',
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('I:N')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: undefined,
      confidentialityImpact: undefined,
      integrityImpact: 'NONE',
      cvssScore: undefined,
    });
  });

  test('should parse a', () => {
    expect(parseCvssV3BaseFromVector('A:H')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: 'HIGH',
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('A:L')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: 'LOW',
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
    expect(parseCvssV3BaseFromVector('A:N')).toEqual({
      attackVector: undefined,
      attackComplexity: undefined,
      privilegesRequired: undefined,
      userInteraction: undefined,
      scope: undefined,
      availabilityImpact: 'NONE',
      confidentialityImpact: undefined,
      integrityImpact: undefined,
      cvssScore: undefined,
    });
  });

  test('should parse full vector', () => {
    expect(
      parseCvssV3BaseFromVector('CVSS:3.1/AV:P/AC:L/PR:N/UI:N/S:C/C:N/I:H/A:N'),
    ).toEqual({
      attackVector: 'PHYSICAL',
      attackComplexity: 'LOW',
      privilegesRequired: 'NONE',
      userInteraction: 'NONE',
      scope: 'CHANGED',
      availabilityImpact: 'NONE',
      confidentialityImpact: 'NONE',
      integrityImpact: 'HIGH',
      cvssScore: 5.3,
    });
  });
});

describe('parseText tests', () => {
  test('should return undefined for undefined', () => {
    expect(parseText()).toBeUndefined();
  });

  test('should return string for string', () => {
    expect(parseText('foo')).toEqual('foo');
  });

  test('should return __text if set', () => {
    expect(parseText({__text: 'foo'})).toEqual('foo');
  });
});

describe('parseBoolean tests', () => {
  test('should parse int numbers', () => {
    expect(parseBoolean(1)).toBe(true);
    expect(parseBoolean(0)).toBe(false);
    expect(parseBoolean(2)).toBe(true);
    expect(parseBoolean(-2)).toBe(true);
  });

  test('should parse int number strings', () => {
    expect(parseBoolean('1')).toBe(true);
    expect(parseBoolean('0')).toBe(false);
    expect(parseBoolean('2')).toBe(true);
    expect(parseBoolean('-2')).toBe(true);
  });

  test('should parse undefined', () => {
    expect(parseBoolean()).toBe(false);
  });

  test('should parse empty string', () => {
    expect(parseBoolean('')).toBe(false);
  });

  test('should parse non number strings', () => {
    expect(parseBoolean('foo')).toBe(false);
  });

  test('should parse boolean', () => {
    expect(parseBoolean(false)).toBe(false);
    expect(parseBoolean(true)).toBe(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
