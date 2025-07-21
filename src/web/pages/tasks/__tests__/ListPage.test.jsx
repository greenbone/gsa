/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  screen,
  testBulkTrashcanDialog,
  within,
  rendererWith,
  fireEvent,
  wait,
} from 'web/testing';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import Task, {TASK_STATUS} from 'gmp/models/task';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import TaskPage from 'web/pages/tasks/ListPage';
import {entitiesLoadingActions} from 'web/store/entities/tasks';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

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

const reloadInterval = 1;
const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

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

describe('TaskDetailsPage tests', () => {
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

    const {baseElement} = render(<TaskPage />);

    await wait();

    const display = screen.getAllByTestId('grid-item');
    const header = baseElement.querySelectorAll('th');
    const row = baseElement.querySelectorAll('tbody tr')[0];
    const powerFilter = within(screen.queryPowerFilter());
    const select = powerFilter.getByTestId('powerfilter-select');

    // Toolbar Icons
    const helpIcon = screen.getByTestId('help-icon');
    expect(helpIcon).toHaveAttribute('title', 'Help: Tasks');

    // Powerfilter
    expect(screen.getByTestId('powerfilter-text')).toHaveAttribute(
      'name',
      'userFilterString',
    );
    expect(screen.getByTestId('powerfilter-refresh')).toHaveAttribute(
      'title',
      'Update Filter',
    );
    expect(screen.getByTestId('powerfilter-delete')).toHaveAttribute(
      'title',
      'Remove Filter',
    );
    expect(screen.getByTestId('powerfilter-reset')).toHaveAttribute(
      'title',
      'Reset to Default Filter',
    );
    expect(screen.getByTestId('powerfilter-help')).toHaveAttribute(
      'title',
      'Help: Powerfilter',
    );
    expect(screen.getByTestId('powerfilter-edit')).toHaveAttribute(
      'title',
      'Edit Filter',
    );
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

    // Dashboard
    expect(screen.getByTestId('add-dashboard-display')).toHaveAttribute(
      'title',
      'Add new Dashboard Display',
    );
    expect(screen.getByTestId('reset-dashboard')).toHaveAttribute(
      'title',
      'Reset to Defaults',
    );
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

    expect(row).toHaveTextContent('foo');
    expect(row).toHaveTextContent('(bar)');
    expect(row).toHaveTextContent('Done');
    expect(row).toHaveTextContent(
      'Sat, Aug 10, 2019 2:51 PM Central European Summer Time',
    );
    expect(row).toHaveTextContent('5.0 (Medium)');

    const withinRow = within(row);
    const startIcon = withinRow.getByTestId('start-icon');
    expect(startIcon).toHaveAttribute('title', 'Start');
    const trashcanIcon = withinRow.getByTestId('trashcan-icon');
    expect(trashcanIcon).toHaveAttribute('title', 'Move Task to trashcan');
    const editIcon = withinRow.getByTestId('edit-icon');
    expect(editIcon).toHaveAttribute('title', 'Edit Task');
    const cloneIcon = withinRow.getByTestId('clone-icon');
    expect(cloneIcon).toHaveAttribute('title', 'Clone Task');
    const exportIcon = withinRow.getByTestId('export-icon');
    expect(exportIcon).toHaveAttribute('title', 'Export Task');
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
    fireEvent.click(exportIcon);
    expect(exportByFilter).toHaveBeenCalled();

    // move page contents to trashcan
    const deleteIcon = screen.getAllByTitle(
      'Move page contents to trashcan',
    )[0];
    fireEvent.click(deleteIcon);
    testBulkTrashcanDialog(screen, deleteByFilter);
  });
});
