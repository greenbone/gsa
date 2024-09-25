/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  getPowerFilter,
  getTextInputs,
  getSelectElement,
  testBulkDeleteDialog,
} from 'web/components/testing';
import React from 'react';

import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {entitiesActions} from 'web/store/entities/auditreports';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';

import {
  rendererWith,
  waitFor,
  fireEvent,
  screen,
  wait,
} from 'web/utils/testing';
import {getMockAuditReport} from 'web/pages/reports/__mocks__/mockauditreport';
import AuditReportsPage from '../auditreportslistpage';

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

    const {baseElement, getAllByTestId, within} = render(<AuditReportsPage />);

    await waitFor(() => baseElement.querySelectorAll('table'));

    const display = getAllByTestId('grid-item');
    const icons = getAllByTestId('svg-icon');
    const header = baseElement.querySelectorAll('th');
    const row = baseElement.querySelectorAll('tr');
    const powerFilter = getPowerFilter();
    const select = getSelectElement(powerFilter);
    const inputs = getTextInputs(powerFilter);
    // Toolbar Icons
    expect(icons[0]).toHaveAttribute('title', 'Help: Audit Reports');

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(icons[1]).toHaveAttribute('title', 'Update Filter');
    expect(icons[2]).toHaveAttribute('title', 'Remove Filter');
    expect(icons[3]).toHaveAttribute('title', 'Reset to Default Filter');
    expect(icons[4]).toHaveAttribute('title', 'Help: Powerfilter');
    expect(icons[5]).toHaveAttribute('title', 'Edit Filter');
    const input = within(select).getByTitle('Loaded filter');
    expect(input).toHaveValue('--');

    // // Dashboard
    expect(icons[7]).toHaveAttribute('title', 'Add new Dashboard Display');
    expect(icons[8]).toHaveAttribute('title', 'Reset to Defaults');
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

    const {baseElement, getAllByTestId} = render(<AuditReportsPage />);

    await waitFor(() => baseElement.querySelectorAll('table'));

    const icons = getAllByTestId('svg-icon');

    expect(icons[19]).toHaveAttribute('title', 'Add tag to page contents');
    fireEvent.click(icons[19]);
    expect(getAll).toHaveBeenCalled();

    fireEvent.click(screen.getAllByTitle('Delete page contents')[0]);

    await wait();

    testBulkDeleteDialog(screen, deleteByFilter);
  });
});
