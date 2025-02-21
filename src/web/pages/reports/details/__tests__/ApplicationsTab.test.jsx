/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import {getMockReport} from 'web/pages/reports/__mocks__/MockReport';
import ApplicationsTab from 'web/pages/reports/details/ApplicationsTab';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith} from 'web/utils/Testing';


const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const caps = new Capabilities(['everything']);

describe('Report Applications Tab tests', () => {
  test('should render Report Applications Tab', () => {
    const {applications} = getMockReport();

    const onSortChange = testing.fn();
    const onInteraction = testing.fn();

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement, getAllByTestId} = render(
      <ApplicationsTab
        applications={applications.entities}
        counts={applications.counts}
        filter={filter}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={onSortChange}
      />,
    );

    const images = baseElement.querySelectorAll('img');
    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const bars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Application CPE');
    expect(header[1]).toHaveTextContent('Hosts');
    expect(header[2]).toHaveTextContent('Occurrences');
    expect(header[3]).toHaveTextContent('Severity');

    // Row 1
    expect(links[0]).toHaveAttribute('href', '/cpe/cpe%3A%2Fa%3A%20123');
    expect(links[0]).toHaveTextContent('123');
    expect(images[0]).toHaveAttribute('src', '/img/cpe/other.svg');
    expect(rows[1]).toHaveTextContent('22'); // 2 Hosts, 2 Occurrences
    expect(bars[0]).toHaveAttribute('title', 'High');
    expect(bars[0]).toHaveTextContent('10.0 (High)');

    // Row 2
    expect(links[1]).toHaveAttribute('href', '/cpe/cpe%3A%2Fa%3A%20456');
    expect(links[1]).toHaveTextContent('456');
    expect(images[1]).toHaveAttribute('src', '/img/cpe/other.svg');
    expect(rows[2]).toHaveTextContent('11'); // 1 Hosts, 1 Occurrences
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
