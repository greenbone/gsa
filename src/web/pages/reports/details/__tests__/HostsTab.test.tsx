/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {mockAuditHosts} from 'web/pages/reports/__fixtures__/MockAuditReport';
import {mockReportHosts} from 'web/pages/reports/__fixtures__/MockReport';
import HostsTab from 'web/pages/reports/details/host/HostsTab';

const getRow = (link: HTMLElement): HTMLTableRowElement => {
  const row = link.closest('tr');
  if (!row) throw new Error('Expected parent row element');
  return row;
};

const getImgSrc = (row: HTMLTableRowElement): string => {
  const img = row.querySelector('img');
  if (!img) throw new Error('Expected img element');
  return img.getAttribute('src') ?? '';
};

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const hostsCounts = new CollectionCounts({
  all: 2,
  filtered: 2,
  first: 1,
  rows: 2,
  length: 2,
});

const createGmp = ({severityRating = SEVERITY_RATING_CVSS_3} = {}) => ({
  settings: {
    severityRating,
  },
  session: createSession({timezone: 'CET'}),
});

describe('Report Hosts Tab tests', () => {
  test('should render Report Hosts Tab', () => {
    const onSortChange = testing.fn();

    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
    });

    render(
      <HostsTab
        counts={hostsCounts}
        filter={filter}
        hosts={mockReportHosts}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onSortChange={sortField => onSortChange('hosts', sortField)}
      />,
    );

    // Headings
    screen.getByRole('columnheader', {name: /IP Address/i});
    screen.getByRole('columnheader', {name: /Hostname/i});
    screen.getByRole('columnheader', {name: /^OS/i});
    screen.getByRole('columnheader', {name: /Ports/i});
    screen.getByRole('columnheader', {name: /Apps/i});
    screen.getByRole('columnheader', {name: /Distance/i});
    screen.getByRole('columnheader', {name: /Auth/i});
    screen.getByRole('columnheader', {name: /Start/i});
    screen.getByRole('columnheader', {name: /End/i});
    screen.getByRole('columnheader', {name: /Critical/i});
    screen.getByRole('columnheader', {name: /High/i});
    screen.getByRole('columnheader', {name: /Medium/i});
    screen.getByRole('columnheader', {name: /Low/i});
    screen.getByRole('columnheader', {name: /Log/i});
    screen.getByRole('columnheader', {name: /False Pos/i});
    screen.getByRole('columnheader', {name: /Total/i});
    screen.getByRole('columnheader', {name: /Severity/i});

    // Row 1 (host with asset id)
    const host1Link = screen.getByRole('link', {name: '123.456.78.910'});
    expect(host1Link).toHaveAttribute('href', '/host/123');

    const row1 = getRow(host1Link);
    expect(row1).toHaveTextContent('foo.bar');
    expect(getImgSrc(row1)).toContain('/img/os_unknown.svg');
    expect(row1).toHaveTextContent('1032');
    expect(row1).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(row1).toHaveTextContent(
      'Mon, Jun 3, 2019 1:15 PM Central European Summer Time',
    );
    expect(row1).toHaveTextContent('143050150');

    const bar1 = within(row1).getByTestId('progressbar-box');
    expect(bar1).toHaveAttribute('title', 'Critical');
    expect(bar1).toHaveTextContent('10.0 (Critical)');

    // Row 2 (host without asset id)
    const host2Link = screen.getByRole('link', {name: '109.876.54.321'});
    expect(host2Link).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D109.876.54.321',
    );

    const row2 = getRow(host2Link);
    expect(row2).toHaveTextContent('lorem.ipsum');
    expect(getImgSrc(row2)).toContain('/img/os_unknown.svg');
    expect(row2).toHaveTextContent('1521');
    expect(row2).toHaveTextContent(
      'Mon, Jun 3, 2019 1:15 PM Central European Summer Time',
    );
    expect(row2).toHaveTextContent(
      'Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
    );
    expect(row2).toHaveTextContent('53005040');

    const bar2 = within(row2).getByTestId('progressbar-box');
    expect(bar2).toHaveAttribute('title', 'Medium');
    expect(bar2).toHaveTextContent('5.0 (Medium)');

    // Filter
    screen.getByText(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});

const auditFilter = Filter.fromString(
  'apply_overrides=0 levels=hmlg rows=3 min_qod=70 first=1 sort=compliant',
);

