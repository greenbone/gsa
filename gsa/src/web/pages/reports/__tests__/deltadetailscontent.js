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

import {getMockDeltaReport} from 'web/pages/reports/__mocks__/mockdeltareport';

import DeltaDetailsContent from '../deltadetailscontent';

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

describe('Delta Report Details Content tests', () => {
  test('should render Delta Report Details Content', () => {
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

    const {baseElement, getAllByTestId} = render(
      <DeltaDetailsContent
        activeTab={0}
        entity={entity}
        filter={filterWithName}
        filters={filters}
        isLoading={false}
        isUpdating={false}
        sorting={sorting}
        reportId={entity.report.id}
        task={entity.report.task}
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
    expect(icons[7]).toHaveTextContent('performance.svg');
    expect(icons[8]).toHaveTextContent('download.svg');

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(icons[9]).toHaveTextContent('refresh.svg');
    expect(icons[10]).toHaveTextContent('delete.svg');
    expect(icons[11]).toHaveTextContent('reset.svg');
    expect(icons[12]).toHaveTextContent('help.svg');
    expect(icons[13]).toHaveTextContent('edit.svg');
    expect(selects[0]).toHaveAttribute('title', 'Loaded filter');
    expect(selects[0]).toHaveTextContent('foo');

    // Header
    expect(icons[14]).toHaveTextContent('report.svg');
    expect(baseElement).toHaveTextContent(
      'Report:Mon, Jun 3, 2019 1:00 PM CEST',
    );
    expect(bars[0]).toHaveAttribute('title', 'Done');
    expect(bars[0]).toHaveTextContent('Done');
    expect(baseElement).toHaveTextContent(
      'Created:Mon, Jun 3, 2019 1:00 PM CEST',
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
    expect(links[7]).toHaveAttribute('href', '/task/314');
    expect(tableData[1]).toHaveTextContent('foo');

    expect(tableData[2]).toHaveTextContent('Comment');
    expect(tableData[3]).toHaveTextContent('bar');

    expect(tableData[4]).toHaveTextContent('Report 1');
    expect(links[8]).toHaveAttribute('href', '/report/1234');
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
    expect(links[9]).toHaveAttribute('href', '/report/5678');
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
    expect(tableData[21]).toHaveTextContent('2');

    expect(tableData[22]).toHaveTextContent('Filter');
    expect(tableData[23]).toHaveTextContent(
      'apply_overrides=0 levels=hml min_qod=70',
    );

    expect(tableData[24]).toHaveTextContent('Timezone');
    expect(tableData[25]).toHaveTextContent('UTC (UTC)');
  });

  test('should render results tab', () => {
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

    const {baseElement, getAllByTestId} = render(
      <DeltaDetailsContent
        activeTab={1}
        entity={entity}
        filter={filter}
        filters={filters}
        isLoading={false}
        isUpdating={false}
        sorting={sorting}
        reportId={entity.report.id}
        task={entity.report.task}
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
    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
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
    expect(icons[7]).toHaveTextContent('performance.svg');
    expect(icons[8]).toHaveTextContent('download.svg');

    // Powerfilter
    expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
    expect(icons[9]).toHaveTextContent('refresh.svg');
    expect(icons[10]).toHaveTextContent('delete.svg');
    expect(icons[11]).toHaveTextContent('reset.svg');
    expect(icons[12]).toHaveTextContent('help.svg');
    expect(icons[13]).toHaveTextContent('edit.svg');
    expect(selects[0]).toHaveAttribute('title', 'Loaded filter');
    expect(selects[0]).toHaveTextContent('--');

    // Header
    expect(icons[14]).toHaveTextContent('report.svg');
    expect(baseElement).toHaveTextContent(
      'Report:Mon, Jun 3, 2019 1:00 PM CEST',
    );
    expect(bars[0]).toHaveAttribute('title', 'Done');
    expect(bars[0]).toHaveTextContent('Done');
    expect(baseElement).toHaveTextContent(
      'Created:Mon, Jun 3, 2019 1:00 PM CEST',
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
    expect(header[2]).toHaveTextContent('solution_type.svg');
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
    expect(rows[2]).toHaveTextContent('st_mitigate.svg');
    expect(bars[1]).toHaveAttribute('title', 'High');
    expect(bars[1]).toHaveTextContent('10.0 (High)');
    expect(rows[2]).toHaveTextContent('80 %');
    expect(rows[2]).toHaveTextContent('123.456.78.910');
    expect(rows[2]).toHaveTextContent('80/tcp');
    expect(rows[2]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Row 2
    expect(rows[3]).toHaveTextContent('[ = ]');
    expect(rows[3]).toHaveTextContent('Result 2');
    expect(rows[3]).toHaveTextContent('st_vendorfix.svg');
    expect(bars[2]).toHaveAttribute('title', 'Medium');
    expect(bars[2]).toHaveTextContent('5.0 (Medium)');
    expect(rows[3]).toHaveTextContent('70 %');
    expect(rows[3]).toHaveTextContent('109.876.54.321');
    expect(rows[3]).toHaveTextContent('80/tcp');
    expect(rows[3]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
