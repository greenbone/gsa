/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen, within} from 'web/testing';
import {Route, Routes} from 'react-router';
import CollectionCounts from 'gmp/collection/collection-counts';
import {ROWS_PER_PAGE_SETTING_ID} from 'gmp/commands/user';
import Filter from 'gmp/models/filter';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import DetailsPage from 'web/pages/reports/DetailsPage';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

interface CollectionResponse {
  data: unknown[];
  meta: {
    filter: Filter;
    counts: CollectionCounts;
  };
}

const manualUrl = 'test/';

const {entity} = getMockReport();
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
    session: {token: 'test-token'},
  },
  user: {
    currentSettings: testing
      .fn()
      .mockResolvedValue(currentSettingsDefaultResponse),
    getReportComposerDefaults: testing.fn().mockResolvedValue({data: {}}),
    getSetting: createGetSettingMock(),
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
  report: {
    get: testing.fn().mockResolvedValue({data: entity}),
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
    store: true,
    route: `/report/${reportId}`,
  });

  store.dispatch(setTimezone('CET'));
  store.dispatch(setUsername('admin'));

  return {render, store};
};

const renderPage = (render: ReturnType<typeof setupRenderer>['render']) =>
  render(
    <Routes>
      <Route element={<DetailsPage />} path="/report/:id" />
    </Routes>,
  );

describe('DetailsPage', () => {
  describe('Loading state', () => {
    test('should render Loading spinner while report is being fetched', () => {
      const gmp = createGmp();
      gmp.report.get = testing.fn().mockReturnValue(new Promise(() => {}));

      const {render} = setupRenderer(gmp);
      renderPage(render);

      screen.getByTestId('loading');
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });

    test('should show Loading text in header while report is being fetched', async () => {
      const gmp = createGmp();
      gmp.report.get = testing.fn().mockReturnValue(new Promise(() => {}));

      const {render} = setupRenderer(gmp);
      renderPage(render);

      await screen.findByText('Loading');
      screen.getByText('Report:');
      screen.getByTestId('loading');
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });
  });

  describe('Full render with entity', () => {
    test('should render report heading once entity is loaded', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByRole('heading', {name: /Report:/});
      expect(screen.getByRole('heading', {name: /Report:/})).toHaveTextContent(
        'Mon, Jun 3, 2019 1:00 PMCentral European Summer TimeDone',
      );
    });

    test('should render all 11 tabs once entity is loaded', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      const tablist = await screen.findByRole('tablist');
      expect(within(tablist).getAllByRole('tab')).toHaveLength(11);
    });

    test('should render toolbar help and list links', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByTitle('Help: Reading Reports');
      expect(
        screen.getByTitle('Help: Reading Reports').closest('a'),
      ).toHaveAttribute('href', 'test/en/reports.html#reading-a-report');
      expect(screen.getByTestId('list-link-icon')).toHaveAttribute(
        'href',
        '/reports',
      );
    });

    test('should render corresponding task link in toolbar', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByTitle(/^Corresponding Task/);
      expect(screen.getByTitle(/^Corresponding Task/)).toHaveAttribute(
        'href',
        '/task/314',
      );
    });

    test('should render Summary tab content by default', async () => {
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
        name: /Compose Content for Scan Report/,
      });
    });

    test('should close Download Report dialog when cancelled', async () => {
      const {render} = setupRenderer();
      renderPage(render);

      await screen.findByTitle(/^Download filtered Report/);
      fireEvent.click(screen.getByTitle(/^Download filtered Report/));

      await screen.findByRole('heading', {
        name: /Compose Content for Scan Report/,
      });

      fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));

      expect(
        screen.queryByRole('heading', {
          name: /Compose Content for Scan Report/,
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
      gmp.report.get = testing.fn().mockRejectedValue(loadError);

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
});
