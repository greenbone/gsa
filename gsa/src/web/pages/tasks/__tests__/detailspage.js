/* Copyright (C) 2019-2020 Greenbone Networks GmbH
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
import {act} from 'react-dom/test-utils';

import {setLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Schedule from 'gmp/models/schedule';
import ScanConfig, {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {entityLoadingActions} from 'web/store/entities/tasks';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import {MockedProvider} from '@apollo/react-testing';

import {GET_TASK} from 'web/pages/tasks/graphql';
import {
  getMockTasks,
  getMockTaskData,
} from 'web/pages/tasks/__mocks__/mocktasks';

import Detailspage, {ToolBarIcons} from '../detailspage';

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

setLocale('en');

const caps = new Capabilities(['everything']);

const reloadInterval = 1;
const manualUrl = 'test/';

// create mock task
const {detailsMockTask: mockData} = getMockTaskData(); // data needed to create the mock requests
const {detailsMockTask: task} = getMockTasks(); // mock task

const mockTask = {
  data: {
    task: {mockData},
  },
};

const mocks = [
  {
    request: {
      query: GET_TASK,
      variables: {taskId: '12345'},
    },
    result: mockTask,
  },
];

// mock gmp commands
const config = ScanConfig.fromElement({
  _id: '314',
  name: 'foo',
  comment: 'bar',
  scanner: {name: 'scanner1', type: '0'},
  type: OPENVAS_SCAN_CONFIG_TYPE,
  tasks: {
    task: [
      {id: '12345', name: 'foo'},
      {id: '678910', name: 'task2'},
    ],
  },
});

const schedule = Schedule.fromElement({
  _id: '121314',
  name: 'schedule1',
  permissions: {permission: [{name: 'everything'}]},
});

const getConfig = jest.fn().mockResolvedValue({
  data: config,
});

const getSchedule = jest.fn().mockResolvedValue({
  data: schedule,
});

const getEntities = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const currentSettings = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = jest.fn().mockResolvedValue({
  foo: 'bar',
});

describe.skip('Task Detailspage tests', () => {
  test('should render full Detailspage', async () => {
    const getTask = jest.fn().mockResolvedValue({
      data: task,
    });

    const gmp = {
      task: {
        get: getTask,
      },
      scanconfig: {
        get: getConfig,
      },
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      notes: {
        get: getEntities,
      },
      overrides: {
        get: getEntities,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', task));

    const {baseElement, element, getAllByTestId} = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Detailspage id="12345" />
      </MockedProvider>,
    );

    expect(element).toMatchSnapshot();

    expect(element).toHaveTextContent('Task: foo');

    const links = baseElement.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );

    expect(icons[1]).toHaveAttribute('title', 'Task List');
    expect(links[1]).toHaveAttribute('href', '/tasks');

    expect(element).toHaveTextContent('12345');
    expect(element).toHaveTextContent('Tue, Jul 16, 2019 8:31 AM CEST');
    expect(element).toHaveTextContent('Tue, Jul 16, 2019 8:44 AM CEST');
    expect(element).toHaveTextContent('admin');

    expect(element).toHaveTextContent('foo');
    expect(element).toHaveTextContent('bar');

    const progressBars = getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'Done');
    expect(progressBars[0]).toHaveTextContent('Done');

    const headings = element.querySelectorAll('h2');
    const detailslinks = getAllByTestId('details-link');

    expect(headings[1]).toHaveTextContent('Target');
    expect(detailslinks[2]).toHaveAttribute('href', '/target/5678');
    expect(element).toHaveTextContent('target1');

    expect(headings[2]).toHaveTextContent('Alerts');
    expect(detailslinks[3]).toHaveAttribute('href', '/alert/91011');
    expect(element).toHaveTextContent('alert1');

    expect(headings[3]).toHaveTextContent('Scanner');
    expect(detailslinks[4]).toHaveAttribute('href', '/scanner/1516');
    expect(element).toHaveTextContent('scanner1');
    expect(element).toHaveTextContent('OpenVAS Scanner');

    expect(headings[4]).toHaveTextContent('Assets');

    expect(headings[5]).toHaveTextContent('Scan');
    expect(element).toHaveTextContent('2 minutes');
    expect(element).toHaveTextContent('Do not automatically delete reports');
  });

  test('should render user tags tab', () => {
    const getTask = jest.fn().mockResolvedValue({
      data: task,
    });

    const getTags = jest.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    });

    const gmp = {
      task: {
        get: getTask,
      },
      scanconfig: {
        get: getConfig,
      },
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      tags: {
        get: getTags,
      },
      reportformats: {
        get: getEntities,
      },
      notes: {
        get: getEntities,
      },
      overrides: {
        get: getEntities,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', task));

    const {baseElement, element} = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Detailspage id="12345" />
      </MockedProvider>,
    );
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[22]);

    expect(element).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const getTask = jest.fn().mockResolvedValue({
      data: task,
    });

    const gmp = {
      task: {
        get: getTask,
      },
      scanconfig: {
        get: getConfig,
      },
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      notes: {
        get: getEntities,
      },
      overrides: {
        get: getEntities,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', task));

    const {baseElement, element} = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Detailspage id="12345" />
      </MockedProvider>,
    );
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[24]);

    expect(element).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const getTask = jest.fn().mockResolvedValue({
      data: task,
    });

    const clone = jest.fn().mockResolvedValue({
      data: {id: 'foo'},
    });

    const deleteFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportFunc = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const start = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const resume = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      task: {
        get: getTask,
        clone,
        delete: deleteFunc,
        export: exportFunc,
        start,
        resume,
      },
      scanconfig: {
        get: getConfig,
      },
      schedule: {
        get: getSchedule,
      },
      permissions: {
        get: getEntities,
      },
      reportformats: {
        get: getEntities,
      },
      notes: {
        get: getEntities,
      },
      overrides: {
        get: getEntities,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {
        currentSettings,
        renewSession,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('12345', task));

    const {getAllByTestId} = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Detailspage id="12345" />
      </MockedProvider>,
    );

    const icons = getAllByTestId('svg-icon');

    await act(async () => {
      fireEvent.click(icons[3]);
      expect(clone).toHaveBeenCalledWith({taskId: '12345'});
      expect(icons[3]).toHaveAttribute('title', 'Clone Task');

      fireEvent.click(icons[5]);
      expect(deleteFunc).toHaveBeenCalledWith(task);
      expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

      fireEvent.click(icons[6]);
      expect(exportFunc).toHaveBeenCalledWith(task);
      expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

      fireEvent.click(icons[7]);
      expect(start).toHaveBeenCalledWith({taskId: '12345'});
      expect(icons[7]).toHaveAttribute('title', 'Start');

      fireEvent.click(icons[8]);
      expect(resume).toHaveBeenCalledWith(task);
      expect(icons[8]).toHaveAttribute('title', 'Resume');
    });
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

    const {element, getAllByTestId} = render(
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

    expect(element).toMatchSnapshot();

    const icons = getAllByTestId('svg-icon');
    const links = element.querySelectorAll('a');

    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );

    expect(icons[1]).toHaveAttribute('title', 'Task List');
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

    const {baseElement, getAllByTestId} = render(
      <MockedProvider mocks={mocks} addTypename={false}>
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
        />
      </MockedProvider>,
    );

    const icons = getAllByTestId('svg-icon');
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(newTask);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(newTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[7]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[8]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[8]).toHaveAttribute('title', 'Task is not stopped');

    expect(links[2]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[2]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('0');

    expect(links[3]).toHaveAttribute('href', '/results?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Results for Task foo');
    // TODO implement resultCount to make this work again
    // expect(badgeIcons[1]).toHaveTextContent('0');

    expect(links[4]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[4]).toHaveAttribute('title', 'Notes for Task foo');
    // expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[5]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[5]).toHaveAttribute('title', 'Overrides for Task foo');
    // expect(badgeIcons[3]).toHaveTextContent('0');
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

    const {baseElement, getAllByTestId} = render(
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

    const icons = getAllByTestId('svg-icon');
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(runningTask);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Task is still in use');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(runningTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(handleTaskStop).toHaveBeenCalledWith(runningTask);
    expect(icons[7]).toHaveAttribute('title', 'Stop');

    fireEvent.click(icons[8]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[8]).toHaveAttribute('title', 'Task is not stopped');

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
    // TODO implement resultCount to make this work again
    // expect(badgeIcons[1]).toHaveTextContent('0');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    // expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    // expect(badgeIcons[3]).toHaveTextContent('0');
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

    const {baseElement, getAllByTestId} = render(
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

    const icons = getAllByTestId('svg-icon');
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(stoppedTask);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(stoppedTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[7]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[8]);
    expect(handleTaskResume).toHaveBeenCalledWith(stoppedTask);
    expect(icons[8]).toHaveAttribute('title', 'Resume');

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
    // TODO implement resultCount to make this work again
    // expect(badgeIcons[1]).toHaveTextContent('10');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    // expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    // expect(badgeIcons[3]).toHaveTextContent('0');
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

    const {baseElement, getAllByTestId} = render(
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

    const icons = getAllByTestId('svg-icon');
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(finishedTask);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(finishedTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[7]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[8]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[8]).toHaveAttribute('title', 'Task is not stopped');

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
    // TODO implement resultCount to make this work again
    // expect(badgeIcons[1]).toHaveTextContent('10');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    // expect(badgeIcons[2]).toHaveTextContent('2');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    // expect(badgeIcons[3]).toHaveTextContent('3');
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

    const {baseElement, getAllByTestId} = render(
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

    const icons = getAllByTestId('svg-icon');
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).not.toHaveBeenCalled();
    expect(icons[4]).toHaveAttribute('title', 'Permission to edit Task denied');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute(
      'title',
      'Permission to move Task to trashcan denied',
    );

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(observedTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(icons[7]).toHaveAttribute(
      'title',
      'Permission to start task denied',
    );

    fireEvent.click(icons[8]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[8]).toHaveAttribute('title', 'Task is not stopped');

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
    // TODO implement resultCount to make this work again
    // expect(badgeIcons[1]).toHaveTextContent('1');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    // expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    // expect(badgeIcons[3]).toHaveTextContent('0');
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

    const {getAllByTestId} = render(
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

    const icons = getAllByTestId('svg-icon');
    const detailsLinks = getAllByTestId('details-link');

    expect(detailsLinks[0]).toHaveAttribute('href', '/schedule/121314');
    expect(detailsLinks[0]).toHaveAttribute(
      'title',
      'View Details of Schedule schedule 1 (Next due: over)',
    );

    fireEvent.click(icons[9]);
    expect(handleTaskStart).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[9]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[10]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[10]).toHaveAttribute('title', 'Task is scheduled');
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

    const {baseElement, getAllByTestId} = render(
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

    const icons = getAllByTestId('svg-icon');
    const badgeIcons = getAllByTestId('badge-icon');
    const links = baseElement.querySelectorAll('a');
    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[9]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');

    fireEvent.click(icons[3]);
    expect(handleTaskClone).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(containerTask);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith({taskId: '12345'});
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(containerTask);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleReportImport).toHaveBeenCalledWith(containerTask);
    expect(icons[7]).toHaveAttribute('title', 'Import Report');

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
    // TODO implement resultCount to make this work again
    // expect(badgeIcons[1]).toHaveTextContent('1');

    expect(links[5]).toHaveAttribute('href', '/notes?filter=task_id%3D12345');
    expect(links[5]).toHaveAttribute('title', 'Notes for Task foo');
    // expect(badgeIcons[2]).toHaveTextContent('0');

    expect(links[6]).toHaveAttribute(
      'href',
      '/overrides?filter=task_id%3D12345',
    );
    expect(links[6]).toHaveAttribute('title', 'Overrides for Task foo');
    // expect(badgeIcons[3]).toHaveTextContent('0');
  });
});
