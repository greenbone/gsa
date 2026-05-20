/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {act, rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import ErrorsTab from 'web/pages/reports/details/ErrorsTab';

const filter = Filter.fromString('first=1 rows=10');

const {errors: mockReportErrors} = getMockReport();
const mockErrors = mockReportErrors?.entities ?? [];
const mockErrorsCounts =
  mockReportErrors?.counts ??
  new CollectionCounts({filtered: 0, all: 0, first: 1, rows: 10});

const createGmp = ({
  getReportErrors = testing.fn().mockResolvedValue({
    data: mockErrors,
    meta: {
      filter,
      counts: mockErrorsCounts,
    },
  }),
} = {}) => ({
  reporterrors: {
    get: getReportErrors,
  },
  settings: {
    reloadInterval: 5000,
    reloadIntervalActive: 2000,
    reloadIntervalInactive: 10000,
  },
  session: createSession({
    timezone: 'CET',
    token: 'test-token',
    username: 'admin',
  }),
});

const reportId = 'report-123';
const reloadIntervalActive = 2000;

describe('ErrorsTab', () => {
  test('should render loading state initially', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(<ErrorsTab filter={filter} reportId={reportId} status="Done" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should render table with errors', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(<ErrorsTab filter={filter} reportId={reportId} status="Done" />);

    const table = await screen.findByRole('table');
    expect(table).toBeInTheDocument();

    const header = within(table).getAllByRole('columnheader');
    expect(header[0]).toHaveTextContent('Error Message');
    expect(header[1]).toHaveTextContent('Host');
    expect(header[2]).toHaveTextContent('Hostname');
    expect(header[3]).toHaveTextContent('NVT');
    expect(header[4]).toHaveTextContent('Port');

    const rows = within(table).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('This is another error.');
    expect(rows[1]).toHaveTextContent('109.876.54.321');
    expect(rows[1]).toHaveTextContent('NVT2');
    expect(rows[1]).toHaveTextContent('456/tcp');

    expect(rows[2]).toHaveTextContent('This is an error.');
    expect(rows[2]).toHaveTextContent('123.456.78.910');
    expect(rows[2]).toHaveTextContent('NVT1');
    expect(rows[2]).toHaveTextContent('123/tcp');
  });

  test('should render empty state when no errors', async () => {
    const gmp = createGmp({
      getReportErrors: testing.fn().mockResolvedValue({
        data: [],
        meta: {
          filter,
          counts: new CollectionCounts({
            filtered: 0,
            all: 0,
            first: 1,
            rows: 10,
          }),
        },
      }),
    });
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(<ErrorsTab filter={filter} reportId={reportId} status="Done" />);

    expect(await screen.findByText('No Errors available')).toBeInTheDocument();
  });

  test('should render error panel on fetch failure', async () => {
    const gmp = createGmp({
      getReportErrors: testing
        .fn()
        .mockRejectedValue(new Error('Failed to fetch errors')),
    });
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(<ErrorsTab filter={filter} reportId={reportId} status="Done" />);

    expect(
      await screen.findByText(/Error while loading Errors for Report/),
    ).toBeInTheDocument();
  });

  test('should call API with filter containing report ID', async () => {
    const getReportErrors = testing.fn().mockResolvedValue({
      data: mockErrors,
      meta: {filter, counts: mockErrorsCounts},
    });
    const gmp = createGmp({getReportErrors});
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(<ErrorsTab filter={filter} reportId={reportId} status="Done" />);

    await screen.findByRole('table');

    expect(getReportErrors).toHaveBeenCalledWith(
      expect.objectContaining({
        report_id: reportId,
        filter: expect.objectContaining({}),
      }),
    );
  });

  test('should show applied filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true, capabilities: true});

    render(<ErrorsTab filter={filter} reportId={reportId} status="Done" />);

    await screen.findByRole('table');

    expect(screen.getByText(/Applied filter:/)).toBeInTheDocument();
  });

  describe('Errors polling behavior isActive status', () => {
    test.each([
      [
        'should poll errors when task status is active',
        'Running',
        reloadIntervalActive + 50,
        2,
      ],
      [
        'should not poll errors when task status is not active',
        'Stopped',
        reloadIntervalActive * 10,
        1,
      ],
    ])('%s', async (_, status, timeToAdvance, expectedCallCount) => {
      testing.useFakeTimers();

      const getReportErrors = testing.fn().mockResolvedValue({
        data: mockErrors,
        meta: {filter, counts: mockErrorsCounts},
      });
      const gmp = createGmp({getReportErrors});
      const {render} = rendererWith({gmp, router: true, capabilities: true});

      render(
        <ErrorsTab
          filter={filter}
          reportId={reportId}
          status={status as 'Running' | 'Stopped'}
        />,
      );

      await act(async () => {});
      expect(getReportErrors).toHaveBeenCalledTimes(1);

      await act(async () => {
        await testing.advanceTimersByTimeAsync(timeToAdvance);
      });

      expect(getReportErrors).toHaveBeenCalledTimes(expectedCallCount);

      testing.useRealTimers();
    });
  });
});
