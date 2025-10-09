/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ReportTask from 'gmp/models/report/task';

describe('ReportTask tests', () => {
  test('should use defaults', () => {
    const task = new ReportTask();
    expect(task.target).toBeUndefined();
    expect(task.progress).toBeUndefined();
    expect(task.agentGroup).toBeUndefined();
  });

  test('should parse empty element', () => {
    const task = ReportTask.fromElement();
    expect(task.target).toBeUndefined();
    expect(task.progress).toBeUndefined();
    expect(task.agentGroup).toBeUndefined();
  });

  test('should parse id', () => {
    const task = ReportTask.fromElement({_id: 't1'});

    expect(task.id).toEqual('t1');
  });

  test('container vs target vs agentGroup precedence', () => {
    const t1 = ReportTask.fromElement({});
    expect(t1.isContainer()).toBe(true);

    const t2 = ReportTask.fromElement({target: {_id: 'tgt1'}});
    expect(t2.isContainer()).toBe(false);

    const t3 = ReportTask.fromElement({agent_group: {_id: 'ag1'}});
    expect(t3.isContainer()).toBe(false);

    const t4 = ReportTask.fromElement({
      target: {_id: 'tgt1'},
      agent_group: {_id: 'ag1'},
    });
    expect(t4.isContainer()).toBe(false);
  });

  test('should parse target', () => {
    const task = ReportTask.fromElement({
      target: {
        _id: 't1',
      },
    });

    expect(task.target).toBeDefined();
    expect(task.target?.id).toEqual('t1');
    expect(task.isContainer()).toEqual(false);
  });

  test('should parse progress', () => {
    const task1 = ReportTask.fromElement({progress: {}});
    expect(task1.progress).toEqual(0);

    const task2 = ReportTask.fromElement({progress: {__text: '99'}});
    expect(task2.progress).toEqual(99);

    const task3 = ReportTask.fromElement({progress: '100'});
    expect(task3.progress).toEqual(100);

    const task4 = ReportTask.fromElement({progress: 25});
    expect(task4.progress).toEqual(25);
  });

  test('should parse agent group', () => {
    const task = ReportTask.fromElement({
      _id: 't1',
      agent_group: {_id: 'ag1'},
    });

    expect(task.id).toEqual('t1');
    expect(task.agentGroup).toBeDefined();
    expect(task.agentGroup?.id).toEqual('ag1');
    expect(task.agentGroup?.entityType).toEqual('agentgroup');
    expect(task.isContainer()).toEqual(false);
  });

  test('should still parse progress with agentGroup present', () => {
    const t = ReportTask.fromElement({
      progress: {__text: '42'},
      agent_group: {_id: 'ag1'},
    });
    expect(t.progress).toEqual(42);
    expect(t.agentGroup?.id).toEqual('ag1');
  });
});
