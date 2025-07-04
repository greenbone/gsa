/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportConfig from 'gmp/models/reportconfig';
import {testModel} from 'gmp/models/testing';

describe('Report Config model tests', () => {
  testModel(ReportConfig, 'reportconfig', {testIsActive: false});

  test('should use defaults', () => {
    const reportConfig = new ReportConfig();
    expect(reportConfig.alerts).toEqual([]);
    expect(reportConfig.params).toEqual([]);
    expect(reportConfig.reportFormat).toBeUndefined();
  });

  test('should parse empty element', () => {
    const reportConfig = ReportConfig.fromElement();
    expect(reportConfig.alerts).toEqual([]);
    expect(reportConfig.params).toEqual([]);
    expect(reportConfig.reportFormat).toBeUndefined();
  });

  test('should parse report format', () => {
    const reportConfig = ReportConfig.fromElement({
      report_format: {
        _id: 'foo',
        name: 'bar',
      },
    });
    expect(reportConfig.reportFormat?.id).toEqual('foo');
    expect(reportConfig.reportFormat?.name).toEqual('bar');
  });

  test('should parse alerts', () => {
    const reportConfig = ReportConfig.fromElement({
      alerts: {
        alert: {
          _id: 'foo',
          name: 'bar',
        },
      },
    });
    expect(reportConfig.alerts[0].id).toEqual('foo');
    expect(reportConfig.alerts[0].name).toEqual('bar');

    const reportConfig2 = ReportConfig.fromElement({
      alerts: {
        alert: [
          {
            _id: 'lorem',
            name: 'ipsum',
          },
          {
            _id: 'foo',
            name: 'bar',
          },
        ],
      },
    });
    expect(reportConfig2.alerts[0].id).toEqual('lorem');
    expect(reportConfig2.alerts[0].name).toEqual('ipsum');
    expect(reportConfig2.alerts[1].id).toEqual('foo');
    expect(reportConfig2.alerts[1].name).toEqual('bar');
  });

  describe('params tests', () => {
    test('should parse params with attributes given as objects where applicable', () => {
      const reportConfig = ReportConfig.fromElement({
        param: [
          {
            value: {
              __text: 'lorem',
            },
            default: {
              __text: 'ipsum',
            },
            name: 'foo',
            type: {
              __text: 'dolor',
              max: 1,
              min: 0,
            },
          },
        ],
      });
      expect(reportConfig.params[0].value).toEqual('lorem');
      expect(reportConfig.params[0].default).toEqual('ipsum');
      expect(reportConfig.params[0].name).toEqual('foo');
      expect(reportConfig.params[0].max).toEqual(1);
      expect(reportConfig.params[0].min).toEqual(0);
      expect(reportConfig.params[0].type).toEqual('dolor');
    });

    test('should parse params with attributes not given as objects', () => {
      const reportConfig = ReportConfig.fromElement({
        param: [
          {
            value: 'lorem',
            default: 'ipsum',
            name: 'foo',
            type: {
              max: 1,
              min: 0,
            },
          },
        ],
      });
      expect(reportConfig.params[0].value).toEqual('lorem');
      expect(reportConfig.params[0].default).toEqual('ipsum');
      expect(reportConfig.params[0].name).toEqual('foo');
    });

    test('should parse options in params', () => {
      const reportConfig = ReportConfig.fromElement({
        param: [
          {
            options: {
              option: ['opt1', 'opt2'],
            },
            type: {
              max: 1,
              min: 0,
            },
          },
        ],
      });
      expect(reportConfig.params[0].options).toEqual([
        {value: 'opt1', name: 'opt1'},
        {value: 'opt2', name: 'opt2'},
      ]);
    });

    test('should return empty array if no options are given', () => {
      const reportConfig = ReportConfig.fromElement({
        param: [
          {
            type: {
              max: 1,
              min: 0,
            },
          },
        ],
      });
      expect(reportConfig.params[0].options).toEqual([]);
    });

    test('should parse param if it is not in an array', () => {
      const reportConfig = ReportConfig.fromElement({
        param: {
          name: 'foo',
          type: {
            max: 1,
            min: 0,
          },
        },
      });
      expect(reportConfig.params[0].name).toEqual('foo');
    });

    test('should parse param valueUsingDefault', () => {
      const reportConfig = ReportConfig.fromElement({
        param: [
          {
            name: 'foo',
            value: {
              _using_default: '1',
            },
            type: {
              max: 1,
              min: 0,
            },
          },
          {
            name: 'bar',
            value: {
              _using_default: '0',
            },
            type: {
              max: 1,
              min: 0,
            },
          },
        ],
      });
      expect(reportConfig.params[0].name).toEqual('foo');
      expect(reportConfig.params[0].valueUsingDefault).toEqual(true);
      expect(reportConfig.params[1].name).toEqual('bar');
      expect(reportConfig.params[1].valueUsingDefault).toEqual(false);
    });

    test('should parse value, default and type in string params', () => {
      const reportConfig = ReportConfig.fromElement({
        param: [
          {
            value: {
              _using_default: '0',
              __text: 'foo',
            },
            default: 'bar',
            type: {
              __text: 'string',
              max: 1,
              min: 0,
            },
          },
          {
            value: 'baz',
            default: 'boo',
            type: {
              __text: 'string',
              max: 1,
              min: 0,
            },
          },
        ],
      });

      expect(reportConfig.params[0].type).toEqual('string');
      expect(reportConfig.params[0].value).toEqual('foo');
      expect(reportConfig.params[0].default).toEqual('bar');
      expect(reportConfig.params[0].valueUsingDefault).toEqual(false);

      expect(reportConfig.params[1].type).toEqual('string');
      expect(reportConfig.params[1].value).toEqual('baz');
      expect(reportConfig.params[1].default).toEqual('boo');
      expect(reportConfig.params[0].valueUsingDefault).toEqual(false);
    });

    test('should parse value, default and type in text params', () => {
      const reportConfig = ReportConfig.fromElement({
        param: [
          {
            value: {
              _using_default: '0',
              __text: 'foo',
            },
            default: 'bar',
            type: {
              __text: 'text',
              max: 1,
              min: 0,
            },
          },
          {
            value: 'baz',
            default: 'boo',
            type: {
              __text: 'text',
              max: 1,
              min: 0,
            },
          },
        ],
      });

      expect(reportConfig.params[0].type).toEqual('text');
      expect(reportConfig.params[0].value).toEqual('foo');
      expect(reportConfig.params[0].default).toEqual('bar');
      expect(reportConfig.params[0].valueUsingDefault).toEqual(false);

      expect(reportConfig.params[1].type).toEqual('text');
      expect(reportConfig.params[1].value).toEqual('baz');
      expect(reportConfig.params[1].default).toEqual('boo');
      expect(reportConfig.params[0].valueUsingDefault).toEqual(false);
    });

    test('should parse value, default and type in integer params', () => {
      const reportConfig = ReportConfig.fromElement({
        param: [
          {
            value: {
              _using_default: '0',
              __text: '123',
            },
            default: '234',
            type: {
              __text: 'integer',
              max: 999,
              min: 0,
            },
          },
          {
            value: '345',
            default: '456',
            type: {
              __text: 'integer',
              max: 999,
              min: 0,
            },
          },
        ],
      });

      expect(reportConfig.params[0].type).toEqual('integer');
      expect(reportConfig.params[0].value).toEqual(123);
      expect(reportConfig.params[0].default).toEqual(234);
      expect(reportConfig.params[0].valueUsingDefault).toEqual(false);

      expect(reportConfig.params[1].type).toEqual('integer');
      expect(reportConfig.params[1].value).toEqual(345);
      expect(reportConfig.params[1].default).toEqual(456);
      expect(reportConfig.params[0].valueUsingDefault).toEqual(false);
    });

    test('should parse value, default and type in boolean params', () => {
      const reportConfig = ReportConfig.fromElement({
        param: [
          {
            value: {
              _using_default: '0',
              __text: '0',
            },
            default: '1',
            type: {
              __text: 'boolean',
              max: 1,
              min: 0,
            },
          },
          {
            value: '1',
            default: '1',
            type: {
              __text: 'boolean',
              max: 1,
              min: 0,
            },
          },
        ],
      });

      expect(reportConfig.params[0].type).toEqual('boolean');
      expect(reportConfig.params[0].value).toEqual(false);
      expect(reportConfig.params[0].default).toEqual(true);
      expect(reportConfig.params[0].valueUsingDefault).toEqual(false);

      expect(reportConfig.params[1].type).toEqual('boolean');
      expect(reportConfig.params[1].value).toEqual(true);
      expect(reportConfig.params[1].default).toEqual(true);
      expect(reportConfig.params[0].valueUsingDefault).toEqual(false);
    });

    test('should parse options, value, default and type in selection params', () => {
      const reportConfig = ReportConfig.fromElement({
        param: [
          {
            value: {
              _using_default: '0',
              __text: 'opt1',
            },
            default: 'opt2',
            options: {
              option: ['opt1', 'opt2'],
            },
            type: {
              __text: 'selection',
              max: 1,
              min: 0,
            },
          },
          {
            value: 'optA',
            default: 'optA',
            options: {
              option: ['optA', 'optB'],
            },
            type: {
              __text: 'selection',
              max: 1,
              min: 0,
            },
          },
        ],
      });

      expect(reportConfig.params[0].type).toEqual('selection');
      expect(reportConfig.params[0].value).toEqual('opt1');
      expect(reportConfig.params[0].default).toEqual('opt2');
      expect(reportConfig.params[0].options).toEqual([
        {
          value: 'opt1',
          name: 'opt1',
        },
        {
          value: 'opt2',
          name: 'opt2',
        },
      ]);

      expect(reportConfig.params[1].type).toEqual('selection');
      expect(reportConfig.params[1].value).toEqual('optA');
      expect(reportConfig.params[1].default).toEqual('optA');
      expect(reportConfig.params[1].options).toEqual([
        {
          value: 'optA',
          name: 'optA',
        },
        {
          value: 'optB',
          name: 'optB',
        },
      ]);
    });

    test('should parse value, default and type in report_format_list params', () => {
      const reportConfig = ReportConfig.fromElement({
        param: [
          {
            type: {
              __text: 'report_format_list',
              max: 1,
              min: 0,
            },
            value: {
              _using_default: '0',
              report_format: [
                {_id: '42', name: 'ABC'},
                {_id: '21', name: 'DEF'},
              ],
            },
            default: {
              report_format: [
                {_id: '12', name: 'GHI'},
                {_id: '34', name: 'JKL'},
              ],
            },
          },
          {
            type: {
              __text: 'report_format_list',
              max: 1,
              min: 0,
            },
            value: {
              _using_default: '0',
              report_format: {_id: '123', name: 'XYZ'},
            },
            default: {
              report_format: {_id: '456', name: 'UVW'},
            },
          },
        ],
      });

      expect(reportConfig.params[0].type).toEqual('report_format_list');
      expect(reportConfig.params[0].value).toEqual(['42', '21']);
      expect(reportConfig.params[0].valueLabels).toEqual({
        42: 'ABC',
        21: 'DEF',
      });
      expect(reportConfig.params[0].default).toEqual(['12', '34']);
      expect(reportConfig.params[0].defaultLabels).toEqual({
        12: 'GHI',
        34: 'JKL',
      });
      expect(reportConfig.params[0].valueUsingDefault).toEqual(false);

      expect(reportConfig.params[1].type).toEqual('report_format_list');
      expect(reportConfig.params[1].value).toEqual(['123']);
      expect(reportConfig.params[1].valueLabels).toEqual({123: 'XYZ'});
      expect(reportConfig.params[1].default).toEqual(['456']);
      expect(reportConfig.params[1].defaultLabels).toEqual({456: 'UVW'});
      expect(reportConfig.params[0].valueUsingDefault).toEqual(false);
    });
  });
});
