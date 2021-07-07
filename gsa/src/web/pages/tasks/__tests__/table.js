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
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';
import Task, {TASK_STATUS} from 'gmp/models/task';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Table from '../table';

setLocale('en');

const caps = new Capabilities(['everything']);

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-08-10T12:51:27Z',
    severity: '5.0',
  },
};

const lastReport2 = {
  report: {
    _id: '1234',
    timestamp: '2019-07-10T12:51:27Z',
    severity: '10.0',
  },
};

const currentReport = {
  report: {
    _id: '5678',
    timestamp: '2019-07-10T12:51:27Z',
  },
};

const task = Task.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  status: TASK_STATUS.done,
  alterable: '0',
  report_count: {__text: '1', finished: '1'},
  last_report: lastReport,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id1', name: 'target1'},
});

const task2 = Task.fromElement({
  _id: '12345',
  owner: {name: 'user'},
  name: 'lorem',
  comment: 'ipsum',
  status: TASK_STATUS.new,
  alterable: '0',
  report_count: {__text: '0', finished: '0'},
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id2', name: 'target2'},
});

const task3 = Task.fromElement({
  _id: '123456',
  owner: {name: 'user'},
  name: 'hello',
  comment: 'world',
  status: TASK_STATUS.running,
  alterable: '0',
  current_report: currentReport,
  last_report: lastReport2,
  report_count: {__text: '2', finished: '1'},
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id2', name: 'target2'},
});

const counts = new CollectionCounts({
  first: 1,
  all: 1,
  filtered: 1,
  length: 1,
  rows: 2,
});

const filter = Filter.fromString('rows=2');

describe('Tasks table tests', () => {
  test('should render', () => {
    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Table
        filter={filter}
        entities={[task, task2, task3]}
        entitiesCounts={counts}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    const header = baseElement.querySelectorAll('th');
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Status');
    expect(header[2]).toHaveTextContent('Reports');
    expect(header[3]).toHaveTextContent('Last Report');
    expect(header[4]).toHaveTextContent('Severity');
    expect(header[5]).toHaveTextContent('Trend');
    expect(header[6]).toHaveTextContent('Actions');
  });

  test('should unfold all details', () => {
    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {element, getAllByTestId} = render(
      <Table
        filter={filter}
        entities={[task, task2, task3]}
        entitiesCounts={counts}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(element).not.toHaveTextContent('target1');
    expect(element).not.toHaveTextContent('target2');

    const icons = getAllByTestId('svg-icon');
    fireEvent.click(icons[0]);
    expect(icons[0]).toHaveAttribute('title', 'Unfold all details');
    expect(element).toHaveTextContent('target1');
    expect(element).toHaveTextContent('target2');
  });

  test('should call click handlers', () => {
    const handleReportImport = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {getAllByTestId} = render(
      <Table
        filter={filter}
        entities={[task, task2, task3]}
        entitiesCounts={counts}
        onReportImportClick={handleReportImport}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[5]);
    expect(handleTaskStart).toHaveBeenCalledWith(task);
    expect(icons[5]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[6]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[6]).toHaveAttribute('title', 'Task is not stopped');

    fireEvent.click(icons[7]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);
    expect(icons[7]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[8]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);
    expect(icons[8]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[9]);
    expect(handleTaskClone).toHaveBeenCalledWith(task);
    expect(icons[9]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[10]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
    expect(icons[10]).toHaveAttribute('title', 'Export Task');
  });
});
