/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {act, rendererWith} from 'web/testing';
import {waitFor, screen} from '@testing-library/react';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';
import {createSession} from 'gmp/testing';
import WebApplicationScanningResultsTab from 'web/pages/reports/details/result/WebApplicationScanningResultsTab';

const result = Result.fromElement({
  _id: '1',
  name: 'Test Result',
  severity: 7.5,
});

const reloadIntervalActive = 100;

const createGmp = ({
  get = testing.fn().mockResolvedValue({
    data: [result],
    meta: {
      counts: new CollectionCounts({filtered: 1, all: 1, first: 1, rows: 10}),
      filter: Filter.fromString(''),
    },
  }),
} = {}) => ({
  results: {
    get,
  },
  settings: {
    reloadInterval: 15000,
    reloadIntervalActive,
    reloadIntervalInactive: 60000,
    enableEPSS: false,
  },
  session: createSession({token: 'test-token'}),
});

describe('WebApplicationScanningResultsTab', () => {
  test('should render loading state initially', () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('');
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(
      <WebApplicationScanningResultsTab
        reportFilter={filter}
        reportId={reportId}
        status={'Running'}
      />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should fetch results with report ID filter', async () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('severity>5');
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(
      <WebApplicationScanningResultsTab
        reportFilter={filter}
        reportId={reportId}
        status={'Stopped'}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    });

    expect(gmp.results.get).toHaveBeenCalled();
    const callArg = gmp.results.get.mock.calls[0][0];
    expect(callArg.filter.toFilterString()).toContain(
      '_and_report_id=report-123',
    );
  });

  test('should handle sorting', async () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('');
    const mockResults = [
      Result.fromElement({
        _id: '1',
        name: 'Result A',
        severity: 5.0,
      }),
      Result.fromElement({
        _id: '2',
        name: 'Result B',
        severity: 8.0,
      }),
    ];

    const getMock = testing.fn().mockResolvedValue({
      data: mockResults,
      meta: {
        counts: new CollectionCounts({filtered: 2, all: 2, first: 1, rows: 10}),
        filter,
      },
    });

    const gmp = createGmp({get: getMock});
    const {render} = rendererWith({gmp});

    const {userEvent} = render(
      <WebApplicationScanningResultsTab
        reportFilter={filter}
        reportId={reportId}
        status={'Stopped'}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    });

    const severityHeader = screen.getByRole('button', {name: /severity/i});
    await userEvent.click(severityHeader);

    await waitFor(() => {
      expect(gmp.results.get).toHaveBeenCalledTimes(2);
    });

    const secondCall = gmp.results.get.mock.calls[1][0];
    expect(secondCall.filter.toFilterString()).toContain('sort=severity');
  });

  test('should render error panel on error', async () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('');
    const getMock = testing.fn().mockRejectedValue(new Error('API Error'));
    const gmp = createGmp({get: getMock});
    const {render} = rendererWith({gmp});

    render(
      <WebApplicationScanningResultsTab
        reportFilter={filter}
        reportId={reportId}
        status={'Running'}
      />,
    );

    await waitFor(() => {
      expect(gmp.results.get).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Error while loading Web Application Scanning Results for Report report-123',
      );
    });
  });

  describe('Results polling behavior for active status', () => {
    test.each([
      [
        'should poll results when task status is active',
        'Running' as const,
        reloadIntervalActive + 50,
        2,
      ],
      [
        'should not poll results when task status is not active',
        'Stopped' as const,
        reloadIntervalActive * 10,
        1,
      ],
    ])(
      'status %s should call results.get expected number of times',
      async (_, status, timeToAdvance, expectedCallCount) => {
        testing.useFakeTimers();

        const getMock = testing.fn().mockResolvedValue({
          data: [result],
          meta: {
            counts: new CollectionCounts({
              filtered: 1,
              all: 1,
              first: 1,
              rows: 10,
            }),
            filter: Filter.fromString(''),
          },
        });

        const gmp = createGmp({get: getMock});
        const {render} = rendererWith({gmp});

        render(
          <WebApplicationScanningResultsTab
            reportFilter={Filter.fromString('')}
            reportId={'report-123'}
            status={status}
          />,
        );

        await act(async () => {});
        expect(getMock).toHaveBeenCalledTimes(1);

        await act(async () => {
          await testing.advanceTimersByTimeAsync(timeToAdvance);
        });

        expect(getMock).toHaveBeenCalledTimes(expectedCallCount);

        testing.useRealTimers();
      },
    );
  });
});
