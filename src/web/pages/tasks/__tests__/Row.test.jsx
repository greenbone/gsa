/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTable, fireEvent, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';
import Task, {TASK_STATUS} from 'gmp/models/task';
import Row from 'web/pages/tasks/Row';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-07-10T12:51:27Z',
    severity: '5.0',
  },
};

const currentReport = {
  report: {
    _id: '5678',
    timestamp: '2019-07-10T12:51:27Z',
  },
};

describe('Task Row tests', () => {
  test('should render', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '0',
      report_count: {__text: '3', finished: '3'},
      last_report: lastReport,
      trend: 'up',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: '5678', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement} = render(
      <Row
        entity={task}
        links={true}
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

    // Name
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('(bar)');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.done);
    expect(bars[0]).toHaveTextContent(TASK_STATUS.done);

    const detailsLinks = screen.getAllByTestId('details-link');
    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('3');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks[1]).toHaveTextContent(
      'Wed, Jul 10, 2019 2:51 PM Central European Summer Time',
    );
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Severity
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Trend
    const trendIcon = screen.getByTestId('trend-icon');
    expect(trendIcon).toHaveAttribute('title', 'Severity increased');

    // Actions
    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Task is not stopped');
    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Task to trashcan');
    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    const downloadIcon = screen.getByTestId('export-icon');
    expect(downloadIcon).toHaveAttribute('title', 'Export Task');
  });

  test('should render icons for task on sensor', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '1',
      report_count: {__text: '1', finished: '1'},
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
      scanner: {
        _id: 'id',
        name: 'scanner',
        type: GREENBONE_SENSOR_SCANNER_TYPE,
      },
      observers: {
        __text: 'anon nymous',
        role: [{name: 'lorem'}],
        group: [{name: 'ipsum'}, {name: 'dolor'}],
      },
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    render(
      <Row
        entity={task}
        links={true}
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

    const alterableIcon = screen.getByTestId('alterable-icon');
    expect(alterableIcon).toHaveAttribute('title', 'Task is alterable');

    const sensorIcon = screen.getByTestId('sensor-icon');
    expect(sensorIcon).toHaveAttribute(
      'title',
      'Task is configured to run on sensor scanner',
    );

    const observerIcon = screen.getByTestId('provide-view-icon');
    expect(observerIcon).toHaveAttribute(
      'title',
      'Task made visible for:\nUsers anon, nymous\nRoles lorem\nGroups ipsum, dolor',
    );
  });

  test('should call click handlers for new task', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.new,
      report_count: {__text: '0', finished: '0'},
      alterable: '0',
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    render(
      <Row
        entity={task}
        links={true}
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

    const rowDetails = screen.getByTestId('row-details-toggle');
    fireEvent.click(rowDetails);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.new);
    expect(bars[0]).toHaveTextContent(TASK_STATUS.new);

    const detailsLinks = screen.queryAllByTestId('details-link');
    expect(detailsLinks.length).toBe(0);
    // because there are no reports yet

    // Actions
    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    fireEvent.click(startIcon);
    expect(handleTaskStart).toHaveBeenCalledWith(task);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Task is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const downloadIcon = screen.getByTestId('export-icon');
    expect(downloadIcon).toHaveAttribute('title', 'Export Task');
    fireEvent.click(downloadIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
  });

  test('should call click handlers for running task', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      in_use: true,
      status: TASK_STATUS.running,
      alterable: '0',
      report_count: {__text: '1', finished: '0'},
      current_report: currentReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement} = render(
      <Row
        entity={task}
        links={true}
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

    const rowDetails = screen.getByTestId('row-details-toggle');
    fireEvent.click(rowDetails);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.running);
    expect(bars[0]).toHaveTextContent('0 %');

    const detailsLinks = screen.getAllByTestId('details-link');
    expect(detailsLinks[0]).toHaveTextContent('0 %');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/5678');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('1');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks.length).toBe(1);
    // because there is no last report yet

    // Severity
    expect(bars.length).toBe(1);
    // because there is no severity bar yet

    // Actions
    const stopIcon = screen.getByTestId('stop-icon');
    expect(stopIcon).toHaveAttribute('title', 'Stop');
    expect(handleTaskStart).not.toHaveBeenCalled();

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Task is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Task is still in use');
    expect(handleTaskDelete).not.toHaveBeenCalled();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const downloadIcon = screen.getByTestId('export-icon');
    expect(downloadIcon).toHaveAttribute('title', 'Export Task');
    fireEvent.click(downloadIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
  });

  test('should call click handlers for stopped task', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.stopped,
      alterable: '0',
      report_count: {__text: '2', finished: '1'},
      current_report: currentReport,
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement} = render(
      <Row
        entity={task}
        links={true}
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

    const rowDetails = screen.getByTestId('row-details-toggle');
    fireEvent.click(rowDetails);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.stopped);
    expect(bars[0]).toHaveTextContent(TASK_STATUS.stopped);

    const detailsLinks = screen.getAllByTestId('details-link');
    expect(detailsLinks[0]).toHaveTextContent('Stopped');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/5678');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('2');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks[1]).toHaveTextContent(
      'Wed, Jul 10, 2019 2:51 PM Central European Summer Time',
    );
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Severity
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Actions
    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    fireEvent.click(startIcon);
    expect(handleTaskStart).toHaveBeenCalledWith(task);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Resume');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).toHaveBeenCalledWith(task);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const downloadIcon = screen.getByTestId('export-icon');
    expect(downloadIcon).toHaveAttribute('title', 'Export Task');
    fireEvent.click(downloadIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
  });

  test('should call click handlers for finished task', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '0',
      report_count: {__text: '1', finished: '1'},
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement} = render(
      <Row
        entity={task}
        links={true}
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

    const rowDetails = screen.getByTestId('row-details-toggle');
    fireEvent.click(rowDetails);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.done);
    expect(bars[0]).toHaveTextContent(TASK_STATUS.done);

    const detailsLinks = screen.getAllByTestId('details-link');
    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('1');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks[1]).toHaveTextContent(
      'Wed, Jul 10, 2019 2:51 PM Central European Summer Time',
    );
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Severity
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Actions
    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    fireEvent.click(startIcon);
    expect(handleTaskStart).toHaveBeenCalledWith(task);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Task is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const downloadIcon = screen.getByTestId('export-icon');
    expect(downloadIcon).toHaveAttribute('title', 'Export Task');
    fireEvent.click(downloadIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
  });

  test('should not call click handlers for task without permission', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'user'},
      name: 'foo',
      comment: 'bar',
      status: TASK_STATUS.done,
      alterable: '0',
      report_count: {__text: '1', finished: '1'},
      last_report: lastReport,
      permissions: {permission: [{name: 'get_tasks'}]},
      target: {_id: 'id', name: 'target'},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement} = render(
      <Row
        entity={task}
        links={true}
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

    // Name
    const rowDetails = screen.getByTestId('row-details-toggle');
    fireEvent.click(rowDetails);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    const observerIcon = screen.getByTestId('observer-icon');
    expect(observerIcon).toHaveAttribute('title', 'Task owned by user');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', TASK_STATUS.done);
    expect(bars[0]).toHaveTextContent(TASK_STATUS.done);

    const detailsLinks = screen.getAllByTestId('details-link');
    expect(detailsLinks[0]).toHaveTextContent('Done');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('1');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks[1]).toHaveTextContent(
      'Wed, Jul 10, 2019 2:51 PM Central European Summer Time',
    );
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Severity
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Actions
    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute(
      'title',
      'Permission to start task denied',
    );
    fireEvent.click(startIcon);
    expect(handleTaskStart).not.toHaveBeenCalled();

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Task is not stopped');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute(
      'title',
      'Permission to move Task to trashcan denied',
    );
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).not.toHaveBeenCalled();

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Permission to edit Task denied');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).not.toHaveBeenCalled();

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const downloadIcon = screen.getByTestId('export-icon');
    expect(downloadIcon).toHaveAttribute('title', 'Export Task');
    fireEvent.click(downloadIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
  });

  test('should call click handlers for container task', () => {
    const task = Task.fromElement({
      _id: '314',
      owner: {name: 'username'},
      name: 'foo',
      comment: 'bar',
      report_count: {__text: '1', finished: '1'},
      last_report: lastReport,
      permissions: {permission: [{name: 'everything'}]},
    });

    const handleReportImport = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();
    const handleToggleDetailsClick = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement} = render(
      <Row
        entity={task}
        links={true}
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

    const rowDetails = screen.getByTestId('row-details-toggle');
    fireEvent.click(rowDetails);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '314');

    // Status
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'Container');
    expect(bars[0]).toHaveTextContent('Container');

    const detailsLinks = screen.getAllByTestId('details-link');
    expect(detailsLinks[0]).toHaveTextContent('Container');
    expect(detailsLinks[0]).toHaveAttribute('href', '/report/1234');

    // Reports
    const links = baseElement.querySelectorAll('a');
    expect(links[1]).toHaveTextContent('1');
    expect(links[1]).toHaveAttribute(
      'title',
      'View list of all reports for Task foo, including unfinished ones',
    );
    expect(links[1]).toHaveAttribute(
      'href',
      '/reports?filter=task_id%3D314%20sort-reverse%3Ddate',
    );

    // Last Report
    expect(detailsLinks[1]).toHaveTextContent(
      'Wed, Jul 10, 2019 2:51 PM Central European Summer Time',
    );
    expect(detailsLinks[1]).toHaveAttribute('href', '/report/1234');

    // Severity
    expect(bars.length).toBe(1);
    // because container tasks do not have a severity

    // Actions
    const importIcon = screen.getByTestId('import-icon');
    expect(importIcon).toHaveAttribute('title', 'Import Report');
    fireEvent.click(importIcon);
    expect(handleReportImport).toHaveBeenCalledWith(task);
    expect(handleTaskStart).not.toHaveBeenCalled();

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Task is a container');
    fireEvent.click(resumeIcon);
    expect(handleTaskResume).not.toHaveBeenCalled();

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(deleteIcon);
    expect(handleTaskDelete).toHaveBeenCalledWith(task);

    const editIcon = screen.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    fireEvent.click(editIcon);
    expect(handleTaskEdit).toHaveBeenCalledWith(task);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(handleTaskClone).toHaveBeenCalledWith(task);

    const downloadIcon = screen.getByTestId('export-icon');
    expect(downloadIcon).toHaveAttribute('title', 'Export Task');
    fireEvent.click(downloadIcon);
    expect(handleTaskDownload).toHaveBeenCalledWith(task);
  });
});
