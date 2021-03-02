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

import Model from 'gmp/model';
import Alert, {
  EVENT_TYPE_TASK_RUN_STATUS_CHANGED,
  EVENT_TYPE_ASSIGNED_TICKET_CHANGED,
  EVENT_TYPE_OWNED_TICKET_CHANGED,
  EVENT_TYPE_TICKET_RECEIVED,
  EVENT_TYPE_NEW_SECINFO,
  EVENT_TYPE_UPDATED_SECINFO,
  isSecinfoEvent,
  isTaskEvent,
  isTicketEvent,
} from 'gmp/models/alert';
import {testModel} from 'gmp/models/testing';

testModel(Alert, 'alert', {testIsActive: false});

describe('Alert Model parseObject tests', () => {
  test('should parse condition, event, and method', () => {
    const obj = {
      condition: {
        type: 'text',
      },
      event: {
        type: 'lorem',
        data: {
          value: 'ipsum',
          name: 'dolor',
        },
      },
      method: {
        type: 'foo',
        data: {
          value: '42',
          name: 'bar',
        },
      },
    };
    const alert = Alert.fromObject(obj);

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

  // event/condition/method data will not have subvalues from hyperion, therefore this test is removed.

  test('should return given filter as instance of filter model', () => {
    const obj = {filter: {id: '1', name: 'foo', trash: 0}};
    const alert = Alert.fromObject(obj);

    expect(alert.filter).toBeInstanceOf(Model);
    expect(alert.filter.entityType).toEqual('filter');
    expect(alert.filter.id).toEqual('1');
    expect(alert.filter.name).toEqual('foo');
    expect(alert.filter.trash).toEqual(0);
  });

  test('should return given tasks as array of instances of task model', () => {
    const obj = {
      tasks: [{id: 't1'}],
    };
    const alert = Alert.fromObject(obj);

    expect(alert.tasks.length).toEqual(1);

    const [task] = alert.tasks;
    expect(task).toBeInstanceOf(Model);
    expect(task.entityType).toEqual('task');
    expect(task.id).toEqual('t1');
  });

  test('should return empty array if no tasks are given', () => {
    const alert = Alert.fromObject({});

    expect(alert.tasks).toEqual([]);
  });

  test('should parse report format ids', () => {
    const obj = {
      method: {
        data: {
          value: '123, 456, 789',
          name: 'report_formats',
        },
      },
    };
    const alert = Alert.fromObject(obj);

    expect(alert.method.data.report_formats).toEqual(['123', '456', '789']);
  });

  test('should return empty array if no report format ids are given', () => {
    const alert = Alert.fromObject({
      method: {
        data: {
          value: 'bar',
          name: 'foo',
        },
      },
    });

    expect(alert.method.data.report_formats).toEqual([]);
  });

  // notice is already string from Hyperion

  test('isActive() should return correct true/false', () => {
    const alert1 = Alert.fromObject({active: '0'});
    const alert2 = Alert.fromObject({active: '1'});

    expect(alert1.isActive()).toBe(false);
    expect(alert2.isActive()).toBe(true);
  });
});

describe('Alert Model parseElement tests', () => {
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
    const alert = Alert.fromElement(elem);

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

    const alert = Alert.fromElement(elem);
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
    const alert = Alert.fromElement(elem);

    expect(alert.filter).toBeInstanceOf(Model);
    expect(alert.filter.entityType).toEqual('filter');
  });

  test('should return given tasks as array of instances of task model', () => {
    const elem = {
      tasks: {
        task: {_id: 't1'},
      },
    };
    const alert = Alert.fromElement(elem);

    expect(alert.tasks.length).toEqual(1);

    const [task] = alert.tasks;
    expect(task).toBeInstanceOf(Model);
    expect(task.entityType).toEqual('task');
    expect(task.id).toEqual('t1');
  });

  test('should return empty array if no tasks are given', () => {
    const alert = Alert.fromElement({});

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
    const alert = Alert.fromElement(elem);

    expect(alert.method.data.report_formats).toEqual(['123', '456', '789']);
  });

  test('should return empty array if no report format ids are given', () => {
    const alert = Alert.fromElement({});

    expect(alert.method.data.report_formats).toEqual([]);
  });

  test('should parse notice as String', () => {
    const elem = {
      method: {
        data: {
          __text: 1,
          name: 'notice',
        },
      },
    };
    const alert = Alert.fromElement(elem);

    expect(alert.method.data.notice.value).toEqual('1');
  });

  test('isActive() should return correct true/false', () => {
    const alert1 = Alert.fromElement({active: '0'});
    const alert2 = Alert.fromElement({active: '1'});

    expect(alert1.isActive()).toBe(false);
    expect(alert2.isActive()).toBe(true);
  });
});

describe('isTaskEvent tests', () => {
  test('should consider only task events', () => {
    expect(isTaskEvent()).toEqual(false);
    expect(isTaskEvent(EVENT_TYPE_TASK_RUN_STATUS_CHANGED)).toEqual(true);
    expect(isTaskEvent(EVENT_TYPE_ASSIGNED_TICKET_CHANGED)).toEqual(false);
    expect(isTaskEvent(EVENT_TYPE_OWNED_TICKET_CHANGED)).toEqual(false);
    expect(isTaskEvent(EVENT_TYPE_TICKET_RECEIVED)).toEqual(false);
    expect(isTaskEvent(EVENT_TYPE_NEW_SECINFO)).toEqual(false);
    expect(isTaskEvent(EVENT_TYPE_UPDATED_SECINFO)).toEqual(false);
  });
});

describe('isSecinfoEvent tests', () => {
  test('should consider only secinfo events', () => {
    expect(isSecinfoEvent()).toEqual(false);
    expect(isSecinfoEvent(EVENT_TYPE_TASK_RUN_STATUS_CHANGED)).toEqual(false);
    expect(isSecinfoEvent(EVENT_TYPE_ASSIGNED_TICKET_CHANGED)).toEqual(false);
    expect(isSecinfoEvent(EVENT_TYPE_OWNED_TICKET_CHANGED)).toEqual(false);
    expect(isSecinfoEvent(EVENT_TYPE_TICKET_RECEIVED)).toEqual(false);
    expect(isSecinfoEvent(EVENT_TYPE_NEW_SECINFO)).toEqual(true);
    expect(isSecinfoEvent(EVENT_TYPE_UPDATED_SECINFO)).toEqual(true);
  });
});

describe('isTicketEvent tests', () => {
  test('should consider only ticket events', () => {
    expect(isTicketEvent()).toEqual(false);
    expect(isTicketEvent(EVENT_TYPE_TASK_RUN_STATUS_CHANGED)).toEqual(false);
    expect(isTicketEvent(EVENT_TYPE_ASSIGNED_TICKET_CHANGED)).toEqual(true);
    expect(isTicketEvent(EVENT_TYPE_OWNED_TICKET_CHANGED)).toEqual(true);
    expect(isTicketEvent(EVENT_TYPE_TICKET_RECEIVED)).toEqual(true);
    expect(isTicketEvent(EVENT_TYPE_NEW_SECINFO)).toEqual(false);
    expect(isTicketEvent(EVENT_TYPE_UPDATED_SECINFO)).toEqual(false);
  });
});

// vim: set ts=2 sw=2 tw=80:
