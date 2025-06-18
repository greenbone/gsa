/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {isDate, isDuration} from 'gmp/models/date';
import {
  parseCsv,
  parseBoolean,
  parseDate,
  parseDuration,
  parseFloat,
  parseInt,
  parseProgressElement,
  parseQod,
  parseSeverity,
  parseXmlEncodedString,
  parseText,
  parseTextElement,
  parseYesNo,
  YES_VALUE,
  NO_VALUE,
  setProperties,
  parseToString,
} from 'gmp/parser';

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

  test('should parse infinity as undefined', () => {
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
        __excerpt: '1',
      }),
    ).toEqual({
      text: 'foo',
      textExcerpt: '1',
    });
  });

  test('should convert plain text elements', () => {
    expect(parseTextElement('foo')).toEqual({
      text: 'foo',
      textExcerpt: '0',
    });
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
    expect(parseYesNo(YES_VALUE)).toEqual(YES_VALUE);
  });

  test('should parse other values as no value', () => {
    expect(parseYesNo()).toEqual(NO_VALUE);
    expect(parseYesNo('')).toEqual(NO_VALUE);
    expect(parseYesNo('foo')).toEqual(NO_VALUE);
    expect(parseYesNo('0')).toEqual(NO_VALUE);
    expect(parseYesNo(0)).toEqual(NO_VALUE);
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
        // @ts-expect-error
        foo: 'bar',
      }),
    ).toEqual({
      value: 55,
      type: 'remote_vul',
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
    // @ts-expect-error
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

    obj.foo = 'b';
    expect(obj.foo).toEqual('b');
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
    // @ts-expect-error
    expect(parseDuration()).toBeUndefined();
  });

  test('should parse duration', () => {
    expect(isDuration(parseDuration('666'))).toEqual(true);
    expect(isDuration(parseDuration(666))).toEqual(true);
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

describe('parseToString tests', () => {
  test('should return undefined for undefined', () => {
    expect(parseToString()).toBeUndefined();
  });

  test('should return string for string', () => {
    expect(parseToString('foo')).toEqual('foo');
  });

  test('should return string for numbers', () => {
    expect(parseToString(1)).toEqual('1');
  });
});
