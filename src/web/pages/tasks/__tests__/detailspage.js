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
import Task, {TASK_STATUS} from 'gmp/models/task';
import Schedule from 'gmp/models/schedule';
import ScanConfig, {OPENVAS_SCAN_CONFIG_TYPE} from 'gmp/models/scanconfig';

import {entityLoadingActions} from 'web/store/entities/tasks';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

setLocale('en');

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

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-07-30T13:23:30Z',
    scan_start: '2019-07-30T13:23:34Z',
    scan_end: '2019-07-30T13:25:43Z',
  },
};

const currentReport = {
  report: {
    _id: '12342',
    timestamp: '2019-07-30T13:23:30Z',
    scan_start: '2019-07-30T13:23:34Z',
  },
};

const preferences = {
  preference: [
    {
      name: 'Add results to Asset Management',
      scanner_name: 'in_assets',
      value: 'yes',
    },
    {
      name: 'Apply Overrides when adding Assets',
      scanner_name: 'assets_apply_overrides',
      value: 'yes',
    },
    {
      name: 'Min QOD when adding Assets',
      scanner_name: 'assets_min_qod',
      value: '70',
    },
    {
      name: 'Auto Delete Reports',
      scanner_name: 'auto_delete',
      value: 'no',
    },
    {
      name: 'Auto Delete Reports Data',
      scanner_name: 'auto_delete_data',
      value: '5',
    },
  ],
};

const task = Task.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: TASK_STATUS.done,
  alterable: '1',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: config,
  preferences: preferences,
});

const task2 = Task.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: TASK_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: config,
  preferences: preferences,
});

const task3 = Task.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: TASK_STATUS.new,
  alterable: '0',
  report_count: {__text: '0'},
  result_count: '0',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: config,
  preferences: preferences,
});

const task4 = Task.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  in_use: '1',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: TASK_STATUS.running,
  alterable: '0',
  current_report: currentReport,
  report_count: {__text: '1'},
  result_count: '0',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: config,
  preferences: preferences,
});

const task5 = Task.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: TASK_STATUS.stopped,
  alterable: '0',
  current_report: currentReport,
  last_report: lastReport,
  report_count: {__text: '2'},
  result_count: '10',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: config,
  preferences: preferences,
});

const task5Id = {
  id: '12345',
};

const task6 = Task.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: TASK_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
  permissions: {permission: [{name: 'get_tasks'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: config,
  preferences: preferences,
});

const task7 = Task.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  status: TASK_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  report_count: {__text: '1'},
  result_count: '1',
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: '2'},
  config: config,
  schedule: {
    _id: '121314',
    name: 'schedule1',
    permissions: {permission: [{name: 'everything'}]},
  },
  schedule_periods: '1',
  preferences: preferences,
});

const task8 = Task.fromElement({
  _id: '12345',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  creation_time: '2019-07-16T06:31:29Z',
  modification_time: '2019-07-16T06:44:55Z',
  report_count: {__text: '1'},
  result_count: '1',
  last_report: lastReport,
  permissions: {permission: [{name: 'everything'}]},
});

