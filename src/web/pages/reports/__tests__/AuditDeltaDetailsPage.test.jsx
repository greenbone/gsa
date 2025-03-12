/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import React from 'react';
import {
  queryPowerFilter,
  getSelectElement,
  queryTextInputs,
} from 'web/components/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import {getMockAuditDeltaReport} from 'web/pages/reports/__mocks__/MockAuditDeltaReport';
import DeltaDetailsContent from 'web/pages/reports/DeltaDetailsContent';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith} from 'web/utils/Testing';

const filter = Filter.fromString(
  'apply_overrides=0 compliance_levels=ynui rows=10 min_qod=70 first=1 sort=compliant',
);

const filterWithName = Filter.fromElement({
  term: 'apply_overrides=0 compliance_levels=ynui rows=10 min_qod=70 first=1 sort=compliant',
  name: 'foo',
  id: '123',
});

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

const getReportComposerDefaults = testing.fn().mockResolvedValue({
  foo: 'bar',
});

describe('Audit Delta Report Details Content tests', () => {
  test('should render Audit Delta Report Details Content', () => {
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
      errors: {sortField: 'error', sortReverse: true},
      hosts: {sortField: 'compliant', sortReverse: true},
      os: {sortField: 'compliant', sortReverse: true},
      results: {sortField: 'compliant', sortReverse: true},
      tlscerts: {sortField: 'dn', sortReverse: true},
    };

    const {entity} = getMockAuditDeltaReport();

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

    const {baseElement, getAllByTestId, within} = render(
      <DeltaDetailsContent
        activeTab={0}
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

    const icons = baseElement.querySelectorAll('svg');
    const links = baseElement.querySelectorAll('a');
    const tableData = baseElement.querySelectorAll('td');
    const powerFilter = queryPowerFilter();
    const inputs = queryTextInputs(powerFilter);
    const select = getSelectElement(powerFilter);
    const bars = getAllByTestId('progressbar-box');

    // Toolbar Icons
    expect(icons.length).toEqual(15);

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');

    const input = within(select).getByTitle('Loaded filter');
    expect(input).toHaveValue('foo');

    // Header
    expect(baseElement).toHaveTextContent(
      'Report:Mon, Jun 3, 2019 1:00 PM CEST',
    );
    expect(bars[0]).toHaveAttribute('title', 'Done');
    expect(bars[0]).toHaveTextContent('Done');
    expect(baseElement).toHaveTextContent(
      'Created:Sun, Jun 2, 2019 2:00 PM CEST',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jun 3, 2019 1:00 PM CEST',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    // Tabs
    expect(baseElement).toHaveTextContent('Information');
    expect(baseElement).toHaveTextContent('Results(2)');
    expect(baseElement).toHaveTextContent('User Tags(0)');

    // Summary
    expect(tableData[0]).toHaveTextContent('Task Name');
    expect(links[6]).toHaveAttribute('href', '/task/314');
    expect(tableData[1]).toHaveTextContent('foo');

    expect(tableData[2]).toHaveTextContent('Comment');
    expect(tableData[3]).toHaveTextContent('bar');

    expect(tableData[4]).toHaveTextContent('Report 1');
    expect(links[7]).toHaveAttribute('href', '/auditreport/1234');
    expect(tableData[5]).toHaveTextContent('1234');

    expect(tableData[6]).toHaveTextContent('Scan Time Report 1');
    expect(tableData[7]).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM CEST - Mon, Jun 3, 2019 1:31 PM CEST',
    );

    expect(tableData[8]).toHaveTextContent('Scan Duration Report 1');
    expect(tableData[9]).toHaveTextContent('0:31 h');

    expect(tableData[10]).toHaveTextContent('Scan Status Report 1');
    expect(bars[1]).toHaveTextContent('Done');

    expect(tableData[12]).toHaveTextContent('Report 2');
    expect(links[8]).toHaveAttribute('href', '/auditreport/5678');
    expect(tableData[13]).toHaveTextContent('5678');

    expect(tableData[14]).toHaveTextContent('Scan Time Report 2');
    expect(tableData[15]).toHaveTextContent(
      'Mon, May 20, 2019 2:00 PM CEST - Mon, May 20, 2019 2:30 PM CEST',
    );

    expect(tableData[16]).toHaveTextContent('Scan Duration Report 2');
    expect(tableData[17]).toHaveTextContent('0:30 h');

    expect(tableData[18]).toHaveTextContent('Scan Status Report 2');
    expect(bars[2]).toHaveTextContent('Done');

    expect(tableData[20]).toHaveTextContent('Hosts scanned');
    expect(tableData[21]).toHaveTextContent('3');

    expect(tableData[22]).toHaveTextContent('Filter');
    expect(tableData[23]).toHaveTextContent(
      'apply_overrides=0 compliance_levels=ynui min_qod=70',
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

    const {entity} = getMockAuditDeltaReport();

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

    const {baseElement, getAllByTestId, within} = render(
      <DeltaDetailsContent
        activeTab={1}
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

    const icons = baseElement.querySelectorAll('svg');
    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const powerFilter = queryPowerFilter();
    const inputs = queryTextInputs(powerFilter);
    const select = getSelectElement(powerFilter);

    // PowerFilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');

    const input = within(select).getByTitle('Loaded filter');
    expect(input).toHaveValue('--');

    const bars = getAllByTestId('progressbar-box');

    // Toolbar Icons
    expect(icons.length).toEqual(33);

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');

    // Header
    expect(baseElement).toHaveTextContent(
      'Report:Mon, Jun 3, 2019 1:00 PM CEST',
    );
    expect(bars[0]).toHaveAttribute('title', 'Done');
    expect(bars[0]).toHaveTextContent('Done');
    expect(baseElement).toHaveTextContent(
      'Created:Sun, Jun 2, 2019 2:00 PM CEST',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jun 3, 2019 1:00 PM CEST',
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
    expect(header[3]).toHaveTextContent('Compliant');
    expect(header[4]).toHaveTextContent('QoD');
    expect(header[5]).toHaveTextContent('Host');
    expect(header[6]).toHaveTextContent('Location');
    expect(header[7]).toHaveTextContent('Created');
    expect(header[8]).toHaveTextContent('IP');
    expect(header[9]).toHaveTextContent('Name');

    // Row 1
    expect(rows[2]).toHaveTextContent('[ = ]');
    expect(rows[2]).toHaveTextContent('Result 1');
    expect(bars[1]).toHaveAttribute('title', 'Yes');
    expect(bars[1]).toHaveTextContent('Yes');
    expect(rows[2]).toHaveTextContent('80 %');
    expect(rows[2]).toHaveTextContent('123.456.78.910');
    expect(rows[2]).toHaveTextContent('80/tcp');
    expect(rows[2]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Row 2
    expect(rows[3]).toHaveTextContent('[ = ]');
    expect(rows[3]).toHaveTextContent('Result 2');
    expect(bars[2]).toHaveAttribute('title', 'Incomplete');
    expect(bars[2]).toHaveTextContent('Incomplete');
    expect(rows[3]).toHaveTextContent('70 %');
    expect(rows[3]).toHaveTextContent('109.876.54.321');
    expect(rows[3]).toHaveTextContent('80/tcp');
    expect(rows[3]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 compliance_levels=ynui rows=10 min_qod=70 first=1 sort=compliant)',
    );
  });
});
