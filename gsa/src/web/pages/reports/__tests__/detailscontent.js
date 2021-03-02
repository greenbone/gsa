/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import Capabilities from 'gmp/capabilities/capabilities';
import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith} from 'web/utils/testing';

import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';

import DetailsContent from '../detailscontent';

setLocale('en');

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const filterWithName = Filter.fromElement({
  term:
    'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
  name: 'foo',
  id: '123',
});

const resetFilter = Filter.fromString('first=1 sort-reverse=severity');

const caps = new Capabilities(['everything']);

const manualUrl = 'test/';

let currentSettings;
let getReportComposerDefaults;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getReportComposerDefaults = jest.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Report Details Content tests', () => {
  test('should render Report Details Content', () => {
    const onActivateTab = jest.fn();
    const onAddToAssetsClick = jest.fn();
    const onError = jest.fn();
    const onFilterAddLogLevelClick = jest.fn();
    const onFilterDecreaseMinQoDClick = jest.fn();
    const onFilterChanged = jest.fn();
    const onFilterCreated = jest.fn();
    const onFilterEditClick = jest.fn();
    const onFilterRemoveSeverityClick = jest.fn();
    const onFilterResetClick = jest.fn();
    const onFilterRemoveClick = jest.fn();
    const onInteraction = jest.fn();
    const onRemoveFromAssetsClick = jest.fn();
    const onReportDownloadClick = jest.fn();
    const showError = jest.fn();
    const showErrorMessage = jest.fn();
    const showSuccessMessage = jest.fn();
    const onSortChange = jest.fn();
    const onTagSuccess = jest.fn();
    const onTargetEditClick = jest.fn();
    const onTlsCertificateDownloadClick = jest.fn();

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

    const {entity} = getMockReport();

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

    const {baseElement, getAllByTestId} = render(
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
        resultsCounts={{all: 3, filtered: 2}}
        reportFilter={filter}
        reportId={entity.report.id}
        resetFilter={resetFilter}
        sorting={sorting}
        task={entity.report.task}
        tlsCertificatesCounts={{all: 2, filtered: 2}}
        onActivateTab={onActivateTab}
        onAddToAssetsClick={onAddToAssetsClick}
        onError={onError}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterChanged={onFilterChanged}
        onFilterCreated={onFilterCreated}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        onFilterResetClick={onFilterResetClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onInteraction={onInteraction}
        onRemoveFromAssetsClick={onRemoveFromAssetsClick}
        onReportDownloadClick={onReportDownloadClick}
        onSortChange={onSortChange}
        onTagSuccess={onTagSuccess}
        onTargetEditClick={onTargetEditClick}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');
    const inputs = baseElement.querySelectorAll('input');
    const links = baseElement.querySelectorAll('a');
    const tableData = baseElement.querySelectorAll('td');
    const selects = getAllByTestId('select-selected-value');
    const bars = getAllByTestId('progressbar-box');

    // Toolbar Icons
    expect(icons[0]).toHaveTextContent('help.svg');
    expect(icons[1]).toHaveTextContent('list.svg');
    expect(icons[2]).toHaveTextContent('add_to_assets.svg');
    expect(icons[3]).toHaveTextContent('remove_from_assets.svg');
    expect(icons[4]).toHaveTextContent('task.svg');
    expect(icons[5]).toHaveTextContent('result.svg');
    expect(icons[6]).toHaveTextContent('vulnerability.svg');
    expect(icons[7]).toHaveTextContent('tlscertificate.svg');
    expect(icons[8]).toHaveTextContent('performance.svg');
    expect(icons[9]).toHaveTextContent('download.svg');
    expect(icons[10]).toHaveTextContent('start.svg');

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(icons[11]).toHaveTextContent('refresh.svg');
    expect(icons[12]).toHaveTextContent('delete.svg');
    expect(icons[13]).toHaveTextContent('reset.svg');
    expect(icons[14]).toHaveTextContent('help.svg');
    expect(icons[15]).toHaveTextContent('edit.svg');
    expect(selects[0]).toHaveAttribute('title', 'Loaded filter');
    expect(selects[0]).toHaveTextContent('Loading...');

    // Header
    expect(icons[16]).toHaveTextContent('report.svg');
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
    expect(baseElement).toHaveTextContent('Results(2 of 3)');
    expect(baseElement).toHaveTextContent('Hosts(2 of 2)');
    expect(baseElement).toHaveTextContent('Ports(2 of 2)');
    expect(baseElement).toHaveTextContent('Applications(4 of 4)');
    expect(baseElement).toHaveTextContent('Operating Systems(2 of 2)');
    expect(baseElement).toHaveTextContent('CVEs(2 of 2)');
    expect(baseElement).toHaveTextContent('Closed CVEs(2 of 2)');
    expect(baseElement).toHaveTextContent('TLS Certificates(2 of 2)');
    expect(baseElement).toHaveTextContent('Error Messages(2 of 2)');
    expect(baseElement).toHaveTextContent('User Tags(0)');

    // Summary
    expect(tableData[0]).toHaveTextContent('Task Name');
    expect(links[8]).toHaveAttribute('href', '/task/314');
    expect(tableData[1]).toHaveTextContent('foo');

    expect(tableData[2]).toHaveTextContent('Comment');
    expect(tableData[3]).toHaveTextContent('bar');

    expect(tableData[4]).toHaveTextContent('Scan Time');
    expect(tableData[5]).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM CEST - Mon, Jun 3, 2019 1:31 PM CEST',
    );

    expect(tableData[6]).toHaveTextContent('Scan Duration');
    expect(tableData[7]).toHaveTextContent('0:31 h');

    expect(tableData[8]).toHaveTextContent('Scan Status');
    expect(bars[1]).toHaveAttribute('title', 'Done');
    expect(bars[1]).toHaveTextContent('Done');

    expect(tableData[10]).toHaveTextContent('Hosts scanned');
    expect(tableData[11]).toHaveTextContent('2');

    expect(tableData[12]).toHaveTextContent('Filter');
    expect(tableData[13]).toHaveTextContent(
      'apply_overrides=0 levels=hml min_qod=70',
    );

    expect(tableData[14]).toHaveTextContent('Timezone');
    expect(tableData[15]).toHaveTextContent('UTC (UTC)');
  });

  test('should render threshold panel', () => {
    const onActivateTab = jest.fn();
    const onAddToAssetsClick = jest.fn();
    const onError = jest.fn();
    const onFilterAddLogLevelClick = jest.fn();
    const onFilterDecreaseMinQoDClick = jest.fn();
    const onFilterChanged = jest.fn();
    const onFilterCreated = jest.fn();
    const onFilterEditClick = jest.fn();
    const onFilterRemoveSeverityClick = jest.fn();
    const onFilterResetClick = jest.fn();
    const onFilterRemoveClick = jest.fn();
    const onInteraction = jest.fn();
    const onRemoveFromAssetsClick = jest.fn();
    const onReportDownloadClick = jest.fn();
    const showError = jest.fn();
    const showErrorMessage = jest.fn();
    const showSuccessMessage = jest.fn();
    const onSortChange = jest.fn();
    const onTagSuccess = jest.fn();
    const onTargetEditClick = jest.fn();
    const onTlsCertificateDownloadClick = jest.fn();

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

    const {entity} = getMockReport();

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

    const {baseElement, getAllByTestId} = render(
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
        sorting={sorting}
        task={entity.report.task}
        tlsCertificatesCounts={{all: 2, filtered: 2}}
        onActivateTab={onActivateTab}
        onAddToAssetsClick={onAddToAssetsClick}
        onError={onError}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterChanged={onFilterChanged}
        onFilterCreated={onFilterCreated}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        onFilterResetClick={onFilterResetClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onInteraction={onInteraction}
        onRemoveFromAssetsClick={onRemoveFromAssetsClick}
        onReportDownloadClick={onReportDownloadClick}
        onSortChange={onSortChange}
        onTagSuccess={onTagSuccess}
        onTargetEditClick={onTargetEditClick}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');
    const inputs = baseElement.querySelectorAll('input');
    const selects = getAllByTestId('select-selected-value');
    const bars = getAllByTestId('progressbar-box');

    // Toolbar Icons
    expect(icons[0]).toHaveTextContent('help.svg');
    expect(icons[1]).toHaveTextContent('list.svg');
    expect(icons[2]).toHaveTextContent('add_to_assets.svg');
    expect(icons[3]).toHaveTextContent('remove_from_assets.svg');
    expect(icons[4]).toHaveTextContent('task.svg');
    expect(icons[5]).toHaveTextContent('result.svg');
    expect(icons[6]).toHaveTextContent('vulnerability.svg');
    expect(icons[7]).toHaveTextContent('tlscertificate.svg');
    expect(icons[8]).toHaveTextContent('performance.svg');
    expect(icons[9]).toHaveTextContent('download.svg');
    expect(icons[10]).toHaveTextContent('start.svg');

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(icons[11]).toHaveTextContent('refresh.svg');
    expect(icons[12]).toHaveTextContent('delete.svg');
    expect(icons[13]).toHaveTextContent('reset.svg');
    expect(icons[14]).toHaveTextContent('help.svg');
    expect(icons[15]).toHaveTextContent('edit.svg');
    expect(selects[0]).toHaveAttribute('title', 'Loaded filter');
    expect(selects[0]).toHaveTextContent('Loading...');

    // Header
    expect(icons[16]).toHaveTextContent('report.svg');
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
    expect(baseElement).toHaveTextContent('Results(2 of 3)');
    expect(baseElement).toHaveTextContent('Hosts(2 of 2)');
    expect(baseElement).toHaveTextContent('Ports(2 of 2)');
    expect(baseElement).toHaveTextContent('Applications(4 of 4)');
    expect(baseElement).toHaveTextContent('Operating Systems(2 of 2)');
    expect(baseElement).toHaveTextContent('CVEs(2 of 2)');
    expect(baseElement).toHaveTextContent('Closed CVEs(2 of 2)');
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
      'Results with the severity "Low" are currently included.',
    );
    expect(icons[17]).toHaveTextContent('filter.svg');
    expect(baseElement).toHaveTextContent(
      'Filter out results with the severity "Low".',
    );

    expect(baseElement).toHaveTextContent(
      'Results with the severity "Medium" are currently included.',
    );
    expect(icons[18]).toHaveTextContent('filter.svg');
    expect(baseElement).toHaveTextContent(
      'Filter out results with the severity "Medium".',
    );

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too unrefined.',
    );
    expect(icons[19]).toHaveTextContent('edit.svg');
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml min_qod=70)',
    );

    // Should not Include
    expect(baseElement).not.toHaveTextContent('IP-Adress');
    expect(baseElement).not.toHaveTextContent('Hostname');
    expect(baseElement).not.toHaveTextContent('Apps');
    expect(baseElement).not.toHaveTextContent('Distance');
  });
});
