/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import {ExistingSettings} from 'gmp/commands/user';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {
  useGetReport,
  useGetReportConfigs,
  useGetReportExportFileName,
  useGetReportFormats,
  useGetResultsFilters,
} from 'web/hooks/use-query/reports';

const filter = QueryFilter.fromString('rows=10');

const createListResponse = () => ({
  data: [{id: 'entity-1', name: 'Entity 1'}],
  meta: {
    filter,
    counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
  },
});

const createGmp = ({setting}: {setting?: unknown} = {}) => ({
  session: createSession({token: 'test-token'}),
  settings: {},
  report: {
    get: testing.fn().mockResolvedValue({data: {id: 'report-1'}}),
  },
  filters: {get: testing.fn().mockResolvedValue(createListResponse())},
  reportformats: {get: testing.fn().mockResolvedValue(createListResponse())},
  reportconfigs: {get: testing.fn().mockResolvedValue(createListResponse())},
  user: {
    getSetting: testing.fn().mockResolvedValue({data: setting}),
  },
});

describe('useGetReport', () => {
  test('should fetch a report with its filter and details disabled', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetReport({id: 'report-1', filter});
      return <div data-testid="report">{data?.id}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('report')).toHaveTextContent('report-1');
    });

    expect(gmp.report.get).toHaveBeenCalledWith(
      {id: 'report-1'},
      {filter: filter.toFilterString(), details: false},
    );
  });
});

describe('useGetResultsFilters', () => {
  test('should fetch result filters', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const filters = useGetResultsFilters();
      return <div data-testid="filters">{filters.data?.entities.length}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('filters')).toHaveTextContent('1');
    });

    expect(gmp.filters.get).toHaveBeenCalled();
  });
});

describe('useGetReportFormats', () => {
  test('should fetch report formats', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const formats = useGetReportFormats();
      return <div data-testid="formats">{formats.data?.entities.length}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('formats')).toHaveTextContent('1');
    });

    expect(gmp.reportformats.get).toHaveBeenCalled();
  });
});

describe('useGetReportConfigs', () => {
  test('should fetch report configs', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const configs = useGetReportConfigs();
      return <div data-testid="configs">{configs.data?.entities.length}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('configs')).toHaveTextContent('1');
    });

    expect(gmp.reportconfigs.get).toHaveBeenCalled();
  });
});

describe('useGetReportExportFileName', () => {
  test('should return the configured report export filename', async () => {
    const gmp = createGmp({setting: {value: 'report-name'}});
    const {renderHook} = rendererWith({gmp, router: true});
    const {result} = renderHook(() => useGetReportExportFileName());

    const filename = await result.current();

    expect(filename).toBe('report-name');
    expect(gmp.user.getSetting).toHaveBeenCalledWith(
      ExistingSettings.reportexportfilename,
    );
  });
});
