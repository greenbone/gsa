/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {screen, within, rendererWith, fireEvent} from 'web/testing';
import Filter from 'gmp/models/filter';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import {getMockAuditDeltaReport} from 'web/pages/reports/__fixtures__/MockAuditDeltaReport';
import DeltaDetailsContent from 'web/pages/reports/DeltaDetailsContent';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const filter = Filter.fromString(
  'apply_overrides=0 compliance_levels=ynui rows=10 min_qod=70 first=1 sort=compliant',
);

const filterWithName = Filter.fromElement({
  term: 'apply_overrides=0 compliance_levels=ynui rows=10 min_qod=70 first=1 sort=compliant',
  name: 'foo',
  id: '123',
});

const manualUrl = 'test/';

const createGmp = ({
  currentSettingsResponse = currentSettingsDefaultResponse,
  getReportComposerDefaultsResponse = {foo: 'bar'},
  reportResultsThreshold = 10,
  currentSettings = testing.fn().mockResolvedValue(currentSettingsResponse),
  getReportComposerDefaults = testing
    .fn()
    .mockResolvedValue(getReportComposerDefaultsResponse),
} = {}) => {
  return {
    settings: {
      manualUrl,
      reportResultsThreshold,
    },
    user: {
      currentSettings,
      getReportComposerDefaults,
    },
  };
};

