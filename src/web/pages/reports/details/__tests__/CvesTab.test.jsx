/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, within} from 'web/testing';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import CvesTab from 'web/pages/reports/details/CvesTab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);
const gmp = {settings: {severityRating: SEVERITY_RATING_CVSS_3}};

describe('Report CVEs Tab tests', () => {
  test('should render Report CVEs Tab', () => {
    const {cves} = getMockReport();
    const onSortChange = testing.fn();
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(
      <CvesTab
        counts={cves?.counts}
        cves={cves?.entities}
        filter={filter}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onSortChange={sortField => onSortChange('cves', sortField)}
      />,
    );

    // Verify headers
    const table = screen.getByRole('table');
    const headers = within(table).getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('CVE');
    expect(headers[1]).toHaveTextContent('Host');
    expect(headers[2]).toHaveTextContent('NVT');
    expect(headers[3]).toHaveTextContent('Severity');

    // Get severity bars and verify row data
    const bars = screen.getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'Critical');
    expect(bars[0]).toHaveTextContent('10.0 (Critical)');
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Verify CVE links
    const cveLink1 = screen.getByText('CVE-2019-1234');
    expect(cveLink1.closest('a')).toHaveAttribute('href', '/cve/CVE-2019-1234');

    const cveLink2 = screen.getByText('CVE-2019-5678');
    expect(cveLink2.closest('a')).toHaveAttribute('href', '/cve/CVE-2019-5678');

    // Verify host links
    const hostLink1 = screen.getByText('123.456.78.910');
    expect(hostLink1.closest('a')).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D123.456.78.910',
    );

    const hostLink2 = screen.getByText('109.876.54.321');
    expect(hostLink2.closest('a')).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D109.876.54.321',
    );

    // Verify NVT links
    const nvtLink1 = screen.getByText('nvt1');
    expect(nvtLink1.closest('a')).toHaveAttribute('href', '/nvt/201');

    const nvtLink2 = screen.getByText('nvt2');
    expect(nvtLink2.closest('a')).toHaveAttribute('href', '/nvt/202');

    // Verify filter is applied
    screen.getByText(/sort-reverse=severity/);
  });
});
