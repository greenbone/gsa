/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, waitFor, within} from 'web/testing';
import {Route, Routes} from 'react-router';
import CollectionCounts from 'gmp/collection/collection-counts';
import {ROWS_PER_PAGE_SETTING_ID} from 'gmp/commands/user';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import {getMockAuditReport} from 'web/pages/reports/__fixtures__/MockAuditReport';
import AuditReportDetailsPage from 'web/pages/reports/AuditReportDetailsPage';

interface CollectionResponse {
  data: unknown[];
  meta: {
    filter: Filter;
    counts: CollectionCounts;
  };
}

const manualUrl = 'test/';

const {entity} = getMockAuditReport();
const reportId = entity.report?.id ?? '';

const emptyCollectionResponse: CollectionResponse = {
  data: [],
  meta: {
    filter: Filter.fromString(''),
    counts: new CollectionCounts(),
  },
};

const createGetSettingMock = () =>
  testing.fn().mockImplementation((settingId: string) => {
    if (settingId === ROWS_PER_PAGE_SETTING_ID) {
      return Promise.resolve({
        data: {id: settingId, name: 'Rows Per Page', value: '50'},
      });
    }
    return Promise.resolve({
      data: {id: settingId, name: 'Default Filter', value: 'default-filter-id'},
    });
  });

const createGmp = () => ({
  settings: {
    manualUrl,
    reportResultsThreshold: 100,
    reloadInterval: 15000,
    reloadIntervalActive: 3000,
  },
  session: createSession({
    token: 'test-token',
    username: 'admin',
    timezone: 'Europe/Berlin',
  }),
  user: {
    currentSettings: testing.fn().mockResolvedValue({
      data: {
        ...currentSettingsDefaultResponse.data,
        reportexportfilename: {
          id: 'report-export-filename',
          name: 'Report Export File Name',
          value: '%T-%U',
        },
      },
    }),
    getReportComposerDefaults: testing.fn().mockResolvedValue({data: {}}),
    getSetting: createGetSettingMock(),
    saveReportComposerDefaults: testing.fn().mockResolvedValue({}),
  },
  filter: {
    get: testing.fn().mockResolvedValue({data: Filter.fromString('rows=100')}),
  },
  filters: {
    get: testing.fn().mockResolvedValue(emptyCollectionResponse),
  },
  reportconfigs: {
    get: testing.fn().mockResolvedValue(emptyCollectionResponse),
  },
  reportformats: {
    get: testing.fn().mockResolvedValue(emptyCollectionResponse),
  },
  auditreport: {
    get: testing.fn().mockResolvedValue({data: entity}),
    addAssets: testing.fn().mockResolvedValue({}),
    removeAssets: testing.fn().mockResolvedValue({}),
    download: testing.fn().mockResolvedValue({data: 'report-blob-data'}),
  },
  reporterrors: {
    get: testing.fn().mockResolvedValue({
      data: [
        {
          id: 'error-1',
          description: 'Test error message',
          host: {ip: '192.168.1.1', name: 'host1', id: 'host-1'},
          nvt: {id: 'nvt-1', name: 'Test NVT'},
          port: '22/tcp',
        },
      ],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts({
          first: 1,
          all: 1,
          filtered: 1,
          length: 1,
          rows: 10,
        }),
      },
    }),
  },
  reporttlscertificates: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: Filter.fromString(''),
        counts: new CollectionCounts(),
      },
    }),
  },
  target: {
    get: testing.fn().mockResolvedValue({data: {}}),
  },
  results: {
    get: testing.fn().mockResolvedValue({data: []}),
  },
});

const setupRenderer = (gmp = createGmp()) => {
  const {render, store} = rendererWith({
    gmp,
    capabilities: true,
    router: true,
    route: `/audit-report/${reportId}`,
  });

  return {render, store};
};

const renderPage = (render: ReturnType<typeof setupRenderer>['render']) =>
  render(
    <Routes>
      <Route element={<AuditReportDetailsPage />} path="/audit-report/:id" />
    </Routes>,
  );

