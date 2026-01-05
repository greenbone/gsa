/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {screen, within, rendererWith, fireEvent} from 'web/testing';
import Filter from 'gmp/models/filter';
import {getMockAuditReport} from 'web/pages/reports/__fixtures__/MockAuditReport';
import AuditReportDetailsContent from 'web/pages/reports/AuditReportDetailsContent';
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

const manualUrl = 'test/';

const createGmp = ({
  currentSettingsResponse = {foo: 'bar'},
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

describe('AuditReportDetailsContent tests', () => {
  test('should render Audit Report Details Content', () => {
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
    const {entity} = getMockAuditReport();
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
      <AuditReportDetailsContent
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
    const correspondingTlsCertificates = screen.getByTitle(
      /^Corresponding TLS Certificates/,
    );
    expect(correspondingTlsCertificates).toHaveAttribute(
      'href',
      '/tlscertificates?filter=report_id%3D1234',
    );
    expect(screen.getByTitle(/^Corresponding Performance/)).toBeInTheDocument();
    expect(screen.getByTitle(/^Download filtered Report/)).toBeInTheDocument();
    expect(screen.getByTitle(/^Trigger Alert/)).toBeInTheDocument();

    const powerFilter = within(screen.queryPowerFilter());
    const inputs = powerFilter.queryTextInputs();

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    const input = powerFilter.getByTitle('Loaded filter');
    expect(input).toHaveAttribute('placeholder', 'Loading...');

    expect(screen.getByRole('heading', {name: /Report:/})).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer TimeDone',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
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
    expect(screen.getByRole('tab', {name: /^hosts/i})).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^operating systems/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^tls certificates/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^error messages/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^user tags/i})).toBeInTheDocument();

    // Summary
    const taskName = screen.getByRole('row', {name: /^Task Name/});
    expect(taskName).toHaveTextContent('foo');
    expect(within(taskName).getByRole('link')).toHaveAttribute(
      'href',
      '/audit/314',
    );
    expect(screen.getByRole('row', {name: /^Comment/})).toHaveTextContent(
      'bar',
    );
    expect(screen.getByRole('row', {name: /^Scan Time/})).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time - Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
    );
    expect(screen.getByRole('row', {name: /^Scan Duration/})).toHaveTextContent(
      '0:31 h',
    );
    expect(screen.getByRole('row', {name: /^Scan Status/})).toHaveTextContent(
      'Done',
    );
    expect(screen.getByRole('row', {name: /^Hosts scanned/})).toHaveTextContent(
      '3',
    );
    expect(
      screen.getByRole('row', {name: /^Filter apply_overrides/}),
    ).toHaveTextContent('apply_overrides=0 compliance_levels=ynui min_qod=70');

    expect(screen.getByRole('row', {name: /^Timezone/})).toHaveTextContent(
      'UTC (UTC)',
    );
  });

  test('should render hosts tab', () => {
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
    const {entity} = getMockAuditReport();
    const filters = [filterWithName];
    const gmp = createGmp({reportResultsThreshold: 1});
    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <AuditReportDetailsContent
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
    const resultsTab = screen.getByRole('tab', {name: /Hosts/});
    fireEvent.click(resultsTab);

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
    expect(baseElement).not.toHaveTextContent('IP-Address');
    expect(baseElement).not.toHaveTextContent('Hostname');
    expect(baseElement).not.toHaveTextContent('Apps');
    expect(baseElement).not.toHaveTextContent('Distance');
  });
});