const auditHosts = mockAuditHosts;
const auditHostsCounts = new CollectionCounts({
  all: 3,
  filtered: 3,
  first: 1,
  rows: 3,
  length: 3,
});

describe('Audit Report Hosts Tab tests', () => {
  test('should render Audit Report Hosts Tab', () => {
    const onSortChange = testing.fn();

    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
    });

    render(
      <HostsTab
        audit={true}
        counts={auditHostsCounts}
        filter={auditFilter}
        hosts={auditHosts}
        isUpdating={false}
        sortField={'compliant'}
        sortReverse={false}
        onSortChange={sortField => onSortChange('hosts', sortField)}
      />,
    );

    // Headings (audit)
    screen.getByRole('columnheader', {name: /IP Address/i});
    screen.getByRole('columnheader', {name: /Hostname/i});
    screen.getByRole('columnheader', {name: /^OS/i});
    screen.getByRole('columnheader', {name: /Ports/i});
    screen.getByRole('columnheader', {name: /Apps/i});
    screen.getByRole('columnheader', {name: /Distance/i});
    screen.getByRole('columnheader', {name: /Auth/i});
    screen.getByRole('columnheader', {name: /Start/i});
    screen.getByRole('columnheader', {name: /End/i});
    screen.getByRole('columnheader', {name: /Yes/i});
    screen.getByRole('columnheader', {name: /No/i});
    screen.getByRole('columnheader', {name: /Incomplete/i});
    screen.getByRole('columnheader', {name: /Total/i});
    screen.getByRole('columnheader', {name: /Compliant/i});

    // Row 1
    const auditHost1Link = screen.getByRole('link', {name: '109.876.54.321'});
    expect(auditHost1Link).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D109.876.54.321',
    );
    const auditRow1 = getRow(auditHost1Link);
    expect(auditRow1).toHaveTextContent('lorem.ipsum');
    expect(getImgSrc(auditRow1)).toContain('/img/os_unknown.svg');
    expect(auditRow1).toHaveTextContent('1521');
    expect(auditRow1).toHaveTextContent(
      'Mon, Jun 3, 2019 1:15 PM Central European Summer Time',
    );
    expect(auditRow1).toHaveTextContent(
      'Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
    );
    expect(auditRow1).toHaveTextContent('170540');
    expect(within(auditRow1).getByTestId('progressbar-box')).toHaveAttribute(
      'title',
      'Incomplete',
    );
    expect(within(auditRow1).getByTestId('progressbar-box')).toHaveTextContent(
      'Incomplete',
    );

    // Row 2
    const auditHost2Link = screen.getByRole('link', {name: '123.456.78.910'});
    expect(auditHost2Link).toHaveAttribute('href', '/host/123');
    const auditRow2 = getRow(auditHost2Link);
    expect(auditRow2).toHaveTextContent('foo.bar');
    expect(getImgSrc(auditRow2)).toContain('/img/os_unknown.svg');
    expect(auditRow2).toHaveTextContent('1032');
    expect(auditRow2).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(auditRow2).toHaveTextContent(
      'Mon, Jun 3, 2019 1:15 PM Central European Summer Time',
    );
    expect(auditRow2).toHaveTextContent('7301450');
    expect(within(auditRow2).getByTestId('progressbar-box')).toHaveAttribute(
      'title',
      'No',
    );
    expect(within(auditRow2).getByTestId('progressbar-box')).toHaveTextContent(
      'No',
    );

    // Row 3
    const auditHost3Link = screen.getByRole('link', {name: '123.456.78.810'});
    expect(auditHost3Link).toHaveAttribute('href', '/host/123');
    const auditRow3 = getRow(auditHost3Link);
    expect(auditRow3).toHaveTextContent('foo.bar');
    expect(getImgSrc(auditRow3)).toContain('/img/os_unknown.svg');
    expect(auditRow3).toHaveTextContent('1032');
    expect(auditRow3).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(auditRow3).toHaveTextContent(
      'Mon, Jun 3, 2019 1:15 PM Central European Summer Time',
    );
    expect(auditRow3).toHaveTextContent('200020');
    expect(within(auditRow3).getByTestId('progressbar-box')).toHaveAttribute(
      'title',
      'Yes',
    );
    expect(within(auditRow3).getByTestId('progressbar-box')).toHaveTextContent(
      'Yes',
    );

    // Filter
    screen.getByText(
      '(Applied filter: apply_overrides=0 levels=hmlg rows=3 min_qod=70 first=1 sort=compliant)',
    );
  });
});
