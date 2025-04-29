/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Task, {TASK_STATUS} from 'gmp/models/task';
import Table from 'web/pages/tasks/Table';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith, fireEvent, screen} from 'web/utils/Testing';

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
    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();
    const handleToggleDetailsClick = testing.fn();

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
        entities={[task, task2, task3]}
        entitiesCounts={counts}
        filter={filter}
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
    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();
    const handleToggleDetailsClick = testing.fn();

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

    const {element} = render(
      <Table
        entities={[task, task2, task3]}
        entitiesCounts={counts}
        filter={filter}
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

    const unfoldIcon = screen.getByTestId('fold-state-icon-unfold');
    fireEvent.click(unfoldIcon);
    expect(element).toHaveTextContent('target1');
    expect(element).toHaveTextContent('target2');
  });

  test('should call click handlers', () => {
    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();
    const handleToggleDetailsClick = testing.fn();

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

    render(
      <Table
        entities={[task, task2, task3]}
        entitiesCounts={counts}
        filter={filter}
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

    const startIcon = screen.getAllByTestId('start-icon')[0];
    expect(startIcon).toHaveAttribute('title', 'Start');
    fireEvent.click(startIcon);
    expect(handleTaskStart).toHaveBeenCalledWith(task);

    const resumeIcon = screen.getAllByTestId('resume-icon')[0];
    expect(resumeIcon).toHaveAttribute('title', 'Task is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).not.toHaveBeenCalled();

    const deleteIcon = screen.getAllByTestId('trashcan-icon')[0];
    expect(deleteIcon).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);

    const editIcon = screen.getAllByTestId('edit-icon')[0];
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);

    const cloneIcon = screen.getAllByTestId('clone-icon')[0];
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const exportIcon = screen.getAllByTestId('export-icon')[0];
    expect(exportIcon).toHaveAttribute('title', 'Export Task');
    fireEvent.click(exportIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
  });
});
