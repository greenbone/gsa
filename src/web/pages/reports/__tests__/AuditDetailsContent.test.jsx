/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {getMockAuditReport} from 'web/pages/reports/__fixtures__/MockAuditReport';
import AuditReportDetailsContent from 'web/pages/reports/AuditReportDetailsContent';

const filter = Filter.fromString(
  'apply_overrides=0 compliance_levels=ynui rows=10 min_qod=70 first=1 sort=compliant',
);

const resetFilter = Filter.fromString(
  'first=1 compliance_levels=ynui sort=compliant',
);

const manualUrl = 'test/';

const createGmp = ({reportResultsThreshold = 10} = {}) => ({
  settings: {
    manualUrl,
    reportResultsThreshold,
  },
  session: createSession({
    timezone: 'CET',
    token: 'test-token',
    username: 'admin',
  }),
  user: {
    currentSettings: testing.fn().mockResolvedValue({foo: 'bar'}),
    getReportComposerDefaults: testing.fn().mockResolvedValue({foo: 'bar'}),
  },
  results: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 3, all: 3, first: 1, rows: 10}),
      },
    }),
  },
  reporthosts: {
    get: testing.fn().mockResolvedValue({
      data: [
        {
          ip: '123.456.78.910',
          id: '123.456.78.910',
          hostname: 'foo.bar',
          severity: 10,
        },
        {
          ip: '109.876.54.321',
          id: '109.876.54.321',
          hostname: 'lorem.ipsum',
          severity: 5,
        },
      ],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 2, all: 2, first: 1, rows: 10}),
      },
    }),
  },
  reportoperatingsystems: {
    get: testing.fn().mockResolvedValue({
      data: getMockAuditReport().operatingsystems?.entities ?? [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 2, all: 2, first: 1, rows: 10}),
      },
    }),
  },
  reporterrors: {
    get: testing.fn().mockResolvedValue({
      data: getMockAuditReport().errors?.entities ?? [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 2, all: 2, first: 1, rows: 10}),
      },
    }),
  },
  reporttlscertificates: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 2, all: 2, first: 1, rows: 10}),
      },
    }),
  },
});

describe('AuditReportDetailsContent tests', () => {
  test('should render Audit Report Details Content', () => {
    const {entity} = getMockAuditReport();
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });

    render(
      <AuditReportDetailsContent
        entity={entity}
        isLoading={false}
        isUpdating={false}
        pageFilter={filter}
        reportFilter={filter}
        reportId={entity.report.id}
        resetFilter={resetFilter}
        showError={testing.fn()}
        showErrorMessage={testing.fn()}
        showSuccessMessage={testing.fn()}
        task={entity.report.task}
        onAddToAssetsClick={testing.fn()}
        onError={testing.fn()}
        onFilterChanged={testing.fn()}
        onFilterCreated={testing.fn()}
        onFilterDecreaseMinQoDClick={testing.fn()}
        onFilterEditClick={testing.fn()}
        onFilterRemoveClick={testing.fn()}
        onFilterResetClick={testing.fn()}
        onRemoveFromAssetsClick={testing.fn()}
        onReportDownloadClick={testing.fn()}
        onTagSuccess={testing.fn()}
        onTargetEditClick={testing.fn()}
        onTlsCertificateDownloadClick={testing.fn()}
      />,
    );

    // Toolbar icons
    const helpIcon = screen.getByTitle('Help: Audit Reports');
    expect(helpIcon.closest('a')).toHaveAttribute(
      'href',
      'test/en/compliance-and-special-scans.html#using-and-managing-audit-reports',
    );
    expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
      'href',
      '/auditreports',
    );

    expect(screen.getByTitle(/^Add to Assets/)).toBeInTheDocument();
    expect(screen.getByTitle(/^Remove from Assets/)).toBeInTheDocument();
    expect(screen.getByTitle(/^Download filtered Report/)).toBeInTheDocument();

    // Header
    expect(screen.getByRole('heading', {name: /Report:/})).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer TimeDone',
    );

    const entityInfo = within(screen.getByTestId('entity-info'));
    expect(entityInfo.getByRole('row', {name: /^Created:/})).toHaveTextContent(
      'Sun, Jun 2, 2019 2:00 PM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /^Modified:/})).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
    );
    expect(entityInfo.getByRole('row', {name: /^Owner:/})).toHaveTextContent(
      'admin',
    );

    // Tabs
    expect(
      screen.getByRole('tab', {name: /^information/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^results/i})).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^hosts/i})).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^operating systems/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^tls certificates/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', {name: /^error messages/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', {name: /^user tags/i})).toBeInTheDocument();

    // Summary (Information tab active by default)
    const taskName = screen.getByRole('row', {name: /^Task Name/});
    expect(taskName).toHaveTextContent('foo');
    expect(within(taskName).getByRole('link')).toHaveAttribute(
      'href',
      '/audit/314',
    );
    expect(screen.getByRole('row', {name: /^Comment/})).toHaveTextContent(
      'bar',
    );
    expect(screen.getByRole('row', {name: /^Scan Time/})).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time - Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
    );
    expect(screen.getByRole('row', {name: /^Scan Duration/})).toHaveTextContent(
      '0:31 h',
    );
    expect(screen.getByRole('row', {name: /^Scan Status/})).toHaveTextContent(
      'Done',
    );
    expect(screen.getByRole('row', {name: /^Timezone/})).toHaveTextContent(
      'UTC (UTC)',
    );
  });

  test('should render hosts tab', () => {
    const {entity} = getMockAuditReport();
    const gmp = createGmp({reportResultsThreshold: 1});
    const {render} = rendererWith({
      gmp,
      capabilities: true,
    });

    render(
      <AuditReportDetailsContent
        entity={entity}
        isLoading={false}
        isUpdating={false}
        pageFilter={filter}
        reportFilter={filter}
        reportId={entity.report.id}
        resetFilter={resetFilter}
        showError={testing.fn()}
        showErrorMessage={testing.fn()}
        showSuccessMessage={testing.fn()}
        task={entity.report.task}
        onAddToAssetsClick={testing.fn()}
        onError={testing.fn()}
        onFilterChanged={testing.fn()}
        onFilterCreated={testing.fn()}
        onFilterDecreaseMinQoDClick={testing.fn()}
        onFilterEditClick={testing.fn()}
        onFilterRemoveClick={testing.fn()}
        onFilterResetClick={testing.fn()}
        onRemoveFromAssetsClick={testing.fn()}
        onReportDownloadClick={testing.fn()}
        onTagSuccess={testing.fn()}
        onTargetEditClick={testing.fn()}
        onTlsCertificateDownloadClick={testing.fn()}
      />,
    );

    // Click Hosts tab
    fireEvent.click(screen.getByRole('tab', {name: /^Hosts/i}));

    // Summary should no longer be visible
    expect(
      screen.queryByRole('row', {name: /^Task Name/}),
    ).not.toBeInTheDocument();

    // Threshold panel should be visible since reportResultsThreshold=1
    expect(
      screen.getByText(/The Hosts cannot be displayed in order to maintain/),
    ).toBeInTheDocument();
  });
});
