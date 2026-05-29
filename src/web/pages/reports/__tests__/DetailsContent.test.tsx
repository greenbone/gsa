/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, within, rendererWith, fireEvent} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Report from 'gmp/models/report';
import {createSession} from 'gmp/testing';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import DetailsContent from 'web/pages/reports/DetailsContent';

const mockReport = getMockReport();

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const filterWithName = Filter.fromElement({
  term: 'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
  name: 'foo',
  _id: '123',
});

const resetFilter = Filter.fromString('first=1 sort-reverse=severity');

const manualUrl = 'test/';

const defaultSorting = {
  apps: {sortField: 'severity', sortReverse: true},
  closedcves: {sortField: 'severity', sortReverse: true},
  cves: {sortField: 'severity', sortReverse: true},
  errors: {sortField: 'error', sortReverse: true},
  hosts: {sortField: 'severity', sortReverse: true},
  os: {sortField: 'severity', sortReverse: true},
  ports: {sortField: 'severity', sortReverse: true},
  results: {sortField: 'severity', sortReverse: true},
  tlscerts: {sortField: 'dn', sortReverse: true},
};

const createGmp = ({reportResultsThreshold = 10} = {}) => ({
  settings: {
    manualUrl,
    reportResultsThreshold,
    reloadInterval: 5000,
    reloadIntervalActive: 2000,
    reloadIntervalInactive: 10000,
  },
  reporthosts: {
    get: testing.fn().mockResolvedValue({
      data: mockReport.hosts ?? [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 2, all: 2}),
      },
    }),
  },
  reportports: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 2, all: 2}),
      },
    }),
  },
  reportapplications: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 4, all: 4}),
      },
    }),
  },
  reportoperatingsystems: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 2, all: 2}),
      },
    }),
  },
  reportcves: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 2, all: 2}),
      },
    }),
  },
  reportclosedcves: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 2, all: 2}),
      },
    }),
  },
  reporttlscertificates: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 2, all: 2}),
      },
    }),
  },
  reporterrors: {
    get: testing.fn().mockResolvedValue({
      data: mockReport.errors?.entities ?? [],
      meta: {
        filter: Filter.fromString('rows=10'),
        counts:
          mockReport.errors?.counts ??
          new CollectionCounts({filtered: 2, all: 2}),
      },
    }),
  },
  session: createSession({
    token: 'test-token',
    username: 'admin',
    timezone: 'Europe/Berlin',
  }),
  user: {
    currentSettings: testing.fn().mockResolvedValue({
      reportexportfilename: {
        id: 'report-export-filename',
        name: 'Report Export File Name',
        value: '%T-%U',
      },
    }),
    getReportComposerDefaults: testing.fn().mockResolvedValue({foo: 'bar'}),
  },
  results: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({filtered: 0, all: 0}),
      },
    }),
  },
});

const createMockProps = (overrides: Record<string, unknown> = {}) => {
  const mockReport = getMockReport();
  const {entity} = mockReport;

  return {
    entity,
    task: entity.report?.task,
    reportId: entity.report?.id ?? '',
    reportFilter: filter,
    pageFilter: filter,
    resetFilter,
    filters: [filterWithName],
    isLoading: false,
    isLoadingFilters: false,
    isUpdating: false,
    sorting: defaultSorting,
    reportError: undefined,
    resultsCounts: {full: 3, filtered: 2},
    hostsCounts: new CollectionCounts({all: 2, filtered: 2}),
    portsCounts: new CollectionCounts({all: 2, filtered: 2}),
    applicationsCounts: new CollectionCounts({all: 4, filtered: 4}),
    operatingSystemsCounts: new CollectionCounts({all: 2, filtered: 2}),
    cvesCounts: new CollectionCounts({all: 2, filtered: 2}),
    closedCvesCounts: new CollectionCounts({all: 2, filtered: 2}),
    tlsCertificatesCounts: new CollectionCounts({all: 2, filtered: 2}),
    errorsCounts: new CollectionCounts({all: 2, filtered: 2}),
    showError: testing.fn(),
    showErrorMessage: testing.fn(),
    showSuccessMessage: testing.fn(),
    onAddToAssetsClick: testing.fn(),
    onTlsCertificateDownloadClick: testing.fn(),
    onError: testing.fn(),
    onFilterAddLogLevelClick: testing.fn(),
    onFilterChanged: testing.fn(),
    onFilterCreated: testing.fn(),
    onFilterDecreaseMinQoDClick: testing.fn(),
    onFilterEditClick: testing.fn(),
    onFilterRemoveSeverityClick: testing.fn(),
    onFilterRemoveClick: testing.fn(),
    onFilterResetClick: testing.fn(),
    onRemoveFromAssetsClick: testing.fn(),
    onReportDownloadClick: testing.fn(),
    onSortChange: testing.fn(),
    onTagSuccess: testing.fn(),
    onTargetEditClick: testing.fn(),
    ...overrides,
  };
};

