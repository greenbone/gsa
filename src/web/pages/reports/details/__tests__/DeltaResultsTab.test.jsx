/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import {getMockDeltaReport} from 'web/pages/reports/__mocks__/MockDeltaReport';
import DeltaResultsTab from 'web/pages/reports/details/DeltaResultsTab';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith} from 'web/utils/Testing';


const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const caps = new Capabilities(['everything']);

const gmp = {
  settings: {},
};

describe('Delta Results Tab tests', () => {
  test('should render Delta Results Tab', () => {
    const onFilterAddLogLevelClick = testing.fn();
    const onFilterDecreaseMinQoDClick = testing.fn();
    const onFilterEditClick = testing.fn();
    const onFilterRemoveClick = testing.fn();
    const onFilterRemoveSeverityClick = testing.fn();
    const onInteraction = testing.fn();
    const onSortChange = testing.fn();
    const onTargetEditClick = testing.fn();

    const {report, results, task} = getMockDeltaReport();

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
      gmp,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement, getAllByTestId} = render(
      <DeltaResultsTab
        counts={results.counts}
        delta={true}
        filter={filter}
        hasTarget={true}
        isUpdating={false}
        progress={task.progress}
        results={results.entities}
        sortField={'severity'}
        sortReverse={true}
        status={report.scan_run_status}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        onInteraction={onInteraction}
        onSortChange={onSortChange}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const bars = getAllByTestId('progressbar-box');

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
    expect(bars[0]).toHaveAttribute('title', 'Critical');
    expect(bars[0]).toHaveTextContent('10.0 (Critical)');
    expect(rows[2]).toHaveTextContent('80 %');
    expect(rows[2]).toHaveTextContent('123.456.78.910');
    expect(rows[2]).toHaveTextContent('80/tcp');
    expect(rows[2]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Row 2
    expect(rows[3]).toHaveTextContent('[ = ]');
    expect(rows[3]).toHaveTextContent('Result 2');
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');
    expect(rows[3]).toHaveTextContent('70 %');
    expect(rows[3]).toHaveTextContent('109.876.54.321');
    expect(rows[3]).toHaveTextContent('80/tcp');
    expect(rows[3]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });

  // TODO
  // should render Empty Report
  // should render Empty Results Report
  // should call click handler
});
