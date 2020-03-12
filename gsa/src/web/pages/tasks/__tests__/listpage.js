/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';
import {act} from 'react-dom/test-utils';

import {setLocale} from 'gmp/locale/lang';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import Task, {TASK_STATUS} from 'gmp/models/task';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {entitiesActions} from 'web/store/entities/tasks';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {rendererWith, waitForElement, fireEvent} from 'web/utils/testing';

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
      entitiesActions.success([task], filter, loadedFilter, counts),
    );

    const {baseElement, getAllByTestId} = render(<TaskPage />);

    await waitForElement(() => baseElement.querySelectorAll('table'));

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
