/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, within, rendererWith, fireEvent} from 'web/testing';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockDeltaReport} from 'web/pages/reports/__fixtures__/MockDeltaReport';
import DeltaDetailsContent from 'web/pages/reports/DeltaDetailsContent';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const filterWithName = Filter.fromElement({
  term: 'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
  name: 'foo',
  id: '123',
});

const manualUrl = 'test/';

const createGmp = ({
  currentSettingsResponse = {foo: 'bar'},
  getReportComposerDefaultsResponse = {foo: 'bar'},
  reportResultsThreshold = 10,
  severityRating = undefined,
  currentSettings = testing.fn().mockResolvedValue(currentSettingsResponse),
  getReportComposerDefaults = testing
    .fn()
    .mockResolvedValue(getReportComposerDefaultsResponse),
} = {}) => {
  return {
    settings: {
      manualUrl,
      reportResultsThreshold,
      severityRating,
    },
    user: {
      currentSettings,
      getReportComposerDefaults,
    },
  };
};

describe('DeltaReportDetailsContent tests', () => {
  test('should render Delta Report Details Content', () => {
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
    const {entity} = getMockDeltaReport();
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
        entity={entity}
        filter={filterWithName}
        filters={filters}
        isLoading={false}
        isUpdating={false}
        reportId={entity.report.id}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
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

    const powerFilter = within(screen.queryPowerFilter());
    const select = powerFilter.getByTestId('powerfilter-select');
    const inputs = powerFilter.queryTextInputs();

    // buttons
    const helpIcon = screen.getByTitle('Help: Reading Reports');
    expect(helpIcon.closest('a')).toHaveAttribute(
      'href',
      'test/en/reports.html#reading-a-report',
    );

    expect(screen.getByTitle('Reports List')).toBeInTheDocument();
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/reports',
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
    const correspondingVulnerabilities = screen.getByTitle(
      /^Corresponding Vulnerabilities/,
    );
    expect(correspondingVulnerabilities).toHaveAttribute(
      'href',
      '/vulnerabilities?filter=report_id%3D1234',
    );
    expect(screen.getByTitle(/^Corresponding Performance/)).toBeInTheDocument();
    expect(screen.getByTitle(/^Download filtered Report/)).toBeInTheDocument();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('foo');

    expect(
      screen.getByRole('heading', {name: /Report: Mon/}),
    ).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /^ID:/})).toHaveTextContent(
      '91011',
    );
    expect(entityInfo.getByRole('row', {name: /^Created:/})).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
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
      '/task/314',
    );
    expect(screen.getByRole('row', {name: /^Comment/})).toHaveTextContent(
      'bar',
    );

    const reportRow1 = screen.getByRole('row', {name: /^Report 1/});
    expect(reportRow1).toHaveTextContent('11234');
    expect(within(reportRow1).getByRole('link')).toHaveAttribute(
      'href',
      '/report/1234',
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
      '/report/5678',
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
      '2',
    );
    expect(screen.getByRole('row', {name: /^Filter/})).toHaveTextContent(
      'apply_overrides=0 levels=hml min_qod=70',
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
    const {entity} = getMockDeltaReport();
    const filters = [filterWithName];
    const gmp = createGmp({severityRating: SEVERITY_RATING_CVSS_3});
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
        entity={entity}
        filter={filter}
        filters={filters}
        isLoading={false}
        isUpdating={false}
        reportId={entity.report.id}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
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
    expect(header[3]).toHaveTextContent('Severity');
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
      '10.0 (Critical)80 %123.456.78.91080/tcpMon, Jun 3, 2019 1:06 PM Central European Summer Time',
    );

    // Row 2
    const row2 = screen.getByRole('row', {name: /Result 2/});
    expect(within(row2).getByTestId('equal-icon')).toBeVisible();
    expect(row2).toHaveTextContent(
      '5.0 (Medium)70 %109.876.54.32180/tcpMon, Jun 3, 2019 1:06 PM Central European Summer Time',
    );

    // displayed filter
    expect(
      screen.getByText(
        '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
      ),
    ).toBeInTheDocument();
  });
});
