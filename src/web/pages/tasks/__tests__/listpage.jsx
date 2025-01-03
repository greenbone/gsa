/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import Task, {TASK_STATUS} from 'gmp/models/task';
import {
  clickElement,
  getPowerFilter,
  getSelectElement,
  getTextInputs,
  testBulkTrashcanDialog,
} from 'web/components/testing';
import {entitiesLoadingActions} from 'web/store/entities/tasks';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import TaskPage, {ToolBarIcons} from '../listpage';

const lastReport = {
  report: {
    _id: '1234',
    timestamp: '2019-08-10T12:51:27Z',
    severity: '5.0',
  },
};

const task = Task.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  name: 'foo',
  comment: 'bar',
  status: TASK_STATUS.done,
  alterable: '0',
  last_report: lastReport,
  report_count: {__text: '1'},
  permissions: {permission: [{name: 'everything'}]},
  target: {_id: 'id1', name: 'target1'},
});

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const getFilters = testing.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getDashboardSetting = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getUserSetting = testing.fn().mockResolvedValue({
  filter: null,
});

const getAggregates = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getTasks = testing.fn().mockResolvedValue({
  data: [task],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getReportFormats = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const renewSession = testing.fn().mockResolvedValue({
  foo: 'bar',
});

describe('TaskPage tests', () => {
  test('should render full TaskPage', async () => {
    const gmp = {
      tasks: {
        get: getTasks,
        getSeverityAggregates: getAggregates,
        getHighResultsAggregates: getAggregates,
        getStatusAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      reportformats: {
        get: getReportFormats,
      },
      dashboard: {
        getSetting: getDashboardSetting,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {currentSettings, getSetting: getUserSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([task], filter, loadedFilter, counts),
    );

    const {baseElement, getAllByTestId} = render(<TaskPage />);

    await wait();

    const display = getAllByTestId('grid-item');
    const icons = getAllByTestId('svg-icon');
    const header = baseElement.querySelectorAll('th');
    const row = baseElement.querySelectorAll('tr');
    const powerFilter = getPowerFilter();
    const select = getSelectElement(powerFilter);
    const inputs = getTextInputs(powerFilter);

    // Toolbar Icons
    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(icons[3]).toHaveAttribute('title', 'Update Filter');
    expect(icons[4]).toHaveAttribute('title', 'Remove Filter');
    expect(icons[5]).toHaveAttribute('title', 'Reset to Default Filter');
    expect(icons[6]).toHaveAttribute('title', 'Help: Powerfilter');
    expect(icons[7]).toHaveAttribute('title', 'Edit Filter');
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

    // Dashboard
    expect(icons[9]).toHaveAttribute('title', 'Add new Dashboard Display');
    expect(icons[10]).toHaveAttribute('title', 'Reset to Defaults');
    expect(display[0]).toHaveTextContent('Tasks by Severity Class (Total: 0)');
    expect(display[1]).toHaveTextContent(
      'Tasks with most High Results per Host',
    );
    expect(display[2]).toHaveTextContent('Tasks by Status (Total: 0)');

    // Table
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Status');
    expect(header[2]).toHaveTextContent('Reports');
    expect(header[3]).toHaveTextContent('Last Report');
    expect(header[4]).toHaveTextContent('Severity');
    expect(header[5]).toHaveTextContent('Trend');
    expect(header[6]).toHaveTextContent('Actions');

    expect(row[1]).toHaveTextContent('foo');
    expect(row[1]).toHaveTextContent('(bar)');
    expect(row[1]).toHaveTextContent('Done');
    expect(row[1]).toHaveTextContent('Sat, Aug 10, 2019 2:51 PM CEST');
    expect(row[1]).toHaveTextContent('5.0 (Medium)');

    expect(icons[30]).toHaveAttribute('title', 'Start');
    expect(icons[31]).toHaveAttribute('title', 'Task is not stopped');
    expect(icons[32]).toHaveAttribute('title', 'Move Task to trashcan');
    expect(icons[33]).toHaveAttribute('title', 'Edit Task');
    expect(icons[34]).toHaveAttribute('title', 'Clone Task');
    expect(icons[35]).toHaveAttribute('title', 'Export Task');
  });

  test('should call commands for bulk actions', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      tasks: {
        get: getTasks,
        getSeverityAggregates: getAggregates,
        getHighResultsAggregates: getAggregates,
        getStatusAggregates: getAggregates,
        deleteByFilter,
        exportByFilter,
      },
      filters: {
        get: getFilters,
      },
      reportformats: {
        get: getReportFormats,
      },
      dashboard: {
        getSetting: getDashboardSetting,
      },
      reloadInterval,
      settings: {manualUrl},
      user: {renewSession, currentSettings, getSetting: getUserSetting},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingFilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success([task], filter, loadedFilter, counts),
    );

    render(<TaskPage />);

    await wait();

    // export page contents
    const exportIcon = screen.getAllByTitle('Export page contents')[0];
    await clickElement(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = screen.getAllByTitle(
      'Move page contents to trashcan',
    )[0];
    await clickElement(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
  });
});

describe('TaskPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleAdvancedTaskWizardClick = testing.fn();
    const handleModifyTaskWizardClick = testing.fn();
    const handleContainerTaskCreateClick = testing.fn();
    const handleTaskCreateClick = testing.fn();
    const handleTaskWizardClick = testing.fn();

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
        onAdvancedTaskWizardClick={handleAdvancedTaskWizardClick}
        onContainerTaskCreateClick={handleContainerTaskCreateClick}
        onModifyTaskWizardClick={handleModifyTaskWizardClick}
        onTaskCreateClick={handleTaskCreateClick}
        onTaskWizardClick={handleTaskWizardClick}
      />,
    );
    expect(element).toBeVisible();

    const links = element.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );
  });

  test('should call click handlers', () => {
    const handleAdvancedTaskWizardClick = testing.fn();
    const handleModifyTaskWizardClick = testing.fn();
    const handleContainerTaskCreateClick = testing.fn();
    const handleTaskCreateClick = testing.fn();
    const handleTaskWizardClick = testing.fn();

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
        onAdvancedTaskWizardClick={handleAdvancedTaskWizardClick}
        onContainerTaskCreateClick={handleContainerTaskCreateClick}
        onModifyTaskWizardClick={handleModifyTaskWizardClick}
        onTaskCreateClick={handleTaskCreateClick}
        onTaskWizardClick={handleTaskWizardClick}
      />,
    );

    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[5]);
    expect(handleTaskWizardClick).toHaveBeenCalled();
    expect(divs[5]).toHaveTextContent('Task Wizard');

    fireEvent.click(divs[6]);
    expect(handleAdvancedTaskWizardClick).toHaveBeenCalled();
    expect(divs[6]).toHaveTextContent('Advanced Task Wizard');

    fireEvent.click(divs[7]);
    expect(handleModifyTaskWizardClick).toHaveBeenCalled();
    expect(divs[7]).toHaveTextContent('Modify Task Wizard');

    fireEvent.click(divs[9]);
    expect(handleTaskCreateClick).toHaveBeenCalled();
    expect(divs[9]).toHaveTextContent('New Task');

    fireEvent.click(divs[10]);
    expect(handleContainerTaskCreateClick).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Container Task');
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleAdvancedTaskWizardClick = testing.fn();
    const handleModifyTaskWizardClick = testing.fn();
    const handleContainerTaskCreateClick = testing.fn();
    const handleTaskCreateClick = testing.fn();
    const handleTaskWizardClick = testing.fn();

    const gmp = {
      settings: {manualUrl},
    };

    const {render} = rendererWith({
      gmp,
      capabilities: wrongCaps,
      router: true,
    });
    const {queryAllByTestId} = render(
      <ToolBarIcons
        onAdvancedTaskWizardClick={handleAdvancedTaskWizardClick}
        onContainerTaskCreateClick={handleContainerTaskCreateClick}
        onModifyTaskWizardClick={handleModifyTaskWizardClick}
        onTaskCreateClick={handleTaskCreateClick}
        onTaskWizardClick={handleTaskWizardClick}
      />,
    );

    const icons = queryAllByTestId('svg-icon');
    expect(icons.length).toBe(1);
    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');
  });
});
