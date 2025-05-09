/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Model from 'gmp/model';
import {isDate} from 'gmp/models/date';
import ReportFormat from 'gmp/models/reportformat';
import {testModel} from 'gmp/models/testing';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';

testModel(ReportFormat, 'reportformat', {testIsActive: false});

describe('ReportFormat model tests', () => {
  test('should parse trust', () => {
    const elem = {
      trust: {
        __text: 'foo',
        time: '2018-10-10T13:30:00+01:00',
      },
    };
    const elem2 = {
      trust: {
        __text: 'bar',
      },
    };
    const reportFormat = ReportFormat.fromElement(elem);
    const reportFormat2 = ReportFormat.fromElement(elem2);

    expect(reportFormat.trust.value).toEqual('foo');
    expect(isDate(reportFormat.trust.time)).toEqual(true);
    expect(reportFormat2.trust.value).toEqual('bar');
    expect(reportFormat2.trust.time).toBeUndefined();
  });

  test('should return empty object if no trust is given', () => {
    const reportFormat = ReportFormat.fromElement({});

    expect(reportFormat.trust).toEqual({});
  });

  test('should parse active as yes/no correctly', () => {
    const reportFormat = ReportFormat.fromElement({active: '0'});
    const reportFormat2 = ReportFormat.fromElement({active: '1'});

    expect(reportFormat.active).toEqual(NO_VALUE);
    expect(reportFormat2.active).toEqual(YES_VALUE);
  });

  test('should parse configurable as boolean correctly', () => {
    const reportFormat = ReportFormat.fromElement({configurable: '0'});
    const reportFormat2 = ReportFormat.fromElement({configurable: '1'});
    const reportFormat3 = ReportFormat.fromElement({});

    expect(reportFormat.configurable).toEqual(false);
    expect(reportFormat2.configurable).toEqual(true);
    expect(reportFormat3.configurable).toEqual(false);
  });

  test('should parse predefined as boolean correctly', () => {
    const reportFormat = ReportFormat.fromElement({predefined: '0'});
    const reportFormat2 = ReportFormat.fromElement({predefined: '1'});

    expect(reportFormat.predefined).toEqual(false);
    expect(reportFormat2.predefined).toEqual(true);
  });

  test('should parse alerts', () => {
    const elem = {
      alerts: {
        alert: [{id: '12'}],
      },
    };
    const reportFormat = ReportFormat.fromElement(elem);

    expect(reportFormat.alerts[0]).toBeInstanceOf(Model);
    expect(reportFormat.alerts[0].entityType).toEqual('alert');
    expect(reportFormat.alerts[0].id).toEqual('12');
  });

  test('should return empty array if no alerts are given', () => {
    const reportFormat = ReportFormat.fromElement({});

    expect(reportFormat.alerts).toEqual([]);
  });

  test('should parse invisible alerts count', () => {
    const elem = {
      invisible_alerts: '3',
    };
    const reportFormat = ReportFormat.fromElement(elem);

    expect(reportFormat.invisible_alerts).toEqual(3);
  });

  describe('params tests', () => {
    test('should parse params with attributes given as objects where applicable', () => {
      const elem = {
        param: [
          {
            default: {
              __text: 'ipsum',
            },
            name: 'foo',
            type: {
              __text: 'lorem',
              max: '1',
              min: '0',
            },
          },
        ],
      };
      const reportFormat = ReportFormat.fromElement(elem);

      expect(reportFormat.param).toBeUndefined();
      expect(reportFormat.params[0].default).toEqual('ipsum');
      expect(reportFormat.params[0].name).toEqual('foo');
      expect(reportFormat.params[0].max).toEqual('1');
      expect(reportFormat.params[0].min).toEqual('0');
      expect(reportFormat.params[0].type).toEqual('lorem');
    });

    test('should parse params with attributes not given as objects', () => {
      const elem = {
        param: [
          {
            default: 'ipsum',
            name: 'foo',
            type: {
              max: '1',
              min: '0',
            },
          },
        ],
      };
      const reportFormat = ReportFormat.fromElement(elem);

      expect(reportFormat.params[0].default).toEqual('ipsum');
      expect(reportFormat.params[0].name).toEqual('foo');
    });

    test('should parse options in params', () => {
      const elem = {
        param: [
          {
            options: {
              option: ['opt1', 'opt2'],
            },
            type: {
              max: '1',
              min: '0',
            },
          },
        ],
      };
      const res = [
        {value: 'opt1', name: 'opt1'},
        {value: 'opt2', name: 'opt2'},
      ];
      const reportFormat = ReportFormat.fromElement(elem);

      expect(reportFormat.params[0].options).toEqual(res);
    });

    test('should return empty array if no options are given', () => {
      const elem = {
        param: [
          {
            type: {
              max: '1',
              min: '0',
            },
          },
        ],
      };
      const reportFormat = ReportFormat.fromElement(elem);

      expect(reportFormat.params[0].options).toEqual([]);
    });

    test('should parse value in params', () => {
      const elem = {
        param: [
          {
            value: {
              __text: 'foo',
            },
            type: {
              max: '1',
              min: '0',
            },
          },
        ],
      };
      const elem2 = {
        param: [
          {
            value: 'bar',
            type: {
              max: '1',
              min: '0',
            },
          },
        ],
      };
      const elem3 = {
        param: [
          {
            type: {
              __text: 'report_format_list',
              max: '1',
              min: '0',
            },
            value: {
              report_format: [{_id: '42'}, {_id: '21'}],
            },
            default: {
              report_format: [{_id: '43'}, {_id: '22'}],
            },
          },
        ],
      };
      const reportFormat = ReportFormat.fromElement(elem);
      const reportFormat2 = ReportFormat.fromElement(elem2);
      const reportFormat3 = ReportFormat.fromElement(elem3);

      expect(reportFormat.params[0].value).toEqual('foo');
      expect(reportFormat2.params[0].value).toEqual('bar');
      expect(reportFormat3.params[0].value).toEqual(['42', '21']);
    });
  });

  describe('ReportFormat model method tests', () => {
    test('isActive() returns correct true/false', () => {
      const reportFormat = ReportFormat.fromElement({active: '0'});
      const reportFormat2 = ReportFormat.fromElement({active: '1'});

      expect(reportFormat.isActive()).toBe(false);
      expect(reportFormat2.isActive()).toBe(true);
    });

    test('isTrusted() returns correct true/false', () => {
      const elem = {
        trust: {
          __text: 'no',
        },
      };
      const elem2 = {
        trust: {
          __text: 'yes',
        },
      };
      const reportFormat = ReportFormat.fromElement(elem);
      const reportFormat2 = ReportFormat.fromElement(elem2);

      expect(reportFormat.isTrusted()).toBe(false);
      expect(reportFormat2.isTrusted()).toBe(true);
    });
  });
});