describe('AuditDeltaDetailsContent tests', () => {
  test('should render Audit Delta Report Details Content', () => {
    const onAddToAssetsClick = testing.fn();
    const onError = testing.fn();
    const onFilterAddLogLevelClick = testing.fn();
    const onFilterDecreaseMinQoDClick = testing.fn();
    const onFilterChanged = testing.fn();
    const onFilterCreated = testing.fn();
    const onFilterEditClick = testing.fn();
    const onFilterRemoveSeverityClick = testing.fn();
    const onFilterResetClick = testing.fn();
    const onFilterRemoveClick = testing.fn();
    const onRemoveFromAssetsClick = testing.fn();
    const onReportDownloadClick = testing.fn();
    const showError = testing.fn();
    const showErrorMessage = testing.fn();
    const showSuccessMessage = testing.fn();
    const onSortChange = testing.fn();
    const onTagSuccess = testing.fn();
    const onTargetEditClick = testing.fn();
    const onTlsCertificateDownloadClick = testing.fn();
    const sorting = {
      errors: {sortField: 'error', sortReverse: true},
      hosts: {sortField: 'compliant', sortReverse: true},
      os: {sortField: 'compliant', sortReverse: true},
      results: {sortField: 'compliant', sortReverse: true},
      tlscerts: {sortField: 'dn', sortReverse: true},
    };
    const {entity} = getMockAuditDeltaReport();
    const filters = [filterWithName];
    const gmp = createGmp({
      reportResultsThreshold: 10,
    });

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <DeltaDetailsContent
        audit={true}
        entity={entity}
        errorsCounts={{all: 2, filtered: 2}}
        filter={filterWithName}
        filters={filters}
        isLoading={false}
        isUpdating={false}
        reportId={entity.report.id}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
        sortField={sorting.results.sortField}
        sortReverse={sorting.results.sortReverse}
        sorting={sorting}
        task={entity.report.task}
        onAddToAssetsClick={onAddToAssetsClick}
        onError={onError}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterChanged={onFilterChanged}
        onFilterCreated={onFilterCreated}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        onFilterResetClick={onFilterResetClick}
        onRemoveFromAssetsClick={onRemoveFromAssetsClick}
        onReportDownloadClick={onReportDownloadClick}
        onSortChange={onSortChange}
        onTagSuccess={onTagSuccess}
        onTargetEditClick={onTargetEditClick}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    // buttons
    const helpIcon = screen.getByTitle('Help: Audit Reports');
    expect(helpIcon.closest('a')).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#using-and-managing-audit-reports',
    );

    expect(screen.getByTitle('Audit Reports List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/auditreports',
    );

    expect(screen.getByTitle(/^Add to Assets/)).toBeInTheDocument();
    expect(screen.getByTitle(/^Remove from Assets/)).toBeInTheDocument();
    const correspondingTask = screen.getByTitle(/^Corresponding Task/);
    expect(correspondingTask).toHaveAttribute('href', '/task/314');
    const correspondingResults = screen.getByTitle(/^Corresponding Results/);
    expect(correspondingResults).toHaveAttribute(
      'href',
      '/results?filter=report_id%3D1234',
    );
    expect(screen.getByTitle(/^Corresponding Performance/)).toBeInTheDocument();
    expect(screen.getByTitle(/^Download filtered Report/)).toBeInTheDocument();

    // Powerfilter
    const powerFilter = within(screen.queryPowerFilter());
    const inputs = powerFilter.queryTextInputs();
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    const select = powerFilter.getByTitle('Loaded filter');
    expect(select).toHaveValue('foo');

    expect(
      screen.getByRole('heading', {name: /Report: Mon/}),
    ).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer TimeDone',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /^ID:/})).toHaveTextContent(
      '1234',
    );
    expect(entityInfo.getByRole('row', {name: /^Created:/})).toHaveTextContent(
      'Sun, Jun 2, 2019 2:00 PM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /^Modified:/})).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /^Owner:/})).toHaveTextContent(
      'admin',
    );

    // Tabs
    expect(
      screen.getByRole('tab', {name: /^information/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^results/i})).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^user tags/i})).toBeInTheDocument();

    const taskName = screen.getByRole('row', {name: /^Task Name/});
    expect(taskName).toHaveTextContent('foo');
    expect(within(taskName).getByRole('link')).toHaveAttribute(
      'href',
      '/audit/314',
    );
    expect(screen.getByRole('row', {name: /^Comment/})).toHaveTextContent(
      'bar',
    );

    const reportRow1 = screen.getByRole('row', {name: /^Report 1/});
    expect(reportRow1).toHaveTextContent('1234');
    expect(within(reportRow1).getByRole('link')).toHaveAttribute(
      'href',
      '/audit-report/1234',
    );
    expect(
      screen.getByRole('row', {name: /^Scan Time Report 1/}),
    ).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time - Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
    );
    expect(
      screen.getByRole('row', {name: /^Scan Duration Report 1/}),
    ).toHaveTextContent('0:31 h');
    expect(
      screen.getByRole('row', {name: /^Scan Status Report 1/}),
    ).toHaveTextContent('Done');

    const reportRow2 = screen.getByRole('row', {name: /^Report 2/});
    expect(reportRow2).toHaveTextContent('5678');
    expect(within(reportRow2).getByRole('link')).toHaveAttribute(
      'href',
      '/audit-report/5678',
    );
    expect(
      screen.getByRole('row', {name: /^Scan Time Report 2/}),
    ).toHaveTextContent(
      'Mon, May 20, 2019 2:00 PM Central European Summer Time - Mon, May 20, 2019 2:30 PM Central European Summer Time',
    );
    expect(
      screen.getByRole('row', {name: /^Scan Duration Report 2/}),
    ).toHaveTextContent('0:30 h');
    expect(
      screen.getByRole('row', {name: /^Scan Status Report 2/}),
    ).toHaveTextContent('Done');
    expect(screen.getByRole('row', {name: /^Hosts scanned/})).toHaveTextContent(
      '3',
    );
    expect(screen.getByRole('row', {name: /^Filter/})).toHaveTextContent(
      'apply_overrides=0 compliance_levels=ynui min_qod=70',
    );
    expect(screen.getByRole('row', {name: /^Timezone/})).toHaveTextContent(
      'UTC (UTC)',
    );
  });

  test('should render results tab', () => {
    const onAddToAssetsClick = testing.fn();
    const onError = testing.fn();
    const onFilterAddLogLevelClick = testing.fn();
    const onFilterDecreaseMinQoDClick = testing.fn();
    const onFilterChanged = testing.fn();
    const onFilterCreated = testing.fn();
    const onFilterEditClick = testing.fn();
    const onFilterRemoveSeverityClick = testing.fn();
    const onFilterResetClick = testing.fn();
    const onFilterRemoveClick = testing.fn();
    const onRemoveFromAssetsClick = testing.fn();
    const onReportDownloadClick = testing.fn();
    const showError = testing.fn();
    const showErrorMessage = testing.fn();
    const showSuccessMessage = testing.fn();
    const onSortChange = testing.fn();
    const onTagSuccess = testing.fn();
    const onTargetEditClick = testing.fn();
    const onTlsCertificateDownloadClick = testing.fn();
    const sorting = {
      apps: {sortField: 'severity', sortReverse: true},
      closedcves: {sortField: 'severity', sortReverse: true},
      cves: {sortField: 'severity', sortReverse: true},
      errors: {sortField: 'error', sortReverse: true},
      hosts: {sortField: 'severity', sortReverse: true},
      os: {sortField: 'severity', sortReverse: true},
      ports: {sortField: 'severity', sortReverse: true},
      results: {sortField: 'severity', sortReverse: true},
      tlscerts: {sortField: 'dn', sortReverse: true},
    };
    const {entity} = getMockAuditDeltaReport();
    const filters = [filterWithName];
    const gmp = createGmp();
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <DeltaDetailsContent
        audit={true}
        entity={entity}
        filter={filter}
        filters={filters}
        isLoading={false}
        isUpdating={false}
        reportId={entity.report.id}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
        sortField={sorting.results.sortField}
        sortReverse={sorting.results.sortReverse}
        sorting={sorting}
        task={entity.report.task}
        onAddToAssetsClick={onAddToAssetsClick}
        onError={onError}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterChanged={onFilterChanged}
        onFilterCreated={onFilterCreated}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        onFilterResetClick={onFilterResetClick}
        onRemoveFromAssetsClick={onRemoveFromAssetsClick}
        onReportDownloadClick={onReportDownloadClick}
        onSortChange={onSortChange}
        onTagSuccess={onTagSuccess}
        onTargetEditClick={onTargetEditClick}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );
    const resultsTab = screen.getByRole('tab', {name: /Results/});
    fireEvent.click(resultsTab);

    // Headings
    const header = screen.getAllByRole('columnheader');
    expect(header[0]).toHaveTextContent('Delta');
    expect(header[1]).toHaveTextContent('Vulnerability');
    expect(header[3]).toHaveTextContent('Compliant');
    expect(header[4]).toHaveTextContent('QoD');
    expect(header[5]).toHaveTextContent('Host');
    expect(header[6]).toHaveTextContent('Location');
    expect(header[7]).toHaveTextContent('Created');
    expect(header[8]).toHaveTextContent('IP');
    expect(header[9]).toHaveTextContent('Name');

    // Row 1
    const row1 = screen.getByRole('row', {name: /Result 1/});
    expect(within(row1).getByTestId('equal-icon')).toBeVisible();
    expect(row1).toHaveTextContent(
      'Yes80 %123.456.78.91080/tcpMon, Jun 3, 2019 1:06 PM Central European Summer Time',
    );

    // Row 2
    const row2 = screen.getByRole('row', {name: /Result 2/});
    expect(within(row2).getByTestId('equal-icon')).toBeVisible();
    expect(row2).toHaveTextContent(
      'Incomplete70 %109.876.54.32180/tcpMon, Jun 3, 2019 1:06 PM Central European Summer Time',
    );

    // displayed Filter
    expect(
      screen.getByText(
        '(Applied filter: apply_overrides=0 compliance_levels=ynui rows=10 min_qod=70 first=1 sort=compliant)',
      ),
    ).toBeInTheDocument();
  });
});
