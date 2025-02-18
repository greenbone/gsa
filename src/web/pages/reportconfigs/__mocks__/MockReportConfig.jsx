/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const mockReportConfig = {
  _id: '12345',
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  owner: {name: 'admin'},
  writable: '1',
  in_use: '0',
  report_format: {
    _id: '123456',
    name: 'example-configurable-1',
  },
  param: [
    {
      name: 'StringParam',
      value: {
        __text: 'StringValue',
        _using_default: '1',
      },
      default: 'StringValue',
      type: {
        __text: 'string',
        min: '0',
        max: '100',
      },
    },
    {
      name: 'TextParam',
      value: {
        __text: 'TextValue',
        _using_default: '0',
      },
      default: 'TextDefault',
      type: {
        __text: 'text',
        min: '0',
        max: '1000',
      },
    },
    {
      name: 'IntegerParam',
      value: {
        __text: '12',
        _using_default: '1',
      },
      default: '12',
      type: {
        __text: 'integer',
        min: 0,
        max: 50,
      },
    },
    {
      name: 'BooleanParam',
      value: {
        __text: '1',
        _using_default: '0',
      },
      default: '0',
      type: {
        __text: 'boolean',
        min: 0,
        max: 1,
      },
    },
    {
      name: 'SelectionParam',
      value: {
        __text: 'OptionB',
        _using_default: '0',
      },
      default: 'OptionA',
      options: {
        option: ['OptionA', 'OptionB', 'OptionC'],
      },
      type: {
        __text: 'selection',
        min: 0,
        max: 1,
      },
    },
    {
      name: 'ReportFormatListParam',
      value: {
        __text: '654321,7654321',
        report_format: [
          {
            _id: '654321',
            name: 'non-configurable-1',
          },
          {
            _id: '7654321',
            name: 'non-configurable-2',
          },
        ],
        _using_default: '0',
      },
      default: {
        __text: '7654321,1234567',
        report_format: [
          {
            _id: '7654321',
            name: 'non-configurable-2',
          },
          {
            _id: '1234567',
            name: 'example-configurable-2',
          },
        ],
      },
      type: {
        __text: 'report_format_list',
        min: 0,
        max: 1,
      },
    },
  ],
  alerts: {
    alert: [
      {
        _id: '321',
        name: 'ABC',
      },
      {
        _id: '789',
        name: 'XYZ',
      },
    ],
  },
};
