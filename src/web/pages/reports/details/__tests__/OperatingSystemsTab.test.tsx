/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import {COMPLIANCE} from 'gmp/models/compliance';
import Filter from 'gmp/models/filter';
import ReportOperatingSystem from 'gmp/models/report/os';
import OperatingSystemsTab from 'web/pages/reports/details/operating-system/OperatingSystemsTab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort=severity',
);

const buildApiEntities = () => {
  const os1 = ReportOperatingSystem.fromElement({
    best_os_cpe: 'cpe:/foo/bar',
    best_os_txt: 'Foo OS',
    hosts_count: 2,
  });
  os1.compliance = COMPLIANCE.NO;

  const os2 = ReportOperatingSystem.fromElement({
    best_os_cpe: 'cpe:/lorem/ipsum',
    best_os_txt: 'Lorem OS',
    hosts_count: 5,
  });
  os2.compliance = COMPLIANCE.INCOMPLETE;

  return [os1, os2];
};

const createOperatingSystemsData = apiEntities => ({
  entities: apiEntities,
  entitiesCounts: new CollectionCounts({
    all: apiEntities.length,
    filtered: apiEntities.length,
    first: 1,
    length: apiEntities.length,
    rows: apiEntities.length,
  }),
});

describe('Report Operating Systems Tab tests', () => {
  test('should render Report Operating Systems Tab', async () => {
    const apiEntities = buildApiEntities();
    const operatingSystemsData = createOperatingSystemsData(apiEntities);

    const {render} = rendererWith({gmp: {}});

    render(
      <OperatingSystemsTab
        filter={filter}
        operatingSystemsData={operatingSystemsData}
        reportId="1234"
      />,
    );

    // Wait for data to load
    await screen.findByText('Foo OS');

    // Get the table and rows within it
    const table = await screen.findByRole('table');
    const rows = within(table).getAllByRole('row');

    // Verify headers
    expect(rows[0]).toHaveTextContent('Operating System');
    expect(rows[0]).toHaveTextContent('CPE');
    expect(rows[0]).toHaveTextContent('Hosts');

    // Verify Row 1
    const row1Links = within(rows[1]).getAllByRole('link');
    const row1Image = within(rows[1]).getByAltText('');

    expect(row1Image).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(row1Links[0]).toHaveTextContent('Foo OS');
    expect(row1Links[0]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
    expect(row1Links[1]).toHaveTextContent('cpe:/foo/bar');
    expect(row1Links[1]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );

    // Verify Row 2
    const row2Links = within(rows[2]).getAllByRole('link');
    const row2Image = within(rows[2]).getByAltText('');

    expect(row2Image).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(row2Links[0]).toHaveTextContent('Lorem OS');
    expect(row2Links[0]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
    expect(row2Links[1]).toHaveTextContent('cpe:/lorem/ipsum');
    expect(row2Links[1]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
  });

  test('should show loading state before data arrives', async () => {
    const {render} = rendererWith({gmp: {}});
    render(
      <OperatingSystemsTab
        filter={filter}
        isOperatingSystemsFetching={true}
        reportId="1234"
      />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});

const auditFilter = Filter.fromString(
  'apply_overrides=0 levels=hmlg rows=3 min_qod=70 first=1 sort=compliant',
);

describe('Audit Report Operating Systems Tab tests', () => {
  test('should render Audit Report Operating Systems Tab with compliance', async () => {
    const apiEntities = buildApiEntities();
    const operatingSystemsData = createOperatingSystemsData(apiEntities);

    const {render} = rendererWith({gmp: {}});

    render(
      <OperatingSystemsTab
        audit={true}
        filter={auditFilter}
        operatingSystemsData={operatingSystemsData}
        reportId="1234"
      />,
    );

    // Wait for compliance data to render
    const progressBars = await screen.findAllByTestId('progressbar-box');
    expect(progressBars).toHaveLength(2);

    // Batch row lookups
    const rows = screen.getAllByRole('row');
    const bars = screen.getAllByTestId('progressbar-box');

    // Verify headers
    expect(rows[0]).toHaveTextContent('Operating System');
    expect(rows[0]).toHaveTextContent('CPE');
    expect(rows[0]).toHaveTextContent('Hosts');
    expect(rows[0]).toHaveTextContent('Compliant');

    // Verify Row 1
    const row1Links = within(rows[1]).getAllByRole('link');
    const row1Image = within(rows[1]).getByAltText('');

    expect(row1Image).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(row1Links[0]).toHaveTextContent('Foo OS');
    expect(row1Links[0]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Ffoo%2Fbar',
    );
    expect(row1Links[1]).toHaveTextContent('cpe:/foo/bar');
    expect(bars[0]).toHaveAttribute('title', 'No');
    expect(bars[0]).toHaveTextContent('No');

    // Verify Row 2
    const row2Links = within(rows[2]).getAllByRole('link');
    const row2Image = within(rows[2]).getByAltText('');

    expect(row2Image).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(row2Links[0]).toHaveTextContent('Lorem OS');
    expect(row2Links[0]).toHaveAttribute(
      'href',
      '/operatingsystems?filter=name%3Dcpe%3A%2Florem%2Fipsum',
    );
    expect(row2Links[1]).toHaveTextContent('cpe:/lorem/ipsum');
    expect(bars[1]).toHaveAttribute('title', 'Incomplete');
    expect(bars[1]).toHaveTextContent('Incomplete');
  });
});