const caps = new Capabilities(['everything']);

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = jest.fn().mockResolvedValue({
  foo: 'bar',
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

describe('Task Detailspage tests', () => {
  test('should render full Detailspage', () => {
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
      <Detailspage id="12345" />,
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
      data: task2,
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

    store.dispatch(entityLoadingActions.success('12345', task2));

    const {baseElement, element} = render(<Detailspage id="12345" />);
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[22]);

    expect(element).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const getTask = jest.fn().mockResolvedValue({
      data: task2,
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

    store.dispatch(entityLoadingActions.success('12345', task2));

    const {baseElement, element} = render(<Detailspage id="12345" />);
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[24]);

    expect(element).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const getTask = jest.fn().mockResolvedValue({
      data: task5,
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

    store.dispatch(entityLoadingActions.success('12345', task5));

    const {getAllByTestId} = render(<Detailspage id="12345" />);

    const icons = getAllByTestId('svg-icon');

    await act(async () => {
      fireEvent.click(icons[3]);
      expect(clone).toHaveBeenCalledWith(task5);
      expect(icons[3]).toHaveAttribute('title', 'Clone Task');

      fireEvent.click(icons[5]);
      expect(deleteFunc).toHaveBeenCalledWith(task5Id);
      expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

      fireEvent.click(icons[6]);
      expect(exportFunc).toHaveBeenCalledWith(task5);
      expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

      fireEvent.click(icons[7]);
      expect(start).toHaveBeenCalledWith(task5);
      expect(icons[7]).toHaveAttribute('title', 'Start');

      fireEvent.click(icons[8]);
      expect(resume).toHaveBeenCalledWith(task5);
      expect(icons[8]).toHaveAttribute('title', 'Resume');
    });
  });
});

describe('Task ToolBarIcons tests', () => {
  test('should render', () => {
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
        entity={task}
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
        entity={task3}
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
    expect(handleTaskClone).toHaveBeenCalledWith(task3);
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task3);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task3);
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task3);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).toHaveBeenCalledWith(task3);
    expect(icons[7]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[8]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[8]).toHaveAttribute('title', 'Task is not stopped');

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
        entity={task4}
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
    expect(handleTaskClone).toHaveBeenCalledWith(task4);
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task4);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).not.toHaveBeenCalled();
    expect(icons[5]).toHaveAttribute('title', 'Task is still in use');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task4);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).not.toHaveBeenCalled();
    expect(handleTaskStop).toHaveBeenCalledWith(task4);
    expect(icons[7]).toHaveAttribute('title', 'Stop');

    fireEvent.click(icons[8]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[8]).toHaveAttribute('title', 'Task is not stopped');

    expect(links[2]).toHaveAttribute('href', '/report/12342');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Task foo from 07/30/2019',
    );

    expect(links[3]).toHaveAttribute('href', '/reports?filter=task_id%3D12345');
    expect(links[3]).toHaveAttribute('title', 'Total Reports for Task foo');
    expect(badgeIcons[0]).toHaveTextContent('1');

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
        entity={task5}
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
    expect(handleTaskClone).toHaveBeenCalledWith(task5);
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task5);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task5);
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task5);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).toHaveBeenCalledWith(task5);
    expect(icons[7]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[8]);
    expect(handleTaskResume).toHaveBeenCalledWith(task5);
    expect(icons[8]).toHaveAttribute('title', 'Resume');

    expect(links[2]).toHaveAttribute('href', '/report/12342');
    expect(links[2]).toHaveAttribute(
      'title',
      'Current Report for Task foo from 07/30/2019',
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
        entity={task2}
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
    expect(handleTaskClone).toHaveBeenCalledWith(task2);
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task2);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task2);
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task2);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleTaskStart).toHaveBeenCalledWith(task2);
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
    expect(badgeIcons[1]).toHaveTextContent('1');

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
        entity={task6}
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
    expect(handleTaskClone).toHaveBeenCalledWith(task6);
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
    expect(handleTaskDownload).toHaveBeenCalledWith(task6);
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
        entity={task7}
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
      'View Details of Schedule schedule1 (Next due: over)',
    );

    fireEvent.click(icons[8]);
    expect(handleTaskStart).toHaveBeenCalledWith(task7);
    expect(icons[8]).toHaveAttribute('title', 'Start');

    fireEvent.click(icons[9]);
    expect(handleTaskResume).not.toHaveBeenCalled();
    expect(icons[9]).toHaveAttribute('title', 'Task is scheduled');
  });

  test('should call click handlers for container task', () => {
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
        entity={task8}
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
    expect(handleTaskClone).toHaveBeenCalledWith(task8);
    expect(icons[3]).toHaveAttribute('title', 'Clone Task');

    fireEvent.click(icons[4]);
    expect(handleTaskEdit).toHaveBeenCalledWith(task8);
    expect(icons[4]).toHaveAttribute('title', 'Edit Task');

    fireEvent.click(icons[5]);
    expect(handleTaskDelete).toHaveBeenCalledWith(task8);
    expect(icons[5]).toHaveAttribute('title', 'Move Task to trashcan');

    fireEvent.click(icons[6]);
    expect(handleTaskDownload).toHaveBeenCalledWith(task8);
    expect(icons[6]).toHaveAttribute('title', 'Export Task as XML');

    fireEvent.click(icons[7]);
    expect(handleReportImport).toHaveBeenCalledWith(task8);
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
