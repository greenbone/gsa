/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
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
    currentSettings: testing.fn().mockResolvedValue({
      data: setting === undefined ? {} : {reportexportfilename: setting},
    }),
  },
});

describe('report query hooks', () => {
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

  test('should fetch result filters, report formats, and report configs', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const filters = useGetResultsFilters();
      const formats = useGetReportFormats();
      const configs = useGetReportConfigs();
      return (
        <div data-testid="counts">
          {Number(filters.data?.entities.length ?? 0) +
            Number(formats.data?.entities.length ?? 0) +
            Number(configs.data?.entities.length ?? 0)}
        </div>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('counts')).toHaveTextContent('3');
    });

    expect(gmp.filters.get).toHaveBeenCalled();
    expect(gmp.reportformats.get).toHaveBeenCalled();
    expect(gmp.reportconfigs.get).toHaveBeenCalled();
  });

  test('should return the configured report export filename', async () => {
    const gmp = createGmp({setting: {value: 'report-name'}});
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetReportExportFileName();
      return <div data-testid="filename">{data}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('filename')).toHaveTextContent('report-name');
    });

    expect(gmp.user.currentSettings).toHaveBeenCalledWith();
  });

  test('should not fetch the report export filename without a token', () => {
    const gmp = createGmp();
    gmp.session.token = undefined;
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetReportExportFileName();
      return <div />;
    };

    render(<TestComponent />);

    expect(gmp.user.currentSettings).not.toHaveBeenCalled();
  });
});
