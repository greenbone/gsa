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
  });

  test('should parse empty element', () => {
    const task = ReportTask.fromElement();
    expect(task.target).toBeUndefined();
    expect(task.progress).toBeUndefined();
  });

  test('should parse id', () => {
    const task = ReportTask.fromElement({_id: 't1'});

    expect(task.id).toEqual('t1');
  });

  test('should be container task without target', () => {
    const task = ReportTask.fromElement();

    expect(task.isContainer()).toEqual(true);
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
});
