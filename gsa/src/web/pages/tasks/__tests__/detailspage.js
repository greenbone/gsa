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

import {setLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import {createGetNotesQueryMock} from 'web/graphql/__mocks__/notes';
import {createGetOverridesQueryMock} from 'web/graphql/__mocks__/overrides';
import {createGetScanConfigQueryMock} from 'web/graphql/__mocks__/scanconfigs';
import {createGetScheduleQueryMock} from 'web/graphql/__mocks__/schedules';
import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';
import {
  createGetPermissionsQueryMock,
  noPermissions,
} from 'web/graphql/__mocks__/permissions';
import {
  createGetTaskQueryMock,
  createCloneTaskQueryMock,
  createDeleteTaskQueryMock,
} from 'web/graphql/__mocks__/tasks';

import {
  detailsScanConfig,
  getMockTasks,
} from 'web/pages/tasks/__mocks__/mocktasks';
import {entityLoadingActions} from 'web/store/entities/tasks';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

setLocale('en');

const caps = new Capabilities(['everything']);

const reloadInterval = null; // do not reload by default
const manualUrl = 'test/';

// create mock task
const {detailsMockTask: task} = getMockTasks(); // mock task

let currentSettings;
let renewSession;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    id: '12345',
  }),
}));

beforeEach(() => {
  if (!isDefined(window.URL)) {
    window.URL = {};
  }
  window.URL.createObjectURL = jest.fn();

  // mock gmp commands
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Task Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const gmp = {
      settings: {
        manualUrl,
        reloadInterval,
      },
      user: {
        currentSettings,
      },
    };

    const id = '12345';
    const [mock, resultFunc] = createGetTaskQueryMock(id);
    const [notesMock, notesResultFunc] = createGetNotesQueryMock({
      filterString: 'task_id:12345',
    });
    const [overridesMock, overridesResultFunc] = createGetOverridesQueryMock({
      filterString: 'task_id:12345',
    });
    const [scheduleMock, scheduleResultFunc] = createGetScheduleQueryMock(
      'foo',
    );

    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=12345 first=1 rows=-1',
    });
    const [scanConfigMock, scanConfigResult] = createGetScanConfigQueryMock(
      '314',
      detailsScanConfig,
    );

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        notesMock,
        overridesMock,
        scheduleMock,
        permissionMock,
        scanConfigMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(scheduleResultFunc).toHaveBeenCalled();
    expect(notesResultFunc).toHaveBeenCalled();
    expect(overridesResultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();
    expect(scanConfigResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('Task: foo');

    // get different types of dom elements
    const detailslinks = screen.getAllByTestId('details-link');
    const headings = baseElement.querySelectorAll('h2');
    const icons = screen.getAllByTestId('svg-icon');
    const links = screen.getAllByRole('link');
    const progressBars = screen.getAllByTestId('progressbar-box');
    const tabs = screen.getAllByTestId('entities-tab-title');

    // test icon bar
    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );

    expect(icons[1]).toHaveAttribute('title', 'Task List');
    expect(links[1]).toHaveAttribute('href', '/tasks');

    // test entity info bar
    expect(headings[0]).toHaveTextContent('Task: foo');
    expect(baseElement).toHaveTextContent('12345');
    expect(baseElement).toHaveTextContent('Tue, Jul 30, 2019 3:00 PM CEST');
    expect(baseElement).toHaveTextContent('Fri, Aug 30, 2019 3:23 PM CEST');
    expect(baseElement).toHaveTextContent('admin');

    // test tabs
    expect(tabs[0]).toHaveTextContent('User Tags');
    expect(tabs[1]).toHaveTextContent('Permissions');

    // details
    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('bar');

    expect(progressBars[0]).toHaveAttribute('title', 'Stopped');
    expect(progressBars[0]).toHaveTextContent('Stopped');
    expect(detailslinks[2]).toHaveAttribute('href', '/report/5678');

    expect(headings[1]).toHaveTextContent('Target');
    expect(detailslinks[3]).toHaveAttribute('href', '/target/159');
    expect(baseElement).toHaveTextContent('target 1');

    expect(headings[2]).toHaveTextContent('Alerts');
    expect(detailslinks[4]).toHaveAttribute('href', '/alert/151617');
    expect(baseElement).toHaveTextContent('alert 1');

    expect(headings[3]).toHaveTextContent('Scanner');
    expect(detailslinks[5]).toHaveAttribute('href', '/scanner/212223');
    expect(baseElement).toHaveTextContent('scanner 1');
    expect(baseElement).toHaveTextContent('OpenVAS Scanner');
    expect(detailslinks[6]).toHaveAttribute('href', '/scanconfig/314');
    expect(baseElement).toHaveTextContent(
      'Maximum concurrently executed NVTs per host4',
    );
    expect(baseElement).toHaveTextContent(
      'Maximum concurrently scanned hosts20',
    );

    expect(headings[4]).toHaveTextContent('Assets');
    expect(baseElement).toHaveTextContent('Add to AssetsYes');
    expect(baseElement).toHaveTextContent('Apply OverridesYes');
    expect(baseElement).toHaveTextContent('Min QoD70 %');

    expect(headings[5]).toHaveTextContent('Schedule');
    expect(detailslinks[7]).toHaveAttribute('href', '/schedule/foo');
    expect(baseElement).toHaveTextContent('schedule 1');

    expect(headings[6]).toHaveTextContent('Scan');
    expect(baseElement).toHaveTextContent('2 minutes');
    expect(baseElement).toHaveTextContent(
      'Automatically delete oldest reports but always keep newest 5 reports',
    );
  });

  test('should render user tags tab', async () => {
    const gmp = {
      settings: {
        manualUrl,
        reloadInterval,
      },
      user: {
        currentSettings,
        renewSession,
      },
    };

    const id = '12345';
    const [mock, resultFunc] = createGetTaskQueryMock(id);
    const [notesMock, notesResultFunc] = createGetNotesQueryMock({
      filterString: 'task_id:12345',
    });
    const [overridesMock, overridesResultFunc] = createGetOverridesQueryMock({
      filterString: 'task_id:12345',
    });
    const [scheduleMock, scheduleResultFunc] = createGetScheduleQueryMock(
      'foo',
    );

    const [permissionMock, permissionResult] = createGetPermissionsQueryMock({
      filterString: 'resource_uuid=12345 first=1 rows=-1',
    });

    const [
      renewSessionQueryMock,
      renewSessionQueryResult,
    ] = createRenewSessionQueryMock();
    const [scanConfigMock, scanConfigResult] = createGetScanConfigQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        notesMock,
        overridesMock,
        scheduleMock,
        permissionMock,
        renewSessionQueryMock,
        scanConfigMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    store.dispatch(entityLoadingActions.success('12345', task));

    const {baseElement} = render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(scheduleResultFunc).toHaveBeenCalled();
    expect(notesResultFunc).toHaveBeenCalled();
    expect(overridesResultFunc).toHaveBeenCalled();
    expect(permissionResult).toHaveBeenCalled();
    expect(scanConfigResult).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[0]).toHaveTextContent('User Tags');
    fireEvent.click(tabs[0]);

    await wait();

    expect(renewSessionQueryResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', async () => {
    const gmp = {
      settings: {
        manualUrl,
        reloadInterval,
      },
      user: {
        currentSettings,
        renewSession,
      },
    };

    const id = '12345';
    const [mock, resultFunc] = createGetTaskQueryMock(id);
    const [notesMock, notesResultFunc] = createGetNotesQueryMock({
      filterString: 'task_id:12345',
    });
    const [overridesMock, overridesResultFunc] = createGetOverridesQueryMock({
      filterString: 'task_id:12345',
    });
    const [scheduleMock, scheduleResultFunc] = createGetScheduleQueryMock(
      'foo',
    );

    const [permissionMock, permissionResult] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=12345 first=1 rows=-1',
      },
      noPermissions,
    );
    const [
      renewSessionQueryMock,
      renewSessionQueryResult,
    ] = createRenewSessionQueryMock();
    const [scanConfigMock, scanConfigResult] = createGetScanConfigQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        mock,
        renewSessionQueryMock,
        notesMock,
        overridesMock,
        scheduleMock,
        permissionMock,
        scanConfigMock,
      ],
    });

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<Detailspage id="12345" />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(scheduleResultFunc).toHaveBeenCalled();
    expect(notesResultFunc).toHaveBeenCalled();
    expect(overridesResultFunc).toHaveBeenCalled();
    expect(scanConfigResult).toHaveBeenCalled();

    const tabs = screen.getAllByTestId('entities-tab-title');

    expect(tabs[1]).toHaveTextContent('Permissions');
    fireEvent.click(tabs[1]);

    await wait();
    expect(permissionResult).toHaveBeenCalled();
    expect(renewSessionQueryResult).toHaveBeenCalled();

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call mutations', async () => {
    const gmp = {
      settings: {
        manualUrl,
        reloadInterval,
      },
      user: {
        currentSettings,
        renewSession,
      },
    };

    const id = '12345';
    const [getTaskMock, getTaskResultFunc] = createGetTaskQueryMock(id);
    const [cloneTaskMock, cloneTaskResultFunc] = createCloneTaskQueryMock(id);
    const [deleteTaskMock, deleteTaskResultFunc] = createDeleteTaskQueryMock(
      id,
    );
    const [notesMock, notesResultFunc] = createGetNotesQueryMock({
      filterString: 'task_id:12345',
    });
    const [overridesMock, overridesResultFunc] = createGetOverridesQueryMock({
      filterString: 'task_id:12345',
    });
    const [scheduleMock, scheduleResultFunc] = createGetScheduleQueryMock(
      'foo',
    );
    const [permissionMock] = createGetPermissionsQueryMock(
      {
        filterString: 'resource_uuid=12345 first=1 rows=-1',
      },
      noPermissions,
    );
    const [scanConfigMock, scanConfigResult] = createGetScanConfigQueryMock();

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
      queryMocks: [
        getTaskMock,
        cloneTaskMock,
        deleteTaskMock,
        notesMock,
        overridesMock,
        scheduleMock,
        permissionMock,
        scanConfigMock,
      ],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', task));

    render(<Detailspage id="12345" />);

    await wait();

    expect(getTaskResultFunc).toHaveBeenCalled();
    expect(scheduleResultFunc).toHaveBeenCalled();
    expect(notesResultFunc).toHaveBeenCalled();
    expect(overridesResultFunc).toHaveBeenCalled();
    expect(scanConfigResult).toHaveBeenCalled();

    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[3]).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(icons[3]);
    expect(cloneTaskResultFunc).toHaveBeenCalled();

    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(icons[5]);
    expect(deleteTaskResultFunc).toHaveBeenCalled();
  });
});

