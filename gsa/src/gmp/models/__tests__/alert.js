/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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

import Model from 'gmp/model';
import Alert from 'gmp/models/alert';
import {testModel} from 'gmp/models/testing';

testModel(Alert, 'alert');

describe('Alert Model tests', () => {

  test('should parse condition, event, and method', () => {
    const elem = {
      condition: {
        __text: 'text',
      },
      event: {
        __text: 'lorem',
        data: {
          __text: 'ipsum',
          name: 'dolor',
        },
      },
      method: {
        __text: 'foo',
        data: {
          __text: '42',
          name: 'bar',
        },
      },
    };
    const alert = new Alert(elem);

    expect(alert.condition).toEqual({
      data: {},
      type: 'text',
    });
    expect(alert.event).toEqual({
      data: {
        dolor: {value: 'ipsum'},
      },
      type: 'lorem',
    });
    expect(alert.method).toEqual({
      data: {
        bar: {value: '42'},
        report_formats: [],
      },
      type: 'foo',
    });
  });

  test('should parse data values', () => {
    const elem = {
      method: {
        __text: 'foo',
        data: {
          __text: '42',
          name: 'bar',
          foo: {
            _id: 'a1',
            lorem: 'ipsum',
          },
        },
      },
    };

    const alert = new Alert(elem);
    expect(alert.method).toEqual({
      data: {
        bar: {
          foo: {
            id: 'a1',
            lorem: 'ipsum',
          },
          value: '42',
        },
        report_formats: [],
      },
      type: 'foo',
    });
  });

  test('should return given filter as instance of filter model', () => {
    const elem = {filter: 'rows=1337'};
    const alert = new Alert(elem);

    expect(alert.filter).toEqual(new Model('rows=1337', 'filter'));
  });

  test('should return given tasks as array of instances of task model', () => {
    const elem = {
      tasks: {
        task: {},
      },
    };
    const alert = new Alert(elem);

    expect(alert.tasks).toEqual([new Model({}, 'task')]);
  });

  test('should return empty array if no tasks are given', () => {
    const alert = new Alert({});

    expect(alert.tasks).toEqual([]);
  });

  test('should parse report format ids', () => {
    const elem = {
      method: {
        data: {
          __text: '123, 456, 789',
          name: 'report_formats',
        },
      },
    };
    const alert = new Alert(elem);

    expect(alert.method.data.report_formats).toEqual(['123', '456', '789']);
  });

  test('should return empty array if no report format ids are given', () => {
    const alert = new Alert({});

    expect(alert.method.data.report_formats).toEqual([]);
  });

  test('isActive() should return correct true/false', () => {
    const alert1 = new Alert({active: '0'});
    const alert2 = new Alert({active: '1'});

    expect(alert1.isActive()).toBe(false);
    expect(alert2.isActive()).toBe(true);
  });
});

// vim: set ts=2 sw=2 tw=80:
