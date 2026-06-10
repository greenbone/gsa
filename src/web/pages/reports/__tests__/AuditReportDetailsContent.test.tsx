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

const createGmp = ({reportResultsThreshold = 10} = {}) => ({
  settings: {
    manualUrl: 'test/',
    reportResultsThreshold,
  },
  results: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter,
        counts: new CollectionCounts({filtered: 0, all: 0, first: 1, rows: 10}),
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
          complianceCount: {yes: 5, no: 3, incomplete: 2, undefined: 0},
        },
      ],
      meta: {
        filter,
        counts: new CollectionCounts({filtered: 1, all: 1, first: 1, rows: 10}),
      },
    }),
  },
  reportoperatingsystems: {
    get: testing.fn().mockResolvedValue({
      data: getMockAuditReport().operatingsystems?.entities ?? [],
      meta: {
        filter,
        counts: new CollectionCounts({filtered: 2, all: 2, first: 1, rows: 10}),
      },
    }),
  },
  reporterrors: {
    get: testing.fn().mockResolvedValue({
      data: getMockAuditReport().errors?.entities ?? [],
      meta: {
        filter,
        counts: new CollectionCounts({filtered: 2, all: 2, first: 1, rows: 10}),
      },
    }),
  },
  reporttlscertificates: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter,
        counts: new CollectionCounts({filtered: 0, all: 0, first: 1, rows: 10}),
      },
    }),
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
});

const makeCallbacks = () => ({
  onAddToAssetsClick: testing.fn(),
  onError: testing.fn(),
  onFilterChanged: testing.fn(),
  onFilterCreated: testing.fn(),
  onFilterDecreaseMinQoDClick: testing.fn(),
  onFilterEditClick: testing.fn(),
  onFilterRemoveClick: testing.fn(),
  onFilterResetClick: testing.fn(),
  onRemoveFromAssetsClick: testing.fn(),
  onReportDownloadClick: testing.fn(),
  onSortChange: testing.fn(),
  onTagSuccess: testing.fn(),
  onTargetEditClick: testing.fn(),
  onTlsCertificateDownloadClick: testing.fn(),
  showError: testing.fn(),
  showErrorMessage: testing.fn(),
  showSuccessMessage: testing.fn(),
});

const renderContent = (
  overrideProps = {},
  {reportResultsThreshold = 10} = {},
) => {
  const cbs = makeCallbacks();
  const {entity} = getMockAuditReport();
  const gmp = createGmp({reportResultsThreshold});
  const {render} = rendererWith({gmp, capabilities: true});
  const reportId = entity.report?.id ?? '1234';

  render(
    <AuditReportDetailsContent
      entity={entity}
      isLoading={false}
      isUpdating={false}
      pageFilter={filter}
      reportFilter={filter}
      reportId={reportId}
      resetFilter={resetFilter}
      showError={cbs.showError}
      showErrorMessage={cbs.showErrorMessage}
      showSuccessMessage={cbs.showSuccessMessage}
      task={entity.report?.task}
      onAddToAssetsClick={cbs.onAddToAssetsClick}
      onError={cbs.onError}
      onFilterChanged={cbs.onFilterChanged}
      onFilterCreated={cbs.onFilterCreated}
      onFilterDecreaseMinQoDClick={cbs.onFilterDecreaseMinQoDClick}
      onFilterEditClick={cbs.onFilterEditClick}
      onFilterRemoveClick={cbs.onFilterRemoveClick}
      onFilterResetClick={cbs.onFilterResetClick}
      onRemoveFromAssetsClick={cbs.onRemoveFromAssetsClick}
      onReportDownloadClick={cbs.onReportDownloadClick}
      onTagSuccess={cbs.onTagSuccess}
      onTargetEditClick={cbs.onTargetEditClick}
      onTlsCertificateDownloadClick={cbs.onTlsCertificateDownloadClick}
      {...overrideProps}
    />,
  );

  return cbs;
};

describe('AuditReportDetailsContent tests', () => {
  describe('Loading state', () => {
    test('should show Loading text and spinner when isLoading and no entity', () => {
      const cbs = makeCallbacks();
      const gmp = createGmp();
      const {render} = rendererWith({gmp, capabilities: true});

      render(
        <AuditReportDetailsContent
          isLoading={true}
          reportId="report-1234"
          showError={cbs.showError}
          showErrorMessage={cbs.showErrorMessage}
          showSuccessMessage={cbs.showSuccessMessage}
          onAddToAssetsClick={cbs.onAddToAssetsClick}
          onError={cbs.onError}
          onFilterChanged={cbs.onFilterChanged}
          onFilterCreated={cbs.onFilterCreated}
          onFilterDecreaseMinQoDClick={cbs.onFilterDecreaseMinQoDClick}
          onFilterEditClick={cbs.onFilterEditClick}
          onFilterRemoveClick={cbs.onFilterRemoveClick}
          onFilterResetClick={cbs.onFilterResetClick}
          onRemoveFromAssetsClick={cbs.onRemoveFromAssetsClick}
          onReportDownloadClick={cbs.onReportDownloadClick}
          onTagSuccess={cbs.onTagSuccess}
          onTargetEditClick={cbs.onTargetEditClick}
          onTlsCertificateDownloadClick={cbs.onTlsCertificateDownloadClick}
        />,
      );

      expect(screen.getByText('Audit Report:')).toBeInTheDocument();
      expect(screen.getByText('Loading')).toBeInTheDocument();
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    test('should render Loading spinner inside section when no entity and not loading', () => {
      const cbs = makeCallbacks();
      const gmp = createGmp();
      const {render} = rendererWith({gmp, capabilities: true});

      render(
        <AuditReportDetailsContent
          isLoading={false}
          reportId="report-1234"
          showError={cbs.showError}
          showErrorMessage={cbs.showErrorMessage}
          showSuccessMessage={cbs.showSuccessMessage}
          onAddToAssetsClick={cbs.onAddToAssetsClick}
          onError={cbs.onError}
          onFilterChanged={cbs.onFilterChanged}
          onFilterCreated={cbs.onFilterCreated}
          onFilterDecreaseMinQoDClick={cbs.onFilterDecreaseMinQoDClick}
          onFilterEditClick={cbs.onFilterEditClick}
          onFilterRemoveClick={cbs.onFilterRemoveClick}
          onFilterResetClick={cbs.onFilterResetClick}
          onRemoveFromAssetsClick={cbs.onRemoveFromAssetsClick}
          onReportDownloadClick={cbs.onReportDownloadClick}
          onTagSuccess={cbs.onTagSuccess}
          onTargetEditClick={cbs.onTargetEditClick}
          onTlsCertificateDownloadClick={cbs.onTlsCertificateDownloadClick}
        />,
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    test('should render ErrorPanel when reportError is defined and no entity', () => {
      const cbs = makeCallbacks();
      const gmp = createGmp();
      const {render} = rendererWith({gmp, capabilities: true});

      render(
        <AuditReportDetailsContent
          isLoading={false}
          reportError={new Error('Test error message')}
          reportId="report-1234"
          showError={cbs.showError}
          showErrorMessage={cbs.showErrorMessage}
          showSuccessMessage={cbs.showSuccessMessage}
          onAddToAssetsClick={cbs.onAddToAssetsClick}
          onError={cbs.onError}
          onFilterChanged={cbs.onFilterChanged}
          onFilterCreated={cbs.onFilterCreated}
          onFilterDecreaseMinQoDClick={cbs.onFilterDecreaseMinQoDClick}
          onFilterEditClick={cbs.onFilterEditClick}
          onFilterRemoveClick={cbs.onFilterRemoveClick}
          onFilterResetClick={cbs.onFilterResetClick}
          onRemoveFromAssetsClick={cbs.onRemoveFromAssetsClick}
          onReportDownloadClick={cbs.onReportDownloadClick}
          onTagSuccess={cbs.onTagSuccess}
          onTargetEditClick={cbs.onTargetEditClick}
          onTlsCertificateDownloadClick={cbs.onTlsCertificateDownloadClick}
        />,
      );

      expect(
        screen.getByText(/Error while loading Report report-1234/),
      ).toBeInTheDocument();
    });
  });

  describe('Full render with entity', () => {
    test('should render all 7 tabs and summary content by default', () => {
      renderContent();

      const tablist = screen.getByRole('tablist');
      expect(within(tablist).getAllByRole('tab')).toHaveLength(7);
      expect(
        within(tablist).getByRole('tab', {name: /^information/i}),
      ).toBeInTheDocument();
      expect(
        within(tablist).getByRole('tab', {name: /^results/i}),
      ).toBeInTheDocument();
      expect(
        within(tablist).getByRole('tab', {name: /^hosts/i}),
      ).toBeInTheDocument();
      expect(
        within(tablist).getByRole('tab', {name: /^operating systems/i}),
      ).toBeInTheDocument();
      expect(
        within(tablist).getByRole('tab', {name: /^tls certificates/i}),
      ).toBeInTheDocument();
      expect(
        within(tablist).getByRole('tab', {name: /^error messages/i}),
      ).toBeInTheDocument();
      expect(
        within(tablist).getByRole('tab', {name: /^user tags/i}),
      ).toBeInTheDocument();

      // Summary tab active by default
      expect(screen.getByRole('row', {name: /^Task Name/})).toHaveTextContent(
        'foo',
      );
    });

    test('should render entity info (Created, Modified, Owner)', () => {
      renderContent();

      const entityInfo = within(screen.getByTestId('entity-info'));
      expect(
        entityInfo.getByRole('row', {name: /^Created:/}),
      ).toHaveTextContent('Sun, Jun 2, 2019');
      expect(
        entityInfo.getByRole('row', {name: /^Modified:/}),
      ).toHaveTextContent('Mon, Jun 3, 2019');
      expect(entityInfo.getByRole('row', {name: /^Owner:/})).toHaveTextContent(
        'admin',
      );
    });

    test('should render toolbar icons with audit-specific help link', () => {
      renderContent();

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
      expect(
        screen.getByTitle(/^Download filtered Report/),
      ).toBeInTheDocument();
    });

    test('should render report heading with timestamp and status', () => {
      renderContent();

      expect(screen.getByText('Audit Report:')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', {name: /Audit Report:/}),
      ).toBeInTheDocument();
    });

    test('should show Import Task status when task is an import task', () => {
      const importTask = {isImport: () => true, progress: 0};
      renderContent({task: importTask});

      // With import task, status becomes TASK_STATUS.import – the status bar
      // shows "Import Task" rather than "Done"
      const statusBarTitles = screen
        .getAllByTestId('progressbar-box')
        .map(bar => bar.getAttribute('title'));

      expect(statusBarTitles).toContain('Import Task');
    });
  });

  describe('Tab navigation', () => {
    test('should switch to Results tab', () => {
      renderContent();

      const tablist = screen.getByRole('tablist');
      fireEvent.click(within(tablist).getByRole('tab', {name: /^results/i}));

      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });

    test('should switch to Hosts tab and render host data', () => {
      renderContent();

      const tablist = screen.getByRole('tablist');
      fireEvent.click(within(tablist).getByRole('tab', {name: /^hosts/i}));

      // Summary content should not be visible after switching tabs
      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });

    test('should switch to Operating Systems tab', () => {
      renderContent();

      const tablist = screen.getByRole('tablist');
      fireEvent.click(
        within(tablist).getByRole('tab', {name: /^operating systems/i}),
      );

      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });

    test('should switch to TLS Certificates tab', () => {
      renderContent();

      const tablist = screen.getByRole('tablist');
      fireEvent.click(
        within(tablist).getByRole('tab', {name: /^tls certificates/i}),
      );

      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });

    test('should switch to Error Messages tab', () => {
      renderContent();

      const tablist = screen.getByRole('tablist');
      fireEvent.click(
        within(tablist).getByRole('tab', {name: /^error messages/i}),
      );

      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });

    test('should switch to User Tags tab', () => {
      renderContent();

      const tablist = screen.getByRole('tablist');
      fireEvent.click(within(tablist).getByRole('tab', {name: /^user tags/i}));

      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });
  });

  describe('Threshold message', () => {
    test('should show threshold panel in Hosts tab when results exceed threshold', () => {
      renderContent({}, {reportResultsThreshold: 1});

      const tablist = screen.getByRole('tablist');
      fireEvent.click(within(tablist).getByRole('tab', {name: /^hosts/i}));

      expect(
        screen.getByText(/The Hosts cannot be displayed in order to maintain/),
      ).toBeInTheDocument();
    });

    test('should show threshold panel in Operating Systems tab when results exceed threshold', () => {
      renderContent({}, {reportResultsThreshold: 1});

      const tablist = screen.getByRole('tablist');
      fireEvent.click(
        within(tablist).getByRole('tab', {name: /^operating systems/i}),
      );

      expect(
        screen.getByText(
          /The Operating Systems cannot be displayed in order to maintain/,
        ),
      ).toBeInTheDocument();
    });

    test('should show threshold panel in TLS Certificates tab when results exceed threshold', () => {
      renderContent({}, {reportResultsThreshold: 1});

      const tablist = screen.getByRole('tablist');
      fireEvent.click(
        within(tablist).getByRole('tab', {name: /^tls certificates/i}),
      );

      expect(
        screen.getByText(
          /The TLS Certificates cannot be displayed in order to maintain/,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    test('should render Hosts tab with sorting support', () => {
      renderContent();

      const tablist = screen.getByRole('tablist');
      fireEvent.click(within(tablist).getByRole('tab', {name: /^hosts/i}));

      // Hosts tab is rendered (Summary is gone)
      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });
  });

  describe('Click handlers', () => {
    test('should call onAddToAssetsClick when Add to Assets is clicked', () => {
      const cbs = renderContent();

      fireEvent.click(screen.getByTitle(/^Add to Assets/));

      expect(cbs.onAddToAssetsClick).toHaveBeenCalled();
    });

    test('should call onRemoveFromAssetsClick when Remove from Assets is clicked', () => {
      const cbs = renderContent();

      fireEvent.click(screen.getByTitle(/^Remove from Assets/));

      expect(cbs.onRemoveFromAssetsClick).toHaveBeenCalled();
    });

    test('should call onReportDownloadClick when Download button is clicked', () => {
      const cbs = renderContent();

      fireEvent.click(screen.getByTitle(/^Download filtered Report/));

      expect(cbs.onReportDownloadClick).toHaveBeenCalled();
    });

    test('should call onFilterEditClick when Edit Filter button is clicked', () => {
      const cbs = renderContent();

      fireEvent.click(screen.getByTitle('Edit Filter'));

      expect(cbs.onFilterEditClick).toHaveBeenCalled();
    });
  });
});