const setupRenderer = (gmpOptions: {reportResultsThreshold?: number} = {}) => {
  const gmp = createGmp(gmpOptions);
  const {render, store} = rendererWith({
    gmp,
    capabilities: true,
    router: true,
    store: true,
  });
  return {render, store};
};

const importEntity = Report.fromElement({
  report: {
    _id: '7777',
    scan_run_status: 'Done',
    scan_start: '2019-06-03T11:00:22Z',
    scan_end: '2019-06-03T11:31:23Z',
    timestamp: '2019-06-03T11:00:22Z',
    timezone: 'UTC',
    timezone_abbrev: 'UTC',
    task: {_id: '999', name: 'import-task', comment: 'imported'},
    result_count: {full: 0, filtered: 0},
    hosts: {count: 0},
  },
  creation_time: '2019-06-02T12:00:22Z',
  modification_time: '2019-06-03T11:00:22Z',
  name: '2019-06-03T11:00:22Z',
  owner: {name: 'admin'},
  _id: '7777',
});

const containerEntity = Report.fromElement({
  report: {
    _id: '5555',
    scan_run_status: 'Done',
    scan_start: '2019-06-03T11:00:22Z',
    scan_end: '2019-06-03T11:31:23Z',
    timestamp: '2019-06-03T11:00:22Z',
    timezone: 'UTC',
    timezone_abbrev: 'UTC',
    task: {
      _id: '314',
      name: 'Container Task',
      comment: '',
      target: {_id: '159'},
      oci_image_target: {_id: 'oci-1'},
    },
    result_count: {full: 0, filtered: 0},
    hosts: {count: 0},
  },
  creation_time: '2019-06-02T12:00:22Z',
  modification_time: '2019-06-03T11:00:22Z',
  name: '2019-06-03T11:00:22Z',
  owner: {name: 'admin'},
  _id: '5555',
});

const agentEntity = Report.fromElement({
  report: {
    _id: '6666',
    scan_run_status: 'Done',
    scan_start: '2019-06-03T11:00:22Z',
    scan_end: '2019-06-03T11:31:23Z',
    timestamp: '2019-06-03T11:00:22Z',
    timezone: 'UTC',
    timezone_abbrev: 'UTC',
    task: {
      _id: '314',
      name: 'Agent Task',
      comment: '',
      target: {_id: '159'},
      agent_group: {_id: 'ag-1'},
    },
    result_count: {full: 0, filtered: 0},
    hosts: {count: 0},
  },
  creation_time: '2019-06-02T12:00:22Z',
  modification_time: '2019-06-03T11:00:22Z',
  name: '2019-06-03T11:00:22Z',
  owner: {name: 'admin'},
  _id: '6666',
});

const zeroCounts = {
  resultsCounts: {full: 0, filtered: 0},
  hostsCounts: new CollectionCounts({all: 0, filtered: 0}),
  portsCounts: new CollectionCounts({all: 0, filtered: 0}),
  applicationsCounts: new CollectionCounts({all: 0, filtered: 0}),
  operatingSystemsCounts: new CollectionCounts({all: 0, filtered: 0}),
  cvesCounts: new CollectionCounts({all: 0, filtered: 0}),
  closedCvesCounts: new CollectionCounts({all: 0, filtered: 0}),
  tlsCertificatesCounts: new CollectionCounts({all: 0, filtered: 0}),
  errorsCounts: new CollectionCounts({all: 0, filtered: 0}),
};