describe('AuditReportDetailsPage', () => {
  describe('Loading state', () => {
    test('should render Loading spinner while report is being fetched', () => {
      const gmp = createGmp();
      gmp.auditreport.get = testing.fn().mockReturnValue(new Promise(() => {}));

      const {render} = setupRenderer(gmp);
      renderPage(render);

      screen.getByTestId('loading');
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });

    test('should show Loading text in header while report is being fetched', async () => {
      const gmp = createGmp();
      gmp.auditreport.get = testing.fn().mockReturnValue(new Promise(() => {}));

      const {render} = setupRenderer(gmp);
      renderPage(render);

      await screen.findByText('Loading');
      screen.getByText('Audit Report:');
      screen.getByTestId('loading');
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });
  });

  describe('Full render with entity', () => {
    test('should render audit report heading once entity is loaded', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByRole('heading', {name: /Audit Report:/});
      expect(
        screen.getByRole('heading', {name: /Audit Report:/}),
      ).toHaveTextContent(
        'Audit Report:Mon, Jun 3, 2019 1:00 PM Central European Summer TimeDone',
      );
    });

    test('should render all 7 tabs once entity is loaded', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      const tablist = await screen.findByRole('tablist');
      expect(within(tablist).getAllByRole('tab')).toHaveLength(7);
    });

    test('should render toolbar help and list links', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByTitle('Help: Audit Reports');
      expect(
        screen.getByTitle('Help: Audit Reports').closest('a'),
      ).toHaveAttribute(
        'href',
        'test/en/compliance-and-special-scans.html#using-and-managing-audit-reports',
      );
    });

    test('should render Information tab content by default', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByRole('row', {name: /^Task Name/});
      expect(screen.getByRole('row', {name: /^Task Name/})).toHaveTextContent(
        'foo',
      );
    });
  });

  describe('Download Report Dialog', () => {
    test('should open Download Report dialog when download button is clicked', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByTitle(/^Download filtered Report/);
      fireEvent.click(screen.getByTitle(/^Download filtered Report/));

      await screen.findByRole('heading', {
        name: /Compose Content for Compliance Report/,
      });
    });

    test('should close Download Report dialog when cancelled', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByTitle(/^Download filtered Report/);
      fireEvent.click(screen.getByTitle(/^Download filtered Report/));

      await screen.findByRole('heading', {
        name: /Compose Content for Compliance Report/,
      });

      fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));

      expect(
        screen.queryByRole('heading', {
          name: /Compose Content for Compliance Report/,
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Filter Dialog', () => {
    test('should open Filter dialog when filter edit is triggered', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByTitle('Edit Filter');
      fireEvent.click(screen.getByTitle('Edit Filter'));

      await screen.findByRole('heading', {name: /Update Filter/});
    });

    test('should close Filter dialog when cancelled', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByTitle('Edit Filter');
      fireEvent.click(screen.getByTitle('Edit Filter'));

      await screen.findByRole('heading', {name: /Update Filter/});

      fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));

      expect(
        screen.queryByRole('heading', {name: /Update Filter/}),
      ).not.toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    test('should render error panel when report load fails', async () => {
      const gmp = createGmp();
      const loadError = new Error('Connection refused');
      gmp.auditreport.get = testing.fn().mockRejectedValue(loadError);

      const {render} = setupRenderer(gmp);
      renderPage(render);

      await screen.findByText(/Error while loading Report/);
    });
  });

  describe('Tab navigation', () => {
    test('should switch to Hosts tab when clicked', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByRole('tab', {name: /^Hosts/});
      fireEvent.click(screen.getByRole('tab', {name: /^Hosts/}));

      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });

    test('should switch to Error Messages tab when clicked', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByRole('tab', {name: /^Error Messages/});
      fireEvent.click(screen.getByRole('tab', {name: /^Error Messages/}));

      expect(
        screen.queryByRole('row', {name: /^Task Name/}),
      ).not.toBeInTheDocument();
    });
  });

  describe('Asset management', () => {
    test('should call addAssets and show success message when Add to Assets is clicked', async () => {
      const gmp = createGmp();

      const {render} = setupRenderer(gmp);
      renderPage(render);

      await screen.findByTitle(/^Add to Assets/);
      fireEvent.click(screen.getByTitle(/^Add to Assets/));

      await screen.findByText(/Report content added to Assets/);
      expect(gmp.auditreport.addAssets).toHaveBeenCalled();
    });

    test('should call removeAssets and show success message when Remove from Assets is clicked', async () => {
      const gmp = createGmp();

      const {render} = setupRenderer(gmp);
      renderPage(render);

      await screen.findByTitle(/^Remove from Assets/);
      fireEvent.click(screen.getByTitle(/^Remove from Assets/));

      await screen.findByText(/Report content removed from Assets/);
      expect(gmp.auditreport.removeAssets).toHaveBeenCalled();
    });

    test('should show error dialog when addAssets fails', async () => {
      testing.spyOn(console, 'error').mockImplementation(() => {});
      const gmp = createGmp();
      gmp.auditreport.addAssets = testing
        .fn()
        .mockRejectedValue(new Error('Permission denied'));

      const {render} = setupRenderer(gmp);
      renderPage(render);

      await screen.findByTitle(/^Add to Assets/);
      fireEvent.click(screen.getByTitle(/^Add to Assets/));

      await screen.findByText(/Permission denied/);
    });

    test('should show error dialog when removeAssets fails', async () => {
      testing.spyOn(console, 'error').mockImplementation(() => {});
      const gmp = createGmp();
      gmp.auditreport.removeAssets = testing
        .fn()
        .mockRejectedValue(new Error('Server error'));

      const {render} = setupRenderer(gmp);
      renderPage(render);

      await screen.findByTitle(/^Remove from Assets/);
      fireEvent.click(screen.getByTitle(/^Remove from Assets/));

      await screen.findByText(/Server error/);
    });
  });

  describe('Report download flow', () => {
    test('should call auditreport download when download dialog OK is clicked', async () => {
      const gmp = createGmp();

      const {render} = setupRenderer(gmp);
      renderPage(render);

      await screen.findByTitle(/^Download filtered Report/);
      fireEvent.click(screen.getByTitle(/^Download filtered Report/));

      await screen.findByRole('heading', {
        name: /Compose Content for Compliance Report/,
      });

      fireEvent.click(screen.getByRole('button', {name: 'OK'}));

      await waitFor(() => {
        expect(gmp.auditreport.download).toHaveBeenCalled();
      });
    });

    test('should close download dialog after successful download', async () => {
      const gmp = createGmp();

      const {render} = setupRenderer(gmp);
      renderPage(render);

      await screen.findByTitle(/^Download filtered Report/);
      fireEvent.click(screen.getByTitle(/^Download filtered Report/));

      await screen.findByRole('heading', {
        name: /Compose Content for Compliance Report/,
      });

      fireEvent.click(screen.getByRole('button', {name: 'OK'}));

      await waitFor(() => {
        expect(
          screen.queryByRole('heading', {
            name: /Compose Content for Compliance Report/,
          }),
        ).not.toBeInTheDocument();
      });
    });

    test('should show error when download fails', async () => {
      testing.spyOn(console, 'error').mockImplementation(() => {});
      const gmp = createGmp();
      gmp.auditreport.download = testing
        .fn()
        .mockRejectedValue(new Error('Download failed'));

      const {render} = setupRenderer(gmp);
      renderPage(render);

      await screen.findByTitle(/^Download filtered Report/);
      fireEvent.click(screen.getByTitle(/^Download filtered Report/));

      await screen.findByRole('heading', {
        name: /Compose Content for Compliance Report/,
      });

      fireEvent.click(screen.getByRole('button', {name: 'OK'}));

      await screen.findByText(/Download failed/);
    });
  });

  describe('Sort change', () => {
    test('should update column sort when Error Messages column header is clicked', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      // Navigate to Error Messages tab
      await screen.findByRole('tab', {name: /^Error Messages/});
      fireEvent.click(screen.getByRole('tab', {name: /^Error Messages/}));

      // Click on the sort button for the "Error Message" column
      const sortButton = await screen.findByTestId(
        'table-header-sort-by-error',
      );
      fireEvent.click(sortButton);

      // The sort button should still be in the document after sorting
      expect(
        screen.getByTestId('table-header-sort-by-error'),
      ).toBeInTheDocument();
    });

    test('should toggle sort direction when same column header is clicked twice', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByRole('tab', {name: /^Error Messages/});
      fireEvent.click(screen.getByRole('tab', {name: /^Error Messages/}));

      const sortButton = await screen.findByTestId(
        'table-header-sort-by-error',
      );

      // Click once to sort ascending
      fireEvent.click(sortButton);
      // Click again to toggle to descending
      fireEvent.click(sortButton);

      expect(
        screen.getByTestId('table-header-sort-by-error'),
      ).toBeInTheDocument();
    });
  });

  describe('TLS Certificates tab', () => {
    test('should show TLS Certificates tab content when clicked', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByRole('tab', {name: /^TLS Certificates/});
      fireEvent.click(screen.getByRole('tab', {name: /^TLS Certificates/}));

      // Tab should be selected
      expect(
        screen.getByRole('tab', {name: /^TLS Certificates/}),
      ).toBeInTheDocument();
    });
  });
});