describe('Task ToolBarIcons tests', () => {
  test('should render', () => {
    const {finishedTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    render(
      <ToolBarIcons
        entity={finishedTask}
        notes={[{_id: '2021'}, {_id: '2223'}]}
        overrides={[{_id: '2425'}, {_id: '2627'}, {_id: '2829'}]}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const links = screen.getAllByRole('link');

    expect(screen.getAllByTitle('Help: Tasks')[0]).toBeInTheDocument();
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );

    expect(screen.getAllByTitle('Task List')[0]).toBeInTheDocument();
    expect(links[1]).toHaveAttribute('href', '/tasks');
  });

  test('should call click handlers for new task', () => {
    const {newTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement} = render(
      <ToolBarIcons
        entity={newTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const links = screen.getAllByRole('link');
    const badgeIcons = screen.getAllByTestId('badge-icon');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    const cloneIcon = screen.getAllByTitle('Clone Task');
    fireEvent.click(cloneIcon[0]);
    expect(handleTaskClone).toHaveBeenCalledWith(newTask);

    const editIcon = screen.getAllByTitle('Edit Task');
    fireEvent.click(editIcon[0]);
    expect(handleTaskEdit).toHaveBeenCalledWith(newTask);

    const deleteIcon = screen.getAllByTitle('Move Task to trashcan');
    fireEvent.click(deleteIcon[0]);
    expect(handleTaskDelete).toHaveBeenCalledWith(newTask);

    const exportIcon = screen.getAllByTitle('Export Task as XML');
    fireEvent.click(exportIcon[0]);
    expect(handleTaskDownload).toHaveBeenCalledWith(newTask);

    const startIcon = screen.getAllByTitle('Start');
    expect(startIcon[0]).toBeInTheDocument();
    fireEvent.click(startIcon[0]);
    expect(handleTaskStart).toHaveBeenCalledWith(newTask);

    const resumeIcon = screen.getAllByTitle('Task is not stopped');
    fireEvent.click(resumeIcon[0]);
    expect(handleTaskResume).not.toHaveBeenCalled();

    expect(links[2]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[2]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('0');

    expect(links[3]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('0');

    expect(links[4]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[5]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[5]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('0');
  });

  test('should call click handlers for running task', () => {
    const {runningTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement} = render(
      <ToolBarIcons
        entity={runningTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const links = screen.getAllByRole('link');
    const badgeIcons = screen.getAllByTestId('badge-icon');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    const cloneIcon = screen.getAllByTitle('Clone Task');
    fireEvent.click(cloneIcon[0]);
    expect(handleTaskClone).toHaveBeenCalledWith(runningTask);

    const editIcon = screen.getAllByTitle('Edit Task');
    fireEvent.click(editIcon[0]);
    expect(handleTaskEdit).toHaveBeenCalledWith(runningTask);

    const deleteIcon = screen.getAllByTitle('Task is still in use');
    fireEvent.click(deleteIcon[0]);
    expect(handleTaskDelete).not.toHaveBeenCalled();

    const exportIcon = screen.getAllByTitle('Export Task as XML');
    fireEvent.click(exportIcon[0]);
    expect(handleTaskDownload).toHaveBeenCalledWith(runningTask);

    const stopIcon = screen.getAllByTitle('Stop');
    expect(stopIcon[0]).toBeInTheDocument();
    fireEvent.click(stopIcon[0]);
    expect(handleTaskStop).toHaveBeenCalledWith(runningTask);

    const resumeIcon = screen.getAllByTitle('Task is not stopped');
    fireEvent.click(resumeIcon[0]);
    expect(handleTaskResume).not.toHaveBeenCalled();

    expect(links[2]).toHaveAttribute('href', '/report/5678');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Task foo from 08/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('2');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('0');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('0');
  });

  test('should call click handlers for stopped task', () => {
    const {stoppedTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement} = render(
      <ToolBarIcons
        entity={stoppedTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const links = screen.getAllByRole('link');
    const badgeIcons = screen.getAllByTestId('badge-icon');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    const cloneIcon = screen.getAllByTitle('Clone Task');
    fireEvent.click(cloneIcon[0]);
    expect(handleTaskClone).toHaveBeenCalledWith(stoppedTask);

    const editIcon = screen.getAllByTitle('Edit Task');
    fireEvent.click(editIcon[0]);
    expect(handleTaskEdit).toHaveBeenCalledWith(stoppedTask);

    const deleteIcon = screen.getAllByTitle('Move Task to trashcan');
    fireEvent.click(deleteIcon[0]);
    expect(handleTaskDelete).toHaveBeenCalledWith(stoppedTask);

    const exportIcon = screen.getAllByTitle('Export Task as XML');
    fireEvent.click(exportIcon[0]);
    expect(handleTaskDownload).toHaveBeenCalledWith(stoppedTask);

    const startIcon = screen.getAllByTitle('Start');
    expect(startIcon[0]).toBeInTheDocument();
    fireEvent.click(startIcon[0]);
    expect(handleTaskStart).toHaveBeenCalledWith(stoppedTask);

    const resumeIcon = screen.getAllByTitle('Resume');
    fireEvent.click(resumeIcon[0]);
    expect(handleTaskResume).toHaveBeenCalledWith(stoppedTask);

    expect(links[2]).toHaveAttribute('href', '/report/5678');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Task foo from 08/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('2');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('10');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('0');
  });

  test('should call click handlers for finished task', () => {
    const {finishedTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement} = render(
      <ToolBarIcons
        entity={finishedTask}
        notes={[{_id: '2021'}, {_id: '2223'}]}
        overrides={[{_id: '2425'}, {_id: '2627'}, {_id: '2829'}]}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const links = screen.getAllByRole('link');
    const badgeIcons = screen.getAllByTestId('badge-icon');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    const editIcon = screen.getAllByTitle('Edit Task');
    fireEvent.click(editIcon[0]);
    expect(handleTaskEdit).toHaveBeenCalledWith(finishedTask);

    const deleteIcon = screen.getAllByTitle('Move Task to trashcan');
    fireEvent.click(deleteIcon[0]);
    expect(handleTaskDelete).toHaveBeenCalledWith(finishedTask);

    const exportIcon = screen.getAllByTitle('Export Task as XML');
    fireEvent.click(exportIcon[0]);
    expect(handleTaskDownload).toHaveBeenCalledWith(finishedTask);

    const startIcon = screen.getAllByTitle('Start');
    expect(startIcon[0]).toBeInTheDocument();
    fireEvent.click(startIcon[0]);
    expect(handleTaskStart).toHaveBeenCalledWith(finishedTask);

    const resumeIcon = screen.getAllByTitle('Task is not stopped');
    fireEvent.click(resumeIcon[0]);
    expect(handleTaskResume).not.toHaveBeenCalled();

    expect(links[2]).toHaveAttribute('href', '/report/1234');
    expect(links[2]).toHaveAttribute(
      'title',
      'Last Report for Task foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('0');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('2');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('3');
  });

  test('should not call click handlers without permission', () => {
    const {observedTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement} = render(
      <ToolBarIcons
        entity={observedTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const links = screen.getAllByRole('link');
    const badgeIcons = screen.getAllByTestId('badge-icon');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    const cloneIcon = screen.getAllByTitle('Clone Task');
    fireEvent.click(cloneIcon[0]);
    expect(handleTaskClone).toHaveBeenCalledWith(observedTask);

    const editIcon = screen.getAllByTitle('Permission to edit Task denied');
    fireEvent.click(editIcon[0]);
    expect(handleTaskEdit).not.toHaveBeenCalled();

    const deleteIcon = screen.getAllByTitle(
      'Permission to move Task to trashcan denied',
    );
    fireEvent.click(deleteIcon[0]);
    expect(handleTaskDelete).not.toHaveBeenCalled();

    const exportIcon = screen.getAllByTitle('Export Task as XML');
    fireEvent.click(exportIcon[0]);
    expect(handleTaskDownload).toHaveBeenCalledWith(observedTask);

    const startIcon = screen.getAllByTitle('Permission to start task denied');
    fireEvent.click(startIcon[0]);
    expect(handleTaskStart).not.toHaveBeenCalled();

    const resumeIcon = screen.getAllByTitle('Task is not stopped');
    fireEvent.click(resumeIcon[0]);
    expect(handleTaskResume).not.toHaveBeenCalled();

    expect(links[2]).toHaveAttribute('href', '/report/1234');
    expect(links[2]).toHaveAttribute(
      'title',
      'Last Report for Task foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('1');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('0');
  });

  test('should render schedule icon if task is scheduled', () => {
    const {task: scheduledTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    render(
      <ToolBarIcons
        entity={scheduledTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const detailsLinks = screen.getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute('href', '/schedule/foo');
    expect(detailsLinks[0]).toHaveAttribute(
      'title',
      'View Details of Schedule schedule 1 (Next due: over)',
    );

    const startIcon = screen.getAllByTitle('Start');
    fireEvent.click(startIcon[0]);
    expect(handleTaskStart).toHaveBeenCalledWith(scheduledTask);

    const scheduleIcon = screen.getAllByTitle('Task is scheduled');
    fireEvent.click(scheduleIcon[0]);
    expect(handleTaskResume).not.toHaveBeenCalled();
  });

  test('should call click handlers for container task', () => {
    const {containerTask} = getMockTasks();

    const handleReportImport = jest.fn();
    const handleTaskCreate = jest.fn();
    const handleContainerTaskCreate = jest.fn();
    const handleTaskClone = jest.fn();
    const handleTaskDelete = jest.fn();
    const handleTaskDownload = jest.fn();
    const handleTaskEdit = jest.fn();
    const handleTaskResume = jest.fn();
    const handleTaskStart = jest.fn();
    const handleTaskStop = jest.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
    });

    const {baseElement} = render(
      <ToolBarIcons
        entity={containerTask}
        onReportImportClick={handleReportImport}
        onTaskCreateClick={handleTaskCreate}
        onContainerTaskCreateClick={handleContainerTaskCreate}
        onTaskCloneClick={handleTaskClone}
        onTaskDeleteClick={handleTaskDelete}
        onTaskDownloadClick={handleTaskDownload}
        onTaskEditClick={handleTaskEdit}
        onTaskResumeClick={handleTaskResume}
        onTaskStartClick={handleTaskStart}
        onTaskStopClick={handleTaskStop}
      />,
    );

    const links = screen.getAllByRole('link');
    const badgeIcons = screen.getAllByTestId('badge-icon');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    const cloneIcon = screen.getAllByTitle('Clone Task');
    fireEvent.click(cloneIcon[0]);
    expect(handleTaskClone).toHaveBeenCalledWith(containerTask);

    const editIcon = screen.getAllByTitle('Edit Task');
    fireEvent.click(editIcon[0]);
    expect(handleTaskEdit).toHaveBeenCalledWith(containerTask);

    const deleteIcon = screen.getAllByTitle('Move Task to trashcan');
    fireEvent.click(deleteIcon[0]);
    expect(handleTaskDelete).toHaveBeenCalledWith(containerTask);

    const exportIcon = screen.getAllByTitle('Export Task as XML');
    fireEvent.click(exportIcon[0]);
    expect(handleTaskDownload).toHaveBeenCalledWith(containerTask);

    const importIcon = screen.getAllByTitle('Import Report');
    fireEvent.click(importIcon[0]);
    expect(handleReportImport).toHaveBeenCalledWith(containerTask);

    expect(links[2]).toHaveAttribute('href', '/report/1234');
    expect(links[2]).toHaveAttribute(
      'title',
      'Last Report for Task foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

    expect(links[4]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Results for Task foo');
    expect(badgeIcons[1]).toHaveTextContent('1');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    expect(badgeIcons[3]).toHaveTextContent('0');
  });
});
