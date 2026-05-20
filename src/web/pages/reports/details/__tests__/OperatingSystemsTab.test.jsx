/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, rendererWith, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import ReportOperatingSystem from 'gmp/models/report/os';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockAuditReport} from 'web/pages/reports/__fixtures__/MockAuditReport';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import OperatingSystemsTab from 'web/pages/reports/details/OperatingSystemsTab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort=severity',
);

// Build API-format OS entities (no severity set, matching get_report_operating_systems response)
const buildApiEntities = () => {
  const os1 = ReportOperatingSystem.fromElement({
    best_os_cpe: 'cpe:/foo/bar',
    best_os_txt: 'Foo OS',
  });
  os1.hosts.count = 2;

  const os2 = ReportOperatingSystem.fromElement({
    best_os_cpe: 'cpe:/lorem/ipsum',
    best_os_txt: 'Lorem OS',
  });
  os2.hosts.count = 5;

  return [os1, os2];
};

const createGmp = (apiEntities, responseFilter = filter) => ({
  session: createSession({token: 'test-token'}),
  settings: {severityRating: SEVERITY_RATING_CVSS_3},
  reportoperatingsystems: {
    get: testing.fn().mockResolvedValue({
      data: apiEntities,
      meta: {
        filter: responseFilter,
        counts: new CollectionCounts({
          all: apiEntities.length,
          filtered: apiEntities.length,
          first: 1,
          length: apiEntities.length,
          rows: apiEntities.length,
        }),
      },
    }),
  },
});

describe('Report Operating Systems Tab tests', () => {
  test('should render Report Operating Systems Tab', async () => {
    const {operatingsystems} = getMockReport();
    const apiEntities = buildApiEntities();
    const gmp = createGmp(apiEntities);

    const {render} = rendererWith({gmp, router: true});

    const {baseElement} = render(
      <OperatingSystemsTab
        filter={filter}
        reportId="1234"
        reportOperatingSystems={operatingsystems?.entities}
      />,
    );

    await screen.findByText('Foo OS');

    const images = baseElement.querySelectorAll('img');
    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');

    // Headings
    expect(header[0]).toHaveTextContent('Operating System');
    expect(header[1]).toHaveTextContent('CPE');
    expect(header[2]).toHaveTextContent('Hosts');

    // Row 1
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(links[0]).toHaveTextContent('Foo OS');
    expect(links[0]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
    expect(links[1]).toHaveTextContent('cpe:/foo/bar');
    expect(links[1]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );

    // Row 2
    expect(images[1]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(links[2]).toHaveTextContent('Lorem OS');
    expect(links[2]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
    expect(links[3]).toHaveTextContent('cpe:/lorem/ipsum');
    expect(links[3]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
  });

  test('should show loading state before data arrives', async () => {
    const gmp = createGmp(buildApiEntities());
    // Replace with a promise that never resolves to keep the loading state
    gmp.reportoperatingsystems.get = testing
      .fn()
      .mockReturnValue(new Promise(() => {}));

    const {render} = rendererWith({gmp, router: true});
    render(<OperatingSystemsTab filter={filter} reportId="1234" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});

const auditFilter = Filter.fromString(
  'apply_overrides=0 levels=hmlg rows=3 min_qod=70 first=1 sort=compliant',
);

describe('Audit Report Operating Systems Tab tests', () => {
  test('should render Audit Report Operating Systems Tab with compliance', async () => {
    const {operatingsystems} = getMockAuditReport();
    const apiEntities = buildApiEntities();
    const gmp = createGmp(apiEntities, auditFilter);

    const {render} = rendererWith({gmp, router: true});

    const {baseElement} = render(
      <OperatingSystemsTab
        audit={true}
        filter={auditFilter}
        reportId="1234"
        reportOperatingSystems={operatingsystems?.entities}
      />,
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('progressbar-box')).toHaveLength(2);
    });

    const images = baseElement.querySelectorAll('img');
    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const bars = screen.getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Operating System');
    expect(header[1]).toHaveTextContent('CPE');
    expect(header[2]).toHaveTextContent('Hosts');
    expect(header[3]).toHaveTextContent('Compliant');

    // Row 1
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(links[0]).toHaveTextContent('Foo OS');
    expect(links[0]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
    expect(links[1]).toHaveTextContent('cpe:/foo/bar');
    expect(bars[0]).toHaveAttribute('title', 'No');
    expect(bars[0]).toHaveTextContent('No');

    // Row 2
    expect(images[1]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(links[2]).toHaveTextContent('Lorem OS');
    expect(links[2]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
    expect(links[3]).toHaveTextContent('cpe:/lorem/ipsum');
    expect(bars[1]).toHaveAttribute('title', 'Incomplete');
    expect(bars[1]).toHaveTextContent('Incomplete');
  });
});
