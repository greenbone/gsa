/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {isDate} from 'gmp/models/date';
import ReportFormat from 'gmp/models/reportformat';
import {testModel} from 'gmp/models/testing';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';

testModel(ReportFormat, 'reportformat', {testIsActive: false});

describe('ReportFormat model tests', () => {
  test('should use defaults', () => {
    const reportFormat = new ReportFormat();
    expect(reportFormat.alerts).toEqual([]);
    expect(reportFormat.configurable).toBeUndefined();
    expect(reportFormat.content_type).toBeUndefined();
    expect(reportFormat.extension).toBeUndefined();
    expect(reportFormat.invisible_alerts).toBeUndefined();
    expect(reportFormat.invisible_report_configs).toBeUndefined();
    expect(reportFormat.params).toEqual([]);
    expect(reportFormat.predefined).toBeUndefined();
    expect(reportFormat.report_configs).toEqual([]);
    expect(reportFormat.report_type).toBeUndefined();
    expect(reportFormat.trust).toBeUndefined();
  });

  test('should parse empty element', () => {
    const reportFormat = ReportFormat.fromElement();
    expect(reportFormat.alerts).toEqual([]);
    expect(reportFormat.configurable).toBeUndefined();
    expect(reportFormat.content_type).toBeUndefined();
    expect(reportFormat.extension).toBeUndefined();
    expect(reportFormat.invisible_alerts).toBeUndefined();
    expect(reportFormat.invisible_report_configs).toBeUndefined();
    expect(reportFormat.params).toEqual([]);
    expect(reportFormat.predefined).toBeUndefined();
    expect(reportFormat.report_configs).toEqual([]);
    expect(reportFormat.report_type).toBeUndefined();
    expect(reportFormat.trust).toBeUndefined();
  });

  test('should parse trust', () => {
    const reportFormat = ReportFormat.fromElement({
      trust: {
        __text: 'foo',
        time: '2018-10-10T13:30:00+01:00',
      },
    });
    const reportFormat2 = ReportFormat.fromElement({
      trust: {
        __text: 'bar',
      },
    });

    expect(reportFormat.trust?.value).toEqual('foo');
    expect(isDate(reportFormat.trust?.time)).toEqual(true);
    expect(reportFormat2.trust?.value).toEqual('bar');
    expect(reportFormat2.trust?.time).toBeUndefined();
  });

  test('should parse active', () => {
    const reportFormat = ReportFormat.fromElement({active: 0});
    const reportFormat2 = ReportFormat.fromElement({active: 1});

    expect(reportFormat.active).toEqual(NO_VALUE);
    expect(reportFormat2.active).toEqual(YES_VALUE);
  });

  test('should parse configurable', () => {
    const reportFormat = ReportFormat.fromElement({configurable: 0});
    const reportFormat2 = ReportFormat.fromElement({configurable: 1});

    expect(reportFormat.configurable).toEqual(false);
    expect(reportFormat2.configurable).toEqual(true);
  });

  test('should parse predefined', () => {
    const reportFormat = ReportFormat.fromElement({predefined: 0});
    const reportFormat2 = ReportFormat.fromElement({predefined: 1});

    expect(reportFormat.predefined).toEqual(false);
    expect(reportFormat2.predefined).toEqual(true);
  });

  test('should parse alerts', () => {
    const reportFormat = ReportFormat.fromElement({
      alerts: {
        alert: [{_id: '12'}],
      },
    });

    expect(reportFormat.alerts[0].entityType).toEqual('alert');
    expect(reportFormat.alerts[0].id).toEqual('12');
  });

  test('should parse content type', () => {
    const reportFormat = ReportFormat.fromElement({
      content_type: 'application/pdf',
    });
    expect(reportFormat.content_type).toEqual('application/pdf');
  });

  test('should parse extension', () => {
    const reportFormat = ReportFormat.fromElement({
      extension: 'pdf',
    });
    expect(reportFormat.extension).toEqual('pdf');
  });

  test('should parse report type', () => {
    const reportFormat = ReportFormat.fromElement({
      report_type: 'scan',
    });
    expect(reportFormat.report_type).toEqual('scan');
  });

  test('should parse invisible alerts count', () => {
    const reportFormat = ReportFormat.fromElement({
      invisible_alerts: 3,
    });

    expect(reportFormat.invisible_alerts).toEqual(3);
  });

  test('should parse invisible report configs count', () => {
    const reportFormat = ReportFormat.fromElement({
      invisible_report_configs: 5,
    });

    expect(reportFormat.invisible_report_configs).toEqual(5);
  });

  test('should parse params', () => {
    const reportFormat = ReportFormat.fromElement({
      param: [
        {
          default: 'ipsum',
          name: 'foo',
          type: {
            __text: 'lorem',
            max: 1,
            min: 0,
          },
        },
      ],
    });

    expect(reportFormat.params[0].default).toEqual('ipsum');
    expect(reportFormat.params[0].name).toEqual('foo');
    expect(reportFormat.params[0].max).toEqual(1);
    expect(reportFormat.params[0].min).toEqual(0);
    expect(reportFormat.params[0].type).toEqual('lorem');
    expect(reportFormat.params[0].options).toEqual([]);
    expect(reportFormat.params[0].value).toBeUndefined();
    expect(reportFormat.params[0].value_labels).toBeUndefined();
    expect(reportFormat.params[0].default_labels).toBeUndefined();

    const reportFormat2 = ReportFormat.fromElement({
      param: [
        {
          default: 'ipsum',
          name: 'foo',
          type: {
            max: 1,
            min: 0,
          },
        },
      ],
    });

    expect(reportFormat2.params[0].default).toEqual('ipsum');
    expect(reportFormat2.params[0].name).toEqual('foo');
    expect(reportFormat2.params[0].max).toEqual(1);
    expect(reportFormat2.params[0].min).toEqual(0);
    expect(reportFormat2.params[0].type).toBeUndefined();
    expect(reportFormat2.params[0].options).toEqual([]);
    expect(reportFormat2.params[0].value).toBeUndefined();
    expect(reportFormat2.params[0].value_labels).toBeUndefined();
    expect(reportFormat2.params[0].default_labels).toBeUndefined();

    const reportFormat3 = ReportFormat.fromElement({
      param: [
        {
          default: {
            __text: 'ipsum',
          },
          name: 'foo',
          type: {
            max: 1,
            min: 0,
          },
        },
      ],
    });

    expect(reportFormat3.params[0].default).toEqual('ipsum');
    expect(reportFormat3.params[0].name).toEqual('foo');
    expect(reportFormat3.params[0].max).toEqual(1);
    expect(reportFormat3.params[0].min).toEqual(0);
    expect(reportFormat3.params[0].type).toBeUndefined();
    expect(reportFormat3.params[0].options).toEqual([]);
    expect(reportFormat3.params[0].value).toBeUndefined();
    expect(reportFormat3.params[0].value_labels).toBeUndefined();
    expect(reportFormat3.params[0].default_labels).toBeUndefined();

    const reportFormat4 = ReportFormat.fromElement({
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

    expect(reportFormat4.params[0].default).toBeUndefined;
    expect(reportFormat4.params[0].name).toBeUndefined();
    expect(reportFormat4.params[0].max).toEqual(1);
    expect(reportFormat4.params[0].min).toEqual(0);
    expect(reportFormat4.params[0].type).toBeUndefined();
    expect(reportFormat4.params[0].options).toEqual([
      {value: 'opt1', name: 'opt1'},
      {value: 'opt2', name: 'opt2'},
    ]);
    expect(reportFormat4.params[0].value).toBeUndefined();
    expect(reportFormat4.params[0].value_labels).toBeUndefined();
    expect(reportFormat4.params[0].default_labels).toBeUndefined();

    const reportFormat5 = ReportFormat.fromElement({
      param: [
        {
          value: {
            __text: 'foo',
          },
          type: {
            max: 1,
            min: 0,
          },
        },
      ],
    });
    expect(reportFormat5.params[0].default).toBeUndefined;
    expect(reportFormat5.params[0].name).toBeUndefined();
    expect(reportFormat5.params[0].max).toEqual(1);
    expect(reportFormat5.params[0].min).toEqual(0);
    expect(reportFormat5.params[0].type).toBeUndefined();
    expect(reportFormat5.params[0].options).toEqual([]);
    expect(reportFormat5.params[0].value).toEqual('foo');
    expect(reportFormat5.params[0].value_labels).toBeUndefined();
    expect(reportFormat5.params[0].default_labels).toBeUndefined();

    const reportFormat6 = ReportFormat.fromElement({
      param: [
        {
          value: 'bar',
          type: {
            max: 1,
            min: 0,
          },
        },
      ],
    });
    expect(reportFormat6.params[0].default).toBeUndefined;
    expect(reportFormat6.params[0].name).toBeUndefined();
    expect(reportFormat6.params[0].max).toEqual(1);
    expect(reportFormat6.params[0].min).toEqual(0);
    expect(reportFormat6.params[0].type).toBeUndefined();
    expect(reportFormat6.params[0].options).toEqual([]);
    expect(reportFormat6.params[0].value).toEqual('bar');
    expect(reportFormat6.params[0].value_labels).toBeUndefined();
    expect(reportFormat6.params[0].default_labels).toBeUndefined();

    const reportFormat7 = ReportFormat.fromElement({
      param: [
        {
          type: {
            __text: 'report_format_list',
            max: 1,
            min: 0,
          },
          value: {
            report_format: [{_id: '42'}, {_id: '21'}],
          },
          default: {
            report_format: [{_id: '43'}, {_id: '22'}],
          },
        },
      ],
    });
    expect(reportFormat7.params[0].default).toBeUndefined;
    expect(reportFormat7.params[0].name).toBeUndefined();
    expect(reportFormat7.params[0].max).toEqual(1);
    expect(reportFormat7.params[0].min).toEqual(0);
    expect(reportFormat7.params[0].type).toEqual('report_format_list');
    expect(reportFormat7.params[0].options).toEqual([]);
    expect(reportFormat7.params[0].value).toEqual(['42', '21']);
    expect(reportFormat7.params[0].value_labels).toEqual({});
    expect(reportFormat7.params[0].default_labels).toEqual({});

    const reportFormat8 = ReportFormat.fromElement({
      param: [
        {
          type: {
            __text: 'report_format_list',
            max: 1,
            min: 0,
          },
          value: {
            report_format: {_id: '42'},
          },
          default: {
            report_format: {_id: '43'},
          },
        },
      ],
    });
    expect(reportFormat8.params[0].default).toBeUndefined;
    expect(reportFormat8.params[0].name).toBeUndefined();
    expect(reportFormat8.params[0].max).toEqual(1);
    expect(reportFormat8.params[0].min).toEqual(0);
    expect(reportFormat8.params[0].type).toEqual('report_format_list');
    expect(reportFormat8.params[0].options).toEqual([]);
    expect(reportFormat8.params[0].value).toEqual(['42']);
    expect(reportFormat7.params[0].value_labels).toEqual({});
    expect(reportFormat7.params[0].default_labels).toEqual({});

    const reportFormat9 = ReportFormat.fromElement({
      param: [
        {
          type: {
            __text: 'report_format_list',
            max: 1,
            min: 0,
          },
          value: {
            report_format: [
              {_id: '42', name: '1'},
              {_id: '21', name: '2'},
            ],
          },
          default: {
            report_format: [
              {_id: '43', name: '3'},
              {_id: '22', name: '4'},
            ],
          },
        },
      ],
    });
    expect(reportFormat9.params[0].default).toBeUndefined;
    expect(reportFormat9.params[0].name).toBeUndefined();
    expect(reportFormat9.params[0].max).toEqual(1);
    expect(reportFormat9.params[0].min).toEqual(0);
    expect(reportFormat9.params[0].type).toEqual('report_format_list');
    expect(reportFormat9.params[0].options).toEqual([]);
    expect(reportFormat9.params[0].value).toEqual(['42', '21']);
    expect(reportFormat9.params[0].value_labels).toEqual({21: '2', 42: '1'});
    expect(reportFormat9.params[0].default_labels).toEqual({22: '4', 43: '3'});
  });

  describe('ReportFormat model method tests', () => {
    test('isActive() returns correct true/false', () => {
      const reportFormat = new ReportFormat({active: 0});
      const reportFormat2 = new ReportFormat({active: 1});

      expect(reportFormat.isActive()).toBe(false);
      expect(reportFormat2.isActive()).toBe(true);
    });

    test('isTrusted() returns correct true/false', () => {
      const reportFormat = new ReportFormat({
        trust: {
          value: 'no',
        },
      });
      const reportFormat2 = new ReportFormat({
        trust: {
          value: 'yes',
        },
      });

      expect(reportFormat.isTrusted()).toBe(false);
      expect(reportFormat2.isTrusted()).toBe(true);
    });
  });
});
