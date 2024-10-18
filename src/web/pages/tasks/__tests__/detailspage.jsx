/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Task, {TASK_STATUS} from 'gmp/models/task';
import Schedule from 'gmp/models/schedule';
import ScanConfig from 'gmp/models/scanconfig';

import {entityLoadingActions} from 'web/store/entities/tasks';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent, act} from 'web/utils/testing';

import Detailspage, {ToolBarIcons} from '../detailspage';

const config = ScanConfig.fromElement({
  _id: '314',
  name: 'foo',
  comment: 'bar',
  scanner: {name: 'scanner1', type: '0'},
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

const currentSettings = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const renewSession = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const getConfig = testing.fn().mockResolvedValue({
  data: config,
});

const getSchedule = testing.fn().mockResolvedValue({
  data: schedule,
});

const getEntities = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

describe('Task Detailspage tests', () => {
  test('should render full Detailspage', () => {
    const getTask = testing.fn().mockResolvedValue({
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

    const {baseElement, getAllByTestId} = render(<Detailspage id="12345" />);

    expect(baseElement).toBeVisible();

    expect(baseElement).toHaveTextContent('Task: foo');

    const links = baseElement.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );

    expect(icons[1]).toHaveAttribute('title', 'Task List');
    expect(links[1]).toHaveAttribute('href', '/tasks');

    expect(baseElement).toHaveTextContent('12345');
    expect(baseElement).toHaveTextContent('Tue, Jul 16, 2019 8:31 AM CEST');
    expect(baseElement).toHaveTextContent('Tue, Jul 16, 2019 8:44 AM CEST');
    expect(baseElement).toHaveTextContent('admin');

    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('bar');

    const progressBars = getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'Done');
    expect(progressBars[0]).toHaveTextContent('Done');

    const headings = baseElement.querySelectorAll('h2');
    const detailsLinks = getAllByTestId('details-link');

    expect(headings[1]).toHaveTextContent('Target');
    expect(detailsLinks[2]).toHaveAttribute('href', '/target/5678');
    expect(baseElement).toHaveTextContent('target1');

    expect(headings[2]).toHaveTextContent('Alerts');
    expect(detailsLinks[3]).toHaveAttribute('href', '/alert/91011');
    expect(baseElement).toHaveTextContent('alert1');

    expect(headings[3]).toHaveTextContent('Scanner');
    expect(detailsLinks[4]).toHaveAttribute('href', '/scanner/1516');
    expect(baseElement).toHaveTextContent('scanner1');
    expect(baseElement).toHaveTextContent('OpenVAS Scanner');

    expect(headings[4]).toHaveTextContent('Assets');

    expect(headings[5]).toHaveTextContent('Scan');
    expect(baseElement).toHaveTextContent('2 minutes');
    expect(baseElement).toHaveTextContent(
      'Do not automatically delete reports',
    );
  });

  test('should render user tags tab', () => {
    const getTask = testing.fn().mockResolvedValue({
      data: task2,
    });

    const getTags = testing.fn().mockResolvedValue({
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

    const {baseElement} = render(<Detailspage id="12345" />);
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[22]);

    expect(baseElement).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const getTask = testing.fn().mockResolvedValue({
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

    const {baseElement} = render(<Detailspage id="12345" />);
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[24]);

    expect(baseElement).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const getTask = testing.fn().mockResolvedValue({
      data: task5,
    });

    const clone = testing.fn().mockResolvedValue({
      data: {id: 'foo'},
    });

    const deleteFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportFunc = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const start = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const resume = testing.fn().mockResolvedValue({
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
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleContainerTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
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

    expect(element).toBeVisible();

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
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleContainerTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
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

    fireEvent.click(divs[8]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[8]).toHaveTextContent('New Task');

    fireEvent.click(divs[9]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Container Task');

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
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleContainerTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
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

    fireEvent.click(divs[8]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[8]).toHaveTextContent('New Task');

    fireEvent.click(divs[9]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Container Task');

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
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleContainerTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
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

    fireEvent.click(divs[8]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[8]).toHaveTextContent('New Task');

    fireEvent.click(divs[9]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Container Task');

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
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleContainerTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
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

    fireEvent.click(divs[8]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[8]).toHaveTextContent('New Task');

    fireEvent.click(divs[9]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Container Task');

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
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleContainerTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
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

    fireEvent.click(divs[8]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[8]).toHaveTextContent('New Task');

    fireEvent.click(divs[9]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Container Task');

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
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleContainerTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

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
    const handleReportImport = testing.fn();
    const handleTaskCreate = testing.fn();
    const handleContainerTaskCreate = testing.fn();
    const handleTaskClone = testing.fn();
    const handleTaskDelete = testing.fn();
    const handleTaskDownload = testing.fn();
    const handleTaskEdit = testing.fn();
    const handleTaskResume = testing.fn();
    const handleTaskStart = testing.fn();
    const handleTaskStop = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
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

    fireEvent.click(divs[8]);
    expect(handleTaskCreate).toHaveBeenCalled();
    expect(divs[8]).toHaveTextContent('New Task');

    fireEvent.click(divs[9]);
    expect(handleContainerTaskCreate).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Container Task');

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
