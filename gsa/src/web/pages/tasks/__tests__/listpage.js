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

import {setLocale} from 'gmp/locale/lang';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {loadingActions as loadUserSettingsActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';

import {
  createGetTasksQueryMock,
  createExportTasksByFilterQueryMock,
  createDeleteTasksByFilterQueryMock,
  createDeleteTasksByIdsQueryMock,
  createExportTasksByIdsQueryMock,
} from 'web/graphql/__mocks__/tasks';
import {getMockTasks} from 'web/pages/tasks/__mocks__/mocktasks';

import TasksListPage, {ToolBarIcons} from '../listpage';

setLocale('en');

window.URL.createObjectURL = jest.fn();

const caps = new Capabilities(['everything']);
const wrongCaps = new Capabilities(['get_config']);

const reloadInterval = null;
const manualUrl = 'test/';

// create mock tasks
const {listMockTask: task} = getMockTasks(); // mock task

let currentSettings;
let getAggregates;
let getDashboardSetting;
let getFilters;
let getReportFormats;
let getTasks;
let getUserSetting;
let renewSession;

beforeEach(() => {
  // mock gmp commands
  getTasks = jest.fn().mockResolvedValue({
    data: [task],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getAggregates = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getFilters = jest.fn().mockReturnValue(
    Promise.resolve({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  );

  getReportFormats = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getDashboardSetting = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getUserSetting = jest.fn().mockResolvedValue({
    filter: null,
  });

  renewSession = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('TasksListPage tests', () => {
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
      settings: {manualUrl, reloadInterval},
      user: {currentSettings, getSetting: getUserSetting},
    };
    const filterString = 'foo=bar rows=2';
    const defaultSettingFilter = Filter.fromString('foo=bar rows=2');
    const [mock, resultFunc] = createGetTasksQueryMock({
      filterString,
      first: 2,
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    store.dispatch(
      loadUserSettingsActions.success({rowsperpage: {value: '2'}}),
    );
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingFilter),
    );

    const {baseElement} = render(<TasksListPage />);

    await wait();

    const display = screen.getAllByTestId('grid-item');
    let icons = screen.getAllByTestId('svg-icon');
    const inputs = baseElement.querySelectorAll('input');
    const selects = screen.getAllByTestId('select-selected-value');

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

    expect(resultFunc).toHaveBeenCalled();

    const header = baseElement.querySelectorAll('th');

    // Table
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Status');
    expect(header[2]).toHaveTextContent('Reports');
    expect(header[3]).toHaveTextContent('Last Report');
    expect(header[4]).toHaveTextContent('Severity');
    expect(header[5]).toHaveTextContent('Trend');
    expect(header[6]).toHaveTextContent('Actions');

    const row = baseElement.querySelectorAll('tr');

    expect(row[1]).toHaveTextContent('foo');
    expect(row[1]).toHaveTextContent('(bar)');
    expect(row[1]).toHaveTextContent('Done');
    expect(row[1]).toHaveTextContent('Tue, Jul 30, 2019 3:23 PM CEST');
    expect(row[1]).toHaveTextContent('5.0 (Medium)');

    icons = screen.getAllByTestId('svg-icon');

    expect(icons[24]).toHaveAttribute(
      'title',
      'Task made visible for:\nUsers john, jane\nRoles admin role, user role\nGroups group 1, group 2',
    );

    expect(icons[25]).toHaveAttribute('title', 'Severity increased');

    expect(icons[26]).toHaveAttribute('title', 'Start');
    expect(icons[27]).toHaveAttribute('title', 'Task is not stopped');
    expect(icons[28]).toHaveAttribute('title', 'Move Task to trashcan');
    expect(icons[29]).toHaveAttribute('title', 'Edit Task');
    expect(icons[30]).toHaveAttribute('title', 'Clone Task');
    expect(icons[31]).toHaveAttribute('title', 'Export Task');
  });

  test('should allow to bulk action on page contents', async () => {
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
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getUserSetting},
    };

    const filterString = 'foo=bar rows=2';
    const [mock, resultFunc] = createGetTasksQueryMock({
      filterString,
      first: 2,
    });

    const [exportMock, exportResult] = createExportTasksByIdsQueryMock([
      '12345',
    ]);
    const [deleteMock, deleteResult] = createDeleteTasksByIdsQueryMock([
      '12345',
    ]);

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(
      loadUserSettingsActions.success({rowsperpage: {value: '2'}}),
    );
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingFilter),
    );

    render(<TasksListPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[34]).toHaveAttribute('title', 'Export page contents');
    fireEvent.click(icons[34]);

    await wait();
    expect(exportResult).toHaveBeenCalled();

    expect(icons[33]).toHaveAttribute(
      'title',
      'Move page contents to trashcan',
    );

    fireEvent.click(icons[33]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });

  test('should allow to bulk action on selected tasks', async () => {
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
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getUserSetting},
    };

    const filterString = 'foo=bar rows=2';
    const [mock, resultFunc] = createGetTasksQueryMock({
      filterString,
      first: 2,
    });

    const [exportMock, exportResult] = createExportTasksByIdsQueryMock([
      '12345',
    ]);
    const [deleteMock, deleteResult] = createDeleteTasksByIdsQueryMock([
      '12345',
    ]);

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(
      loadUserSettingsActions.success({rowsperpage: {value: '2'}}),
    );
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingFilter),
    );

    const {element} = render(<TasksListPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const selectFields = screen.getAllByTestId('select-open-button');

    fireEvent.click(selectFields[1]);
    const selectItems = screen.getAllByTestId('select-item');

    fireEvent.click(selectItems[1]);

    const selected = screen.getAllByTestId('select-selected-value');

    expect(selected[1]).toHaveTextContent('Apply to selection');

    const inputs = element.querySelectorAll('input');

    // check task to be exported
    fireEvent.click(inputs[1]);
    await wait();

    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[28]).toHaveAttribute('title', 'Export selection');
    fireEvent.click(icons[28]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    expect(icons[27]).toHaveAttribute('title', 'Move selection to trashcan');

    fireEvent.click(icons[27]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
  });

  test('should allow to bulk action on filtered tasks', async () => {
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
      settings: {manualUrl, reloadInterval},
      user: {renewSession, currentSettings, getSetting: getUserSetting},
    };

    const filterString = 'foo=bar rows=2';
    const [mock, resultFunc] = createGetTasksQueryMock({
      filterString,
      first: 2,
    });

    const [exportMock, exportResult] = createExportTasksByFilterQueryMock(
      'foo=bar rows=-1 first=1',
    );
    const [deleteMock, deleteResult] = createDeleteTasksByFilterQueryMock(
      'foo=bar rows=-1 first=1',
    );

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
      queryMocks: [mock, exportMock, deleteMock],
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingFilter = Filter.fromString('foo=bar');
    store.dispatch(
      loadUserSettingsActions.success({rowsperpage: {value: '2'}}),
    );
    store.dispatch(
      defaultFilterLoadingActions.success('task', defaultSettingFilter),
    );

    render(<TasksListPage />);

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const selectFields = screen.getAllByTestId('select-open-button');

    fireEvent.click(selectFields[1]);
    const selectItems = screen.getAllByTestId('select-item');

    fireEvent.click(selectItems[2]);

    await wait();

    const selected = screen.getAllByTestId('select-selected-value');

    expect(selected[1]).toHaveTextContent('Apply to all filtered');

    const icons = screen.getAllByTestId('svg-icon');

    expect(icons[34]).toHaveAttribute('title', 'Export all filtered');
    fireEvent.click(icons[34]);

    await wait();

    expect(exportResult).toHaveBeenCalled();

    expect(icons[33]).toHaveAttribute('title', 'Move all filtered to trashcan');

    fireEvent.click(icons[33]);

    await wait();

    expect(deleteResult).toHaveBeenCalled();
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
