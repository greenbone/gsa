/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {rendererWith} from 'web/utils/testing';

import CvesTab from '../cvestab';

const caps = new Capabilities(['everything']);

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

describe('Report CVEs Tab tests', () => {
  test('should render Report CVEs Tab', () => {
    const {cves} = getMockReport();
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
      <CvesTab
        counts={cves.counts}
        cves={cves.entities}
        filter={filter}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={sortField => onSortChange('cves', sortField)}
      />,
    );

    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const bars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('CVE');
    expect(header[1]).toHaveTextContent('NVT');
    expect(header[2]).toHaveTextContent('Hosts');
    expect(header[3]).toHaveTextContent('Occurrences');
    expect(header[4]).toHaveTextContent('Severity');

    // Row 1
    expect(links[0]).toHaveAttribute('href', '/cve/CVE-2019-1234');
    expect(links[0]).toHaveTextContent('CVE-2019-1234');
    expect(links[1]).toHaveAttribute('href', '/nvt/201');
    expect(links[1]).toHaveTextContent('nvt1');
    expect(rows[1]).toHaveTextContent('22'); // 2 Hosts, 2 Occurrences
    expect(bars[0]).toHaveAttribute('title', 'High');
    expect(bars[0]).toHaveTextContent('10.0 (High)');

    // Row 2
    expect(links[2]).toHaveAttribute('href', '/cve/CVE-2019-5678');
    expect(links[2]).toHaveTextContent('CVE-2019-5678');
    expect(links[3]).toHaveAttribute('href', '/nvt/202');
    expect(links[3]).toHaveTextContent('nvt2');
    expect(rows[2]).toHaveTextContent('11'); // 1 Hosts, 1 Occurrences
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
