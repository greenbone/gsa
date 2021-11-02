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
import {act} from 'react-dom/test-utils';

import {setLocale} from 'gmp/locale/lang';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Task, {TASK_STATUS} from 'gmp/models/task';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {entitiesLoadingActions} from 'web/store/entities/tasks';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {rendererWith, waitFor, fireEvent} from 'web/utils/testing';

import TaskPage, {ToolBarIcons} from '../listpage';

setLocale('en');

window.URL.createObjectURL = jest.fn();

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

const currentSettings = jest.fn().mockResolvedValue({
  foo: 'bar',
});

const getFilters = jest.fn().mockReturnValue(
  Promise.resolve({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
);

const getDashboardSetting = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getUserSetting = jest.fn().mockResolvedValue({
  filter: null,
});

const getAggregates = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getTasks = jest.fn().mockResolvedValue({
  data: [task],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getReportFormats = jest.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const renewSession = jest.fn().mockResolvedValue({
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

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingfilter),
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

    await waitFor(() => baseElement.querySelectorAll('table'));

    const display = getAllByTestId('grid-item');
    const icons = getAllByTestId('svg-icon');
    const inputs = baseElement.querySelectorAll('input');
    const header = baseElement.querySelectorAll('th');
    const row = baseElement.querySelectorAll('tr');
    const selects = getAllByTestId('select-selected-value');

    // Toolbar Icons
    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');
    expect(icons[1]).toHaveTextContent('wizard.svg');
    expect(icons[2]).toHaveTextContent('new.svg');

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(icons[3]).toHaveAttribute('title', 'Update Filter');
    expect(icons[4]).toHaveAttribute('title', 'Remove Filter');
    expect(icons[5]).toHaveAttribute('title', 'Reset to Default Filter');
    expect(icons[6]).toHaveAttribute('title', 'Help: Powerfilter');
    expect(icons[7]).toHaveAttribute('title', 'Edit Filter');
    expect(selects[0]).toHaveAttribute('title', 'Loaded filter');
    expect(selects[0]).toHaveTextContent('--');

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

    expect(icons[24]).toHaveAttribute('title', 'Start');
    expect(icons[25]).toHaveAttribute('title', 'Task is not stopped');
    expect(icons[26]).toHaveAttribute('title', 'Move Task to trashcan');
    expect(icons[27]).toHaveAttribute('title', 'Edit Task');
    expect(icons[28]).toHaveAttribute('title', 'Clone Task');
    expect(icons[29]).toHaveAttribute('title', 'Export Task');
  });

  test('should call commands for bulk actions', async () => {
    const deleteByFilter = jest.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = jest.fn().mockResolvedValue({
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

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingfilter),
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

    await waitFor(() => baseElement.querySelectorAll('table'));

    const icons = getAllByTestId('svg-icon');

    await act(async () => {
      expect(icons[31]).toHaveAttribute(
        'title',
        'Move page contents to trashcan',
      );
      fireEvent.click(icons[31]);
      expect(deleteByFilter).toHaveBeenCalled();

      expect(icons[32]).toHaveAttribute('title', 'Export page contents');
      fireEvent.click(icons[32]);
      expect(exportByFilter).toHaveBeenCalled();
    });
  });
});

describe('TaskPage ToolBarIcons test', () => {
  test('should render', () => {
    const handleAdvancedTaskWizardClick = jest.fn();
    const handleModifyTaskWizardClick = jest.fn();
    const handleContainerTaskCreateClick = jest.fn();
    const handleTaskCreateClick = jest.fn();
    const handleTaskWizardClick = jest.fn();

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
        onModifyTaskWizardClick={handleModifyTaskWizardClick}
        onContainerTaskCreateClick={handleContainerTaskCreateClick}
        onTaskCreateClick={handleTaskCreateClick}
        onTaskWizardClick={handleTaskWizardClick}
      />,
    );
    expect(element).toMatchSnapshot();

    const links = element.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/scanning.html#managing-tasks',
    );
  });

  test('should call click handlers', () => {
    const handleAdvancedTaskWizardClick = jest.fn();
    const handleModifyTaskWizardClick = jest.fn();
    const handleContainerTaskCreateClick = jest.fn();
    const handleTaskCreateClick = jest.fn();
    const handleTaskWizardClick = jest.fn();

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
        onModifyTaskWizardClick={handleModifyTaskWizardClick}
        onContainerTaskCreateClick={handleContainerTaskCreateClick}
        onTaskCreateClick={handleTaskCreateClick}
        onTaskWizardClick={handleTaskWizardClick}
      />,
    );

    const divs = baseElement.querySelectorAll('div');

    fireEvent.click(divs[6]);
    expect(handleTaskWizardClick).toHaveBeenCalled();
    expect(divs[6]).toHaveTextContent('Task Wizard');

    fireEvent.click(divs[7]);
    expect(handleAdvancedTaskWizardClick).toHaveBeenCalled();
    expect(divs[7]).toHaveTextContent('Advanced Task Wizard');

    fireEvent.click(divs[8]);
    expect(handleModifyTaskWizardClick).toHaveBeenCalled();
    expect(divs[8]).toHaveTextContent('Modify Task Wizard');

    fireEvent.click(divs[10]);
    expect(handleTaskCreateClick).toHaveBeenCalled();
    expect(divs[10]).toHaveTextContent('New Task');

    fireEvent.click(divs[11]);
    expect(handleContainerTaskCreateClick).toHaveBeenCalled();
    expect(divs[11]).toHaveTextContent('New Container Task');
  });

  test('should not show icons if user does not have the right permissions', () => {
    const handleAdvancedTaskWizardClick = jest.fn();
    const handleModifyTaskWizardClick = jest.fn();
    const handleContainerTaskCreateClick = jest.fn();
    const handleTaskCreateClick = jest.fn();
    const handleTaskWizardClick = jest.fn();

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
        onModifyTaskWizardClick={handleModifyTaskWizardClick}
        onContainerTaskCreateClick={handleContainerTaskCreateClick}
        onTaskCreateClick={handleTaskCreateClick}
        onTaskWizardClick={handleTaskWizardClick}
      />,
    );

    const icons = queryAllByTestId('svg-icon');
    expect(icons.length).toBe(1);
    expect(icons[0]).toHaveAttribute('title', 'Help: Tasks');
  });
});
