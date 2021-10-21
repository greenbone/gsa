/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import ReportTask from '../task';

describe('ReportTask tests', () => {
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
    expect(task.target.id).toEqual('t1');
    expect(task.isContainer()).toEqual(false);
  });

  test('should parse progress', () => {
    const task1 = ReportTask.fromElement({progress: {}});

    expect(task1.progress).toEqual(0);

    const task2 = ReportTask.fromElement({progress: {__text: '99'}});

    expect(task2.progress).toEqual(99);
  });
});
