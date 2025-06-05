/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockDeltaReport} from 'web/pages/reports/__mocks__/MockDeltaReport';
import DeltaDetailsContent from 'web/pages/reports/DeltaDetailsContent';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {screen, within, rendererWith} from 'web/testing';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const filterWithName = Filter.fromElement({
  term: 'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
  name: 'foo',
  id: '123',
});

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

const currentSettings = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const getReportComposerDefaults = testing.fn().mockResolvedValue({
  foo: 'bar',
});

describe('Delta Report Details Content tests', () => {
  test('should render Delta Report Details Content', () => {
    const onActivateTab = testing.fn();
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
    const onInteraction = testing.fn();
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

    const gmp = {
      settings: {manualUrl, reportResultsThreshold: 10},
      user: {currentSettings, getReportComposerDefaults},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <DeltaDetailsContent
        activeTab={0}
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
        onActivateTab={onActivateTab}
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
        onInteraction={onInteraction}
        onRemoveFromAssetsClick={onRemoveFromAssetsClick}
        onReportDownloadClick={onReportDownloadClick}
        onSortChange={onSortChange}
        onTagSuccess={onTagSuccess}
        onTargetEditClick={onTargetEditClick}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    const links = baseElement.querySelectorAll('a');
    const tableData = baseElement.querySelectorAll('td');
    const bars = screen.getAllByTestId('progressbar-box');
    const powerFilter = within(screen.queryPowerFilter());
    const select = powerFilter.getSelectElement();
    const inputs = powerFilter.queryTextInputs();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('foo');

    // Header
    expect(baseElement).toHaveTextContent(
      'Report:Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(bars[0]).toHaveAttribute('title', 'Done');
    expect(bars[0]).toHaveTextContent('Done');
    expect(baseElement).toHaveTextContent(
      'Created:Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    // Tabs
    expect(baseElement).toHaveTextContent('Information');
    expect(baseElement).toHaveTextContent('Results(2)');
    expect(baseElement).toHaveTextContent('User Tags(0)');

    // Summary
    expect(tableData[0]).toHaveTextContent('Task Name');
    expect(links[7]).toHaveAttribute('href', '/task/314');
    expect(tableData[1]).toHaveTextContent('foo');

    expect(tableData[2]).toHaveTextContent('Comment');
    expect(tableData[3]).toHaveTextContent('bar');

    expect(tableData[4]).toHaveTextContent('Report 1');
    expect(links[8]).toHaveAttribute('href', '/report/1234');
    expect(tableData[5]).toHaveTextContent('1234');

    expect(tableData[6]).toHaveTextContent('Scan Time Report 1');
    expect(tableData[7]).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time - Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
    );

    expect(tableData[8]).toHaveTextContent('Scan Duration Report 1');
    expect(tableData[9]).toHaveTextContent('0:31 h');

    expect(tableData[10]).toHaveTextContent('Scan Status Report 1');
    expect(bars[1]).toHaveTextContent('Done');

    expect(tableData[12]).toHaveTextContent('Report 2');
    expect(links[9]).toHaveAttribute('href', '/report/5678');
    expect(tableData[13]).toHaveTextContent('5678');

    expect(tableData[14]).toHaveTextContent('Scan Time Report 2');
    expect(tableData[15]).toHaveTextContent(
      'Mon, May 20, 2019 2:00 PM Central European Summer Time - Mon, May 20, 2019 2:30 PM Central European Summer Time',
    );

    expect(tableData[16]).toHaveTextContent('Scan Duration Report 2');
    expect(tableData[17]).toHaveTextContent('0:30 h');

    expect(tableData[18]).toHaveTextContent('Scan Status Report 2');
    expect(bars[2]).toHaveTextContent('Done');

    expect(tableData[20]).toHaveTextContent('Hosts scanned');
    expect(tableData[21]).toHaveTextContent('2');

    expect(tableData[22]).toHaveTextContent('Filter');
    expect(tableData[23]).toHaveTextContent(
      'apply_overrides=0 levels=hml min_qod=70',
    );

    expect(tableData[24]).toHaveTextContent('Timezone');
    expect(tableData[25]).toHaveTextContent('UTC (UTC)');
  });

  test('should render results tab', () => {
    const onActivateTab = testing.fn();
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
    const onInteraction = testing.fn();
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

    const gmp = {
      settings: {
        manualUrl,
        reportResultsThreshold: 10,
        severityRating: SEVERITY_RATING_CVSS_3,
      },
      user: {currentSettings, getReportComposerDefaults},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <DeltaDetailsContent
        activeTab={1}
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
        onActivateTab={onActivateTab}
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
        onInteraction={onInteraction}
        onRemoveFromAssetsClick={onRemoveFromAssetsClick}
        onReportDownloadClick={onReportDownloadClick}
        onSortChange={onSortChange}
        onTagSuccess={onTagSuccess}
        onTargetEditClick={onTargetEditClick}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const bars = screen.getAllByTestId('progressbar-box');
    const powerFilter = within(screen.queryPowerFilter());
    const select = powerFilter.getSelectElement();
    const inputs = powerFilter.queryTextInputs();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(select).toHaveAttribute('title', 'Loaded filter');
    expect(select).toHaveValue('--');

    // Header
    expect(baseElement).toHaveTextContent(
      'Report:Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(bars[0]).toHaveAttribute('title', 'Done');
    expect(bars[0]).toHaveTextContent('Done');
    expect(baseElement).toHaveTextContent(
      'Created:Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    // Tabs
    expect(baseElement).toHaveTextContent('Information');
    expect(baseElement).toHaveTextContent('Results(2)');
    expect(baseElement).toHaveTextContent('User Tags(0)');

    // Results

    // Headings
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
    expect(rows[2]).toHaveTextContent('[ = ]');
    expect(rows[2]).toHaveTextContent('Result 1');
    expect(bars[1]).toHaveAttribute('title', 'Critical');
    expect(bars[1]).toHaveTextContent('10.0 (Critical)');
    expect(rows[2]).toHaveTextContent('80 %');
    expect(rows[2]).toHaveTextContent('123.456.78.910');
    expect(rows[2]).toHaveTextContent('80/tcp');
    expect(rows[2]).toHaveTextContent(
      'Mon, Jun 3, 2019 1:06 PM Central European Summer Time',
    );

    // Row 2
    expect(rows[3]).toHaveTextContent('[ = ]');
    expect(rows[3]).toHaveTextContent('Result 2');
    expect(bars[2]).toHaveAttribute('title', 'Medium');
    expect(bars[2]).toHaveTextContent('5.0 (Medium)');
    expect(rows[3]).toHaveTextContent('70 %');
    expect(rows[3]).toHaveTextContent('109.876.54.321');
    expect(rows[3]).toHaveTextContent('80/tcp');
    expect(rows[3]).toHaveTextContent(
      'Mon, Jun 3, 2019 1:06 PM Central European Summer Time',
    );

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
