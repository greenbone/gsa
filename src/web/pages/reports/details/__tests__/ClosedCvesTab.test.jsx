/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockReport} from 'web/pages/reports/__mocks__/MockReport';
import ClosedCvesTab from 'web/pages/reports/details/ClosedCvesTab';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const caps = new Capabilities(['everything']);
const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);
const gmp = {
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
};

describe('Report Closed CVEs Tab tests', () => {
  test('should render Report Closed CVEs Tab', () => {
    const {closedCves} = getMockReport();
    const onSortChange = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <ClosedCvesTab
        closedCves={closedCves.entities}
        counts={closedCves.counts}
        filter={filter}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onSortChange={sortField => onSortChange('cves', sortField)}
      />,
    );

    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const bars = screen.getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('CVE');
    expect(header[1]).toHaveTextContent('Host');
    expect(header[2]).toHaveTextContent('NVT');
    expect(header[3]).toHaveTextContent('Severity');

    // Row 1
    expect(links[0]).toHaveAttribute('href', '/cve/CVE-2000-1234');
    expect(links[0]).toHaveTextContent('CVE-2000-1234');
    expect(links[1]).toHaveAttribute('href', '/host/123');
    expect(links[1]).toHaveTextContent('123.456.78.910');
    expect(links[2]).toHaveAttribute('href', '/nvt/201');
    expect(links[2]).toHaveTextContent('This is a description');
    expect(bars[0]).toHaveAttribute('title', 'Critical');
    expect(bars[0]).toHaveTextContent('10.0 (Critical)');

    // Row 2
    expect(links[3]).toHaveAttribute('href', '/cve/CVE-2000-5678');
    expect(links[3]).toHaveTextContent('CVE-2000-5678');
    expect(links[4]).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D109.876.54.321',
    ); // because the host has no asset id
    expect(links[4]).toHaveTextContent('109.876.54.321');
    expect(links[5]).toHaveAttribute('href', '/nvt/202');
    expect(links[5]).toHaveTextContent('This is another description');
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
