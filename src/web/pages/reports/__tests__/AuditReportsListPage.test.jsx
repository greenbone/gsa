/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {
  rendererWith,
  fireEvent,
  screen,
  wait,
  within,
  waitFor,
  testBulkDeleteDialog,
} from 'web/testing';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import {getMockAuditReport} from 'web/pages/reports/__mocks__/MockAuditReport';
import AuditReportsPage from 'web/pages/reports/AuditReportsListPage';
import {entitiesActions} from 'web/store/entities/auditreports';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

window.URL.createObjectURL = testing.fn();

const {entity} = getMockAuditReport();

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

const getComplianceAggregates = testing.fn().mockResolvedValue({
  data: [],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getReports = testing.fn().mockResolvedValue({
  data: [entity],
  meta: {
    filter: Filter.fromString(),
    counts: new CollectionCounts(),
  },
});

const getAll = testing.fn().mockResolvedValue({
  data: [],
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

describe('AuditReportsPage tests', () => {
  test('should render full AuditReports Page', async () => {
    const gmp = {
      auditreports: {
        get: getReports,
        getComplianceAggregates: getComplianceAggregates,
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
      defaultFilterLoadingActions.success('auditreport', defaultSettingFilter),
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
      entitiesActions.success([entity], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<AuditReportsPage />);

    await waitFor(() => baseElement.querySelectorAll('table'));

    const display = screen.getAllByTestId('grid-item');
    const header = baseElement.querySelectorAll('th');
    const row = baseElement.querySelectorAll('tr');
    const powerFilter = within(screen.queryPowerFilter());
    const inputs = powerFilter.queryTextInputs();

    // Toolbar Icons
    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Audit Reports',
    );

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    screen.getAllByTitle('Update Filter');
    screen.getAllByTitle('Remove Filter');
    screen.getAllByTitle('Reset to Default Filter');
    screen.getAllByTitle('Help: Powerfilter');
    screen.getAllByTitle('Edit Filter');
    const input = powerFilter.getByTitle('Loaded filter');
    expect(input).toHaveValue('--');

    // Dashboard
    expect(screen.getByTestId('add-dashboard-display')).toHaveAttribute(
      'title',
      'Add new Dashboard Display',
    );
    expect(screen.getByTestId('reset-dashboard')).toHaveAttribute(
      'title',
      'Reset to Defaults',
    );
    expect(display[0]).toHaveTextContent(
      'Audit Reports by Compliance (Total: 0)',
    );
    expect(display[1]).toHaveTextContent(
      'Audit Reports by Compliance (Total: 0)',
    );

    // Table
    expect(header[0]).toHaveTextContent('Date');
    expect(header[1]).toHaveTextContent('Status');
    expect(header[2]).toHaveTextContent('Task');
    expect(header[3]).toHaveTextContent('Compliant');
    expect(header[4]).toHaveTextContent('Yes');
    expect(header[5]).toHaveTextContent('No');
    expect(header[6]).toHaveTextContent('Incomplete');
    expect(header[7]).toHaveTextContent('Actions');

    expect(row[1]).toHaveTextContent('Mon, Jun 3, 2019 1:00 PM');
    expect(row[1]).toHaveTextContent('Done');
    expect(row[1]).toHaveTextContent('foo');
    expect(row[1]).toHaveTextContent('No');
    expect(row[1]).toHaveTextContent('321'); // yes: 3, no: 2, incomplete: 1
  });

  test('should call commands for bulk actions', async () => {
    const deleteByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const exportByFilter = testing.fn().mockResolvedValue({
      foo: 'bar',
    });

    const gmp = {
      auditreports: {
        get: getReports,
        getComplianceAggregates: getComplianceAggregates,
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
      tags: {
        getAll: getAll,
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
      defaultFilterLoadingActions.success('auditreport', defaultSettingfilter),
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
      entitiesActions.success([entity], filter, loadedFilter, counts),
    );

    const {baseElement} = render(<AuditReportsPage />);

    await waitFor(() => baseElement.querySelectorAll('table'));

    const icon = screen.getByTestId('tags-icon');
    expect(icon).toHaveAttribute('title', 'Add tag to page contents');
    fireEvent.click(icon);
    expect(getAll).toHaveBeenCalled();

    fireEvent.click(screen.getAllByTitle('Delete page contents')[0]);

    await wait();

    testBulkDeleteDialog(screen, deleteByFilter);
  });
});
