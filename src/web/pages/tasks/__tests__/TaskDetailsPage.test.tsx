/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Features from 'gmp/capabilities/features';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import ScanConfig from 'gmp/models/scan-config';
import {OPENVAS_SCANNER_TYPE} from 'gmp/models/scanner';
import Schedule from 'gmp/models/schedule';
import Task, {TASK_STATUS} from 'gmp/models/task';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import TaskDetailsPage from 'web/pages/tasks/TaskDetailsPage';
import {entityLoadingActions} from 'web/store/entities/tasks';

const config = ScanConfig.fromElement({
  _id: '314',
  name: 'foo',
  comment: 'bar',
  scanner: {name: 'scanner1', type: '0'},
  tasks: {
    task: [
      {_id: '12345', name: 'foo'},
      {_id: '678910', name: 'task2'},
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
    {
      name: 'Allow Failed Credential Store Retrieval',
      scanner_name: 'cs_allow_failed_retrieval',
      value: '1',
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
  alterable: 1,
  last_report: lastReport,
  report_count: {__text: 1},
  result_count: 1,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: OPENVAS_SCANNER_TYPE},
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
  alterable: 0,
  last_report: lastReport,
  report_count: {__text: 1},
  result_count: 1,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: OPENVAS_SCANNER_TYPE},
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
  alterable: 0,
  current_report: currentReport,
  last_report: lastReport,
  report_count: {__text: 2},
  result_count: 10,
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: '5678', name: 'target1'},
  alert: {_id: '91011', name: 'alert1'},
  scanner: {_id: '1516', name: 'scanner1', type: OPENVAS_SCANNER_TYPE},
  config: config,
  preferences: preferences,
});

const task5Id = {
  id: '12345',
};

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const createGmp = ({
  getTask = testing.fn().mockResolvedValue({
    data: task,
  }),
  getConfig = testing.fn().mockResolvedValue({
    data: config,
  }),
  getSchedule = testing.fn().mockResolvedValue({
    data: schedule,
  }),
  getEntities = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getTags = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  cloneTask = testing.fn().mockResolvedValue({
    data: {id: 'foo'},
  }),
  deleteTask = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  exportTask = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  startTask = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
  resumeTask = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
} = {}) => ({
  task: {
    get: getTask,
    clone: cloneTask,
    delete: deleteTask,
    export: exportTask,
    start: startTask,
    resume: resumeTask,
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
  tags: {
    get: getTags,
  },
  reloadInterval,
  settings: {
    manualUrl,
  },
  session: createSession({timezone: 'CET'}),
  user: {
    currentSettings,
  },
});

describe('TaskDetailsPage tests', () => {
  test('should render full DetailsPage', () => {
    const gmp = createGmp();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      features: new Features(['ENABLE_CREDENTIAL_STORES']),
    });

    store.dispatch(entityLoadingActions.success('12345', task));

    const {baseElement} = render(<TaskDetailsPage id="12345" />);

    expect(baseElement).toBeVisible();

    expect(baseElement).toHaveTextContent('Task: foo');

    const links = baseElement.querySelectorAll('a');
    const helpIcon = screen.getByTestId('help-icon');
    expect(helpIcon).toHaveAttribute('title', 'Help: Tasks');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );

    const listIcon = screen.getByTestId('list-icon');
    expect(listIcon).toHaveAttribute('title', 'Task List');
    expect(links[1]).toHaveAttribute('href', '/tasks');

    expect(baseElement).toHaveTextContent('12345');
    expect(baseElement).toHaveTextContent(
      'Tue, Jul 16, 2019 8:31 AM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent(
      'Tue, Jul 16, 2019 8:44 AM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent('admin');

    expect(baseElement).toHaveTextContent('foo');
    expect(baseElement).toHaveTextContent('bar');
    // Use container for more reliable assertion
    const detailsText = baseElement.textContent;
    expect(detailsText).toContain(
      'Allow scan when credential store retrieval fails',
    );
    expect(detailsText).toContain('Yes');
    expect(baseElement).toHaveTextContent(
      'Allow scan when credential store retrieval fails',
    );
    expect(baseElement).toHaveTextContent('Yes');

    const progressBars = screen.getAllByTestId('progressbar-box');
    expect(progressBars[0]).toHaveAttribute('title', 'Done');
    expect(progressBars[0]).toHaveTextContent('Done');

    const headings = baseElement.querySelectorAll('h2');
    const detailsLinks = screen.getAllByTestId('details-link');

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

    const gmp = createGmp({
      getTask,
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      features: new Features(['ENABLE_CREDENTIAL_STORES']),
    });

    store.dispatch(entityLoadingActions.success('12345', task2));

    const {container} = render(<TaskDetailsPage id="12345" />);

    const userTagsTab = screen.getByRole('tab', {name: /^user tags/i});
    fireEvent.click(userTagsTab);
    expect(container).toHaveTextContent('No user tags available');
  });

  test('should render permissions tab', () => {
    const getTask = testing.fn().mockResolvedValue({
      data: task2,
    });

    const gmp = createGmp({
      getTask,
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      features: new Features(['ENABLE_CREDENTIAL_STORES']),
    });

    store.dispatch(entityLoadingActions.success('12345', task2));

    const {container} = render(<TaskDetailsPage id="12345" />);

    const permissionsTab = screen.getByRole('tab', {name: /^permissions/i});
    fireEvent.click(permissionsTab);
    expect(container).toHaveTextContent('No permissions available');
  });

  test('should call commands', async () => {
    const getTask = testing.fn().mockResolvedValue({
      data: task5,
    });

    const gmp = createGmp({
      getTask,
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
      features: new Features(['ENABLE_CREDENTIAL_STORES']),
    });

    store.dispatch(entityLoadingActions.success('12345', task5));

    render(<TaskDetailsPage id="12345" />);

    const cloneIcon = screen.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    fireEvent.click(cloneIcon);
    expect(gmp.task.clone).toHaveBeenCalledWith(task5);

    const deleteIcon = screen.getByTestId('trashcan-icon');
    expect(deleteIcon).toHaveAttribute('title', 'Move Task to trashcan');
    fireEvent.click(deleteIcon);
    expect(gmp.task.delete).toHaveBeenCalledWith(task5Id);

    const exportIcon = screen.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Task as XML');
    fireEvent.click(exportIcon);
    expect(gmp.task.export).toHaveBeenCalledWith(task5);

    const startIcon = screen.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    fireEvent.click(startIcon);
    expect(gmp.task.start).toHaveBeenCalledWith(task5);

    const resumeIcon = screen.getByTestId('resume-icon');
    expect(resumeIcon).toHaveAttribute('title', 'Resume');
    fireEvent.click(resumeIcon);
    expect(gmp.task.resume).toHaveBeenCalledWith(task5);
  });
});
