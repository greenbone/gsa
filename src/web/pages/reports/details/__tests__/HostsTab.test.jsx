/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import Filter from 'gmp/models/filter';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {getMockAuditReport} from 'web/pages/reports/__fixtures__/MockAuditReport';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import HostsTab from 'web/pages/reports/details/HostsTab';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);
const gmp = {
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
  },
};

describe('Report Hosts Tab tests', () => {
  test('should render Report Hosts Tab', () => {
    const {hosts} = getMockReport();

    const onSortChange = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <HostsTab
        counts={hosts.counts}
        filter={filter}
        hosts={hosts.entities}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onSortChange={sortField => onSortChange('hosts', sortField)}
      />,
    );

    // Use accessible queries instead of DOM index lookups
    // Headings
    expect(
      screen.getByRole('columnheader', {name: /IP Address/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Hostname/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /^OS/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Ports/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Apps/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Distance/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Auth/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Start/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /End/i}),
    ).toBeInTheDocument();
    // CVSSv3 shows Critical column
    expect(
      screen.getByRole('columnheader', {name: /Critical/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /High/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Medium/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Low/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Log/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /False Pos/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Total/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Severity/i}),
    ).toBeInTheDocument();

    // Row 1 (host with asset id)
    const host1Link = screen.getByRole('link', {name: '123.456.78.910'});
    expect(host1Link).toHaveAttribute('href', '/host/123');

    const row1 = host1Link.closest('tr');
    expect(row1).toHaveTextContent('foo.bar');
    // image src may be absolute; match substring
    expect(row1.querySelector('img').getAttribute('src')).toContain(
      '/img/os_unknown.svg',
    );
    expect(row1).toHaveTextContent('1032'); // 10 Ports, 3 Apps, 2 Distance
    expect(row1).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(row1).toHaveTextContent(
      'Mon, Jun 3, 2019 1:15 PM Central European Summer Time',
    );
    expect(row1).toHaveTextContent('143050150'); // 14 High, 30 Medium, 5 Low, 0 Log, 1 False Positive, 50 Total

    const bar1 = within(row1).getByTestId('progressbar-box');
    expect(bar1).toHaveAttribute('title', 'Critical');
    expect(bar1).toHaveTextContent('10.0 (Critical)');

    // Row 2 (host without asset id)
    const host2Link = screen.getByRole('link', {name: '109.876.54.321'});
    expect(host2Link).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D109.876.54.321',
    );

    const row2 = host2Link.closest('tr');
    expect(row2).toHaveTextContent('lorem.ipsum');
    expect(row2.querySelector('img').getAttribute('src')).toContain(
      '/img/os_unknown.svg',
    );
    expect(row2).toHaveTextContent('1521'); // 15 Ports, 2 Apps, 1 Distance
    expect(row2).toHaveTextContent(
      'Mon, Jun 3, 2019 1:15 PM Central European Summer Time',
    );
    expect(row2).toHaveTextContent(
      'Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
    );
    expect(row2).toHaveTextContent('53005040'); // 5 High, 30 Medium, 0 Low, 5 Log, 0 False Positive, 40 Total

    const bar2 = within(row2).getByTestId('progressbar-box');
    expect(bar2).toHaveAttribute('title', 'Medium');
    expect(bar2).toHaveTextContent('5.0 (Medium)');

    // Filter
    expect(
      screen.getByText(
        '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
      ),
    ).toBeInTheDocument();
  });
});

const auditFilter = Filter.fromString(
  'apply_overrides=0 levels=hmlg rows=3 min_qod=70 first=1 sort=compliant',
);

describe('Audit Report Hosts Tab tests', () => {
  test('should render Audit Report Hosts Tab', () => {
    const {hosts} = getMockAuditReport();

    const onSortChange = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    render(
      <HostsTab
        audit={true}
        counts={hosts.counts}
        filter={auditFilter}
        hosts={hosts.entities}
        isUpdating={false}
        sortField={'compliant'}
        sortReverse={false}
        onSortChange={sortField => onSortChange('hosts', sortField)}
      />,
    );

    // Headings (audit)
    expect(
      screen.getByRole('columnheader', {name: /IP Address/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Hostname/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /^OS/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Ports/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Apps/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Distance/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Auth/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Start/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /End/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Yes/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('columnheader', {name: /No/i})).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Incomplete/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Total/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', {name: /Compliant/i}),
    ).toBeInTheDocument();

    // Row 1
    const auditHost1 = screen.getByRole('link', {name: '109.876.54.321'});
    expect(auditHost1).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D109.876.54.321',
    );
    const auditRow1 = auditHost1.closest('tr');
    expect(auditRow1).toHaveTextContent('lorem.ipsum');
    expect(auditRow1.querySelector('img').getAttribute('src')).toContain(
      '/img/os_unknown.svg',
    );
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
    const auditHost2 = screen.getByRole('link', {name: '123.456.78.910'});
    expect(auditHost2).toHaveAttribute('href', '/host/123');
    const auditRow2 = auditHost2.closest('tr');
    expect(auditRow2).toHaveTextContent('foo.bar');
    expect(auditRow2.querySelector('img').getAttribute('src')).toContain(
      '/img/os_unknown.svg',
    );
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
    const auditHost3 = screen.getByRole('link', {name: '123.456.78.810'});
    expect(auditHost3).toHaveAttribute('href', '/host/123');
    const auditRow3 = auditHost3.closest('tr');
    expect(auditRow3).toHaveTextContent('foo.bar');
    expect(auditRow3.querySelector('img').getAttribute('src')).toContain(
      '/img/os_unknown.svg',
    );
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
    expect(
      screen.getByText(
        '(Applied filter: apply_overrides=0 levels=hmlg rows=3 min_qod=70 first=1 sort=compliant)',
      ),
    ).toBeInTheDocument();
  });
});