describe('DetailsContent', () => {
  describe('Error state', () => {
    test('should render ErrorPanel when no entity and reportError is defined', () => {
      const reportError = new Error('An error occurred');
      const props = createMockProps({
        entity: undefined,
        reportError,
        reportId: 'r1',
      });

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      screen.getByText(/Error while loading Report r1/);
    });

    test('should not render ErrorPanel early return when entity is present', () => {
      const props = createMockProps({
        reportError: new Error('stale error'),
      });

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      // When entity is present, the component does NOT return the ErrorPanel early.
      // Instead it renders the full report view (tabs, toolbar, etc.)
      const tablist = screen.getByRole('tablist');
      expect(within(tablist).getAllByRole('tab')).toHaveLength(11);
    });
  });

  describe('Loading state', () => {
    test('should render Loading spinner when isLoading and no entity', () => {
      const props = createMockProps({
        entity: undefined,
        isLoading: true,
      });

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      screen.getByTestId('loading');
    });

    test('should show "Loading" text in header when isLoading and no entity', () => {
      const props = createMockProps({
        entity: undefined,
        isLoading: true,
      });

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      screen.getByText('Loading');
      screen.getByText('Report:');
    });

    test('should not show Loading spinner when entity is available', () => {
      const props = createMockProps({isLoading: false});

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    test('should not render tabs when loading and no entity', () => {
      const props = createMockProps({
        entity: undefined,
        isLoading: true,
      });

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });
  });

  describe('Report header and entity info', () => {
    test('should render report date, status bar, and entity info', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      // Header with date and status
      expect(screen.getByRole('heading', {name: /Report:/})).toHaveTextContent(
        'Mon, Jun 3, 2019 1:00 PMCentral European Summer TimeDone',
      );

      // StatusBar
      const bars = screen.getAllByTestId('progressbar-box');
      expect(bars[0]).toHaveAttribute('title', 'Done');

      // EntityInfo
      const entityInfo = within(screen.getByTestId('entity-info'));
      entityInfo.getByText(/Created:/);
      entityInfo.getByText(/Modified:/);
      entityInfo.getByText(/Owner:/);
    });

    test('should not render EntityInfo when no entity', () => {
      const props = createMockProps({
        entity: undefined,
        isLoading: true,
      });

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      expect(screen.queryByTestId('entity-info')).not.toBeInTheDocument();
    });
  });

  describe('Toolbar icons', () => {
    test('should render toolbar action links with correct hrefs', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      expect(
        screen.getByTitle('Help: Reading Reports').closest('a'),
      ).toHaveAttribute('href', 'test/en/reports.html#reading-a-report');

      expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
        'href',
        '/reports',
      );

      expect(screen.getByTitle(/^Corresponding Task/)).toHaveAttribute(
        'href',
        '/task/314',
      );
      expect(screen.getByTitle(/^Corresponding Results/)).toHaveAttribute(
        'href',
        '/results?filter=report_id%3D1234',
      );
      expect(
        screen.getByTitle(/^Corresponding Vulnerabilities/),
      ).toHaveAttribute('href', '/vulnerabilities?filter=report_id%3D1234');
      expect(
        screen.getByTitle(/^Corresponding TLS Certificates/),
      ).toHaveAttribute('href', '/tlscertificates?filter=report_id%3D1234');
    });

    test('should render asset action buttons', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      screen.getByTitle(/^Add to Assets/);
      screen.getByTitle(/^Remove from Assets/);
      screen.getByTitle(/^Download filtered Report/);
      screen.getByTitle(/^Trigger Alert/);
    });
  });

  describe('Powerfilter', () => {
    test('should render Powerfilter with filter input', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      const powerFilter = within(screen.getPowerFilter());
      const inputs = powerFilter.queryTextInputs();

      expect(inputs[0]).toHaveAttribute('name', 'userFilterString');
      powerFilter.getByTitle('Loaded filter');
    });
  });

  describe('Tabs', () => {
    test('should render all 11 tabs with correct names', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      const tablist = screen.getByRole('tablist');
      const tabs = within(tablist).getAllByRole('tab');
      expect(tabs).toHaveLength(11);

      within(tablist).getByRole('tab', {name: /^information/i});
      within(tablist).getByRole('tab', {name: /^results/i});
      within(tablist).getByRole('tab', {name: /^hosts/i});
      within(tablist).getByRole('tab', {name: /^ports/i});
      within(tablist).getByRole('tab', {name: /^applications/i});
      within(tablist).getByRole('tab', {name: /^operating systems/i});
      within(tablist).getByRole('tab', {name: /^cves/i});
      within(tablist).getByRole('tab', {name: /^closed cves/i});
      within(tablist).getByRole('tab', {name: /^tls certificates/i});
      within(tablist).getByRole('tab', {name: /^error messages/i});
      within(tablist).getByRole('tab', {name: /^user tags/i});
    });

    test('should display counts in tab titles', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      const tablist = screen.getByRole('tablist');
      // Results count comes from props (synchronous)
      expect(
        within(tablist).getByRole('tab', {name: /^results/i}),
      ).toHaveTextContent('2 of 3');
      // Hook-based counts show loading indicator initially
      expect(
        within(tablist).getByRole('tab', {name: /^hosts/i}),
      ).toHaveTextContent('...');
      expect(
        within(tablist).getByRole('tab', {name: /^ports/i}),
      ).toHaveTextContent('...');
      expect(
        within(tablist).getByRole('tab', {name: /^applications/i}),
      ).toHaveTextContent('...');
      expect(
        within(tablist).getByRole('tab', {name: /^operating systems/i}),
      ).toHaveTextContent('...');
      expect(
        within(tablist).getByRole('tab', {name: /^cves/i}),
      ).toHaveTextContent('...');
      expect(
        within(tablist).getByRole('tab', {name: /^closed cves/i}),
      ).toHaveTextContent('...');
      expect(
        within(tablist).getByRole('tab', {name: /^tls certificates/i}),
      ).toHaveTextContent('...');
      expect(
        within(tablist).getByRole('tab', {name: /^error messages/i}),
      ).toHaveTextContent('...');
      expect(
        within(tablist).getByRole('tab', {name: /^user tags/i}),
      ).toHaveTextContent('0');
    });
  });

  describe('Summary tab (default)', () => {
    test('should render Summary content by default', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      // Summary shows task info, scan details, etc.
      const taskNameRow = screen.getByRole('row', {name: /^Task Name/});
      expect(taskNameRow).toHaveTextContent('foo');
      expect(within(taskNameRow).getByRole('link')).toHaveAttribute(
        'href',
        '/task/314',
      );

      expect(screen.getByRole('row', {name: /^Comment/})).toHaveTextContent(
        'bar',
      );
      expect(screen.getByRole('row', {name: /^Scan Time/})).toHaveTextContent(
        'Mon, Jun 3, 2019 1:00 PM Central European Summer Time - Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
      );
      expect(
        screen.getByRole('row', {name: /^Scan Duration/}),
      ).toHaveTextContent('0:31 h');
      expect(screen.getByRole('row', {name: /^Scan Status/})).toHaveTextContent(
        'Done',
      );
      expect(
        screen.getByRole('row', {name: /^Filter apply_overrides/}),
      ).toHaveTextContent('apply_overrides=0 levels=hml min_qod=70');
      expect(screen.getByRole('row', {name: /^Timezone/})).toHaveTextContent(
        'UTC (UTC)',
      );
    });
  });

  describe('Threshold handling', () => {
    test('should render ThresholdPanel for Hosts tab when results exceed threshold', () => {
      const props = createMockProps();

      const {render} = setupRenderer({reportResultsThreshold: 1});
      render(<DetailsContent {...props} />);

      // Click Hosts tab
      fireEvent.click(screen.getByRole('tab', {name: /^Hosts/}));

      screen.getByText(
        /The Hosts cannot be displayed in order to maintain the performance within the browser's capabilities/,
      );
      screen.getByText(
        /Please decrease the number of results below the threshold of 1 by applying a more refined filter/,
      );
    });

    test('should show filter suggestions in ThresholdPanel', () => {
      const props = createMockProps();

      const {render} = setupRenderer({reportResultsThreshold: 1});
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^Hosts/}));

      screen.getByText(
        /Results with the severity "Low" are currently included/,
      );
      screen.getByText(/Filter out results with the severity "Low"/);
      screen.getByText(
        /Results with the severity "Medium" are currently included/,
      );
      screen.getByText(/Filter out results with the severity "Medium"/);
      screen.getByText(/Your filter settings may be too unrefined/);
      screen.getByText(/Adjust and update your filter settings/);
      screen.getByText(
        /Applied filter: apply_overrides=0 levels=hml min_qod=70/,
      );
    });

    test('should not show host table data when threshold is exceeded', () => {
      const props = createMockProps();

      const {render} = setupRenderer({reportResultsThreshold: 1});
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^Hosts/}));

      expect(screen.queryByText('IP-Address')).not.toBeInTheDocument();
      expect(screen.queryByText('Hostname')).not.toBeInTheDocument();
    });

    test('should render ThresholdPanel for Applications tab when threshold exceeded', () => {
      const props = createMockProps();

      const {render} = setupRenderer({reportResultsThreshold: 1});
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^Applications/}));

      screen.getByText(
        /The Applications cannot be displayed in order to maintain the performance within the browser's capabilities/,
      );
    });

    test('should render ThresholdPanel for Operating Systems tab when threshold exceeded', () => {
      const props = createMockProps();

      const {render} = setupRenderer({reportResultsThreshold: 1});
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^Operating Systems/}));

      screen.getByText(
        /The Operating Systems cannot be displayed in order to maintain the performance within the browser's capabilities/,
      );
    });

    test('should render ThresholdPanel for CVEs tab when threshold exceeded', () => {
      const props = createMockProps();

      const {render} = setupRenderer({reportResultsThreshold: 1});
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^CVEs/}));

      screen.getByText(
        /The CVEs cannot be displayed in order to maintain the performance within the browser's capabilities/,
      );
    });

    test('should render ThresholdPanel for Closed CVEs tab when threshold exceeded', () => {
      const props = createMockProps();

      const {render} = setupRenderer({reportResultsThreshold: 1});
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^Closed CVEs/}));

      screen.getByText(
        /The Closed CVEs cannot be displayed in order to maintain the performance within the browser's capabilities/,
      );
    });

    test('should render ThresholdPanel for TLS Certificates tab when threshold exceeded', () => {
      const props = createMockProps();

      const {render} = setupRenderer({reportResultsThreshold: 1});
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^TLS Certificates/}));

      screen.getByText(
        /The TLS Certificates cannot be displayed in order to maintain the performance within the browser's capabilities/,
      );
    });

    test('should not show threshold when results count is within threshold', () => {
      const props = createMockProps();

      // High threshold - won't be exceeded
      const {render} = setupRenderer({reportResultsThreshold: 10000});
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^Hosts/}));

      expect(
        screen.queryByText(
          /cannot be displayed in order to maintain the performance/,
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe('Import task status', () => {
    test('should show Import status bar when task is an import task', () => {
      const props = createMockProps({
        entity: importEntity,
        reportId: '7777',
        task: importEntity.report?.task,
        ...zeroCounts,
      });

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      const bars = screen.getAllByTestId('progressbar-box');
      expect(bars[0]).toHaveAttribute('title', 'Import Task');
      expect(bars[0]).toHaveTextContent('Import Task');
    });

    test('should show Done status bar for normal task', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      const bars = screen.getAllByTestId('progressbar-box');
      expect(bars[0]).toHaveAttribute('title', 'Done');
      expect(bars[0]).toHaveTextContent('Done');
    });
  });

  describe('Container scanning', () => {
    test('should render without error for container scanning report', () => {
      const props = createMockProps({
        entity: containerEntity,
        reportId: '5555',
        task: containerEntity.report?.task,
        ...zeroCounts,
      });

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      screen.getByText('Report:');
      const tablist = screen.getByRole('tablist');
      expect(within(tablist).getAllByRole('tab')).toHaveLength(11);
    });
  });

  describe('Agent scanning', () => {
    test('should render without error for agent scanning report', () => {
      const props = createMockProps({
        entity: agentEntity,
        reportId: '6666',
        task: agentEntity.report?.task,
        ...zeroCounts,
      });

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      screen.getByText('Report:');
      const tablist = screen.getByRole('tablist');
      expect(within(tablist).getAllByRole('tab')).toHaveLength(11);
    });
  });

  describe('Tab panel switching', () => {
    test('should switch away from Summary when Results tab is clicked', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^Results/}));

      // Summary rows should not be visible after switching
      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });

    test('should show Hosts tab content when clicked', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^Hosts/}));

      // After clicking, Summary rows should not be visible
      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });

    test('should show Error Messages tab content when clicked', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^Error Messages/}));

      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });

    test('should show User Tags tab content when clicked', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      fireEvent.click(screen.getByRole('tab', {name: /^User Tags/}));

      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });
  });

  describe('Full render integration', () => {
    test('should render complete report view with all sections', () => {
      const props = createMockProps();

      const {render} = setupRenderer();
      render(<DetailsContent {...props} />);

      // Header
      expect(screen.getByRole('heading', {name: /Report:/})).toHaveTextContent(
        'Mon, Jun 3, 2019 1:00 PMCentral European Summer TimeDone',
      );

      // EntityInfo
      const entityInfo = within(screen.getByTestId('entity-info'));
      expect(
        entityInfo.getByRole('row', {name: /^Created:/}),
      ).toHaveTextContent(
        'Sun, Jun 2, 2019 2:00 PM Central European Summer Time',
      );
      expect(screen.getByRole('row', {name: /^Modified:/})).toHaveTextContent(
        'Mon, Jun 3, 2019 1:00 PM Central European Summer Time',
      );
      expect(screen.getByRole('row', {name: /^Owner:/})).toHaveTextContent(
        'admin',
      );

      // Toolbar
      screen.getByTitle('Help: Reading Reports');
      screen.getByTitle('Reports List');
      screen.getByTitle(/^Corresponding Performance/);

      // Tabs
      const tablist = screen.getByRole('tablist');
      expect(within(tablist).getAllByRole('tab')).toHaveLength(11);

      // Powerfilter
      within(screen.getPowerFilter()).getByTitle('Loaded filter');
    });
  });
});
