/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {screen, within, rendererWith} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import {getMockAuditReport} from 'web/pages/reports/__mocks__/MockAuditReport';
import DetailsContent from 'web/pages/reports/AuditDetailsContent';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const filter = Filter.fromString(
  'apply_overrides=0 compliance_levels=ynui rows=10 min_qod=70 first=1 sort=compliant',
);

const filterWithName = Filter.fromElement({
  term: 'apply_overrides=0 compliance_levels=ynui rows=10 min_qod=70 first=1 sort=compliant',
  name: 'foo',
  id: '123',
});

const resetFilter = Filter.fromString(
  'first=1 compliance_levels=ynui sort=compliant',
);

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

const currentSettings = testing.fn().mockResolvedValue({
  foo: 'bar',
});

const getReportComposerDefaults = testing.fn().mockResolvedValue({
  foo: 'bar',
});

describe('Audit Report Details Content tests', () => {
  test('should render Audit Report Details Content', () => {
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

    const {entity} = getMockAuditReport();

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
      <DetailsContent
        activeTab={0}
        applicationsCounts={{all: 4, filtered: 4}}
        closedCvesCounts={{all: 2, filtered: 2}}
        cvesCounts={{all: 2, filtered: 2}}
        entity={entity}
        errorsCounts={{all: 2, filtered: 2}}
        filters={filters}
        hostsCounts={{all: 2, filtered: 2}}
        isLoading={false}
        isUpdating={false}
        operatingSystemsCounts={{all: 2, filtered: 2}}
        pageFilter={filter}
        portsCounts={{all: 2, filtered: 2}}
        reportFilter={filter}
        reportId={entity.report.id}
        resetFilter={resetFilter}
        resultsCounts={{all: 3, filtered: 2}}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
        sorting={sorting}
        task={entity.report.task}
        tlsCertificatesCounts={{all: 2, filtered: 2}}
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
    const inputs = baseElement.querySelectorAll('input');
    const links = baseElement.querySelectorAll('a');
    const tableData = baseElement.querySelectorAll('td');
    const powerFilter = within(screen.queryPowerFilter());
    const bars = screen.getAllByTestId('progressbar-box');

    // Toolbar Icons
    expect(icons.length).toEqual(16);

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    const input = powerFilter.getByTitle('Loaded filter');
    expect(input).toHaveAttribute('placeholder', 'Loading...');

    // Header
    expect(baseElement).toHaveTextContent(
      'Report:Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(bars[0]).toHaveAttribute('title', 'Done');
    expect(bars[0]).toHaveTextContent('Done');
    expect(baseElement).toHaveTextContent(
      'Created:Sun, Jun 2, 2019 2:00 PM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    // Tabs
    expect(baseElement).toHaveTextContent('Information');
    expect(baseElement).toHaveTextContent('Results(2 of 3)');
    expect(baseElement).toHaveTextContent('Hosts(2 of 2)');
    expect(baseElement).toHaveTextContent('Operating Systems(2 of 2)');
    expect(baseElement).toHaveTextContent('TLS Certificates(2 of 2)');
    expect(baseElement).toHaveTextContent('Error Messages(2 of 2)');
    expect(baseElement).toHaveTextContent('User Tags(0)');

    // Summary
    expect(tableData[0]).toHaveTextContent('Task Name');
    expect(links[7]).toHaveAttribute('href', '/task/314');
    expect(tableData[1]).toHaveTextContent('foo');

    expect(tableData[2]).toHaveTextContent('Comment');
    expect(tableData[3]).toHaveTextContent('bar');

    expect(tableData[4]).toHaveTextContent('Scan Time');
    expect(tableData[5]).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time - Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
    );

    expect(tableData[6]).toHaveTextContent('Scan Duration');
    expect(tableData[7]).toHaveTextContent('0:31 h');

    expect(tableData[8]).toHaveTextContent('Scan Status');
    expect(bars[1]).toHaveAttribute('title', 'Done');
    expect(bars[1]).toHaveTextContent('Done');

    expect(tableData[10]).toHaveTextContent('Hosts scanned');
    expect(tableData[11]).toHaveTextContent('3');

    expect(tableData[12]).toHaveTextContent('Filter');
    expect(tableData[13]).toHaveTextContent(
      'apply_overrides=0 compliance_levels=ynui min_qod=70',
    );

    expect(tableData[14]).toHaveTextContent('Timezone');
    expect(tableData[15]).toHaveTextContent('UTC (UTC)');
  });

  test('should render audit threshold panel', () => {
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

    const {entity} = getMockAuditReport();

    const filters = [filterWithName];

    const gmp = {
      settings: {manualUrl, reportResultsThreshold: 1},
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
      <DetailsContent
        activeTab={2}
        applicationsCounts={{all: 4, filtered: 4}}
        closedCvesCounts={{all: 2, filtered: 2}}
        cvesCounts={{all: 2, filtered: 2}}
        entity={entity}
        errorsCounts={{all: 2, filtered: 2}}
        filters={filters}
        hostsCounts={{all: 2, filtered: 2}}
        isLoading={false}
        isUpdating={false}
        operatingSystemsCounts={{all: 2, filtered: 2}}
        pageFilter={filter}
        portsCounts={{all: 2, filtered: 2}}
        reportFilter={filter}
        reportId={entity.report.id}
        resetFilter={resetFilter}
        resultsCounts={{all: 3, filtered: 2}}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
        sorting={sorting}
        task={entity.report.task}
        tlsCertificatesCounts={{all: 2, filtered: 2}}
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
    const powerFilter = within(screen.queryPowerFilter());
    const inputs = powerFilter.queryTextInputs();
    const bars = screen.getAllByTestId('progressbar-box');

    // Toolbar Icons
    expect(icons.length).toEqual(20);

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    const input = powerFilter.getByTitle('Loaded filter');
    expect(input).toHaveAttribute('placeholder', 'Loading...');

    // Header
    expect(baseElement).toHaveTextContent(
      'Report:Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(bars[0]).toHaveAttribute('title', 'Done');
    expect(bars[0]).toHaveTextContent('Done');
    expect(baseElement).toHaveTextContent(
      'Created:Sun, Jun 2, 2019 2:00 PM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent(
      'Modified:Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent('Owner:admin');

    // Tabs
    expect(baseElement).toHaveTextContent('Information');
    expect(baseElement).toHaveTextContent('Results(2 of 3)');
    expect(baseElement).toHaveTextContent('Hosts(2 of 2)');
    expect(baseElement).toHaveTextContent('Operating Systems(2 of 2)');
    expect(baseElement).toHaveTextContent('TLS Certificates(2 of 2)');
    expect(baseElement).toHaveTextContent('Error Messages(2 of 2)');
    expect(baseElement).toHaveTextContent('User Tags(0)');

    // Should include
    expect(baseElement).toHaveTextContent(
      "The Hosts cannot be displayed in order to maintain the performance within the browser's capabilities.",
    );
    expect(baseElement).toHaveTextContent(
      'Please decrease the number of results below the threshold of 1 by applying a more refined filter.',
    );

    expect(baseElement).toHaveTextContent(
      'Results with compliance "Yes" are currently included.',
    );

    expect(baseElement).toHaveTextContent(
      'Filter out results with compliance "Yes".',
    );

    expect(baseElement).toHaveTextContent(
      'Results with compliance "Undefined" are currently included.',
    );

    expect(baseElement).toHaveTextContent(
      'Filter out results with compliance "Undefined".',
    );

    expect(baseElement).toHaveTextContent(
      'Results with compliance "Incomplete" are currently included.',
    );
    expect(baseElement).toHaveTextContent(
      'Filter out results with compliance "Incomplete".',
    );

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too unrefined.',
    );

    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 compliance_levels=ynui min_qod=70)',
    );

    // // Should not Include
    expect(baseElement).not.toHaveTextContent('IP-Adress');
    expect(baseElement).not.toHaveTextContent('Hostname');
    expect(baseElement).not.toHaveTextContent('Apps');
    expect(baseElement).not.toHaveTextContent('Distance');
  });
});
