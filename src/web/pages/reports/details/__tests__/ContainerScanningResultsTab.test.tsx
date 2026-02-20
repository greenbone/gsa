/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith} from 'web/testing';
import {waitFor, screen} from '@testing-library/react';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';
import ContainerScanningResultsTab from 'web/pages/reports/details/ContainerScanningResultsTab';

describe('ContainerScanningResultsTab', () => {
  test('should render loading state initially', () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('');

    const getMock = testing.fn().mockReturnValue(
      new Promise(() => {}), // Never resolves to keep loading state
    );

    const gmp = {
      results: {
        get: getMock,
      },
      settings: {
        token: 'test-token',
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTab reportFilter={filter} reportId={reportId} />,
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should fetch results with report ID filter', async () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('severity>5');
    const mockResults = [
      Result.fromElement({
        _id: '1',
        name: 'Test Result',
        severity: 7.5,
      }),
    ];

    const getMock = testing.fn().mockResolvedValue({
      data: mockResults,
      meta: {
        counts: new CollectionCounts({
          filtered: 1,
          all: 1,
          first: 1,
          rows: 10,
        }),
        filter,
      },
    });

    const gmp = {
      results: {
        get: getMock,
      },
      settings: {
        token: 'test-token',
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTab reportFilter={filter} reportId={reportId} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    });

    expect(getMock).toHaveBeenCalled();
    const callArg = getMock.mock.calls[0][0];
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
        counts: new CollectionCounts({
          filtered: 2,
          all: 2,
          first: 1,
          rows: 10,
        }),
        filter,
      },
    });

    const gmp = {
      results: {
        get: getMock,
      },
      settings: {
        token: 'test-token',
        enableEPSS: false,
      },
    };

    const {render} = rendererWith({gmp});

    const {userEvent} = render(
      <ContainerScanningResultsTab reportFilter={filter} reportId={reportId} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    });

    const severityHeader = screen.getByRole('button', {name: /severity/i});

    await userEvent.click(severityHeader);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledTimes(2);
    });

    const secondCall = getMock.mock.calls[1][0];
    expect(secondCall.filter.toFilterString()).toContain('sort=severity');
  });

  test('should handle pagination - next page', async () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('first=1 rows=10');
    const mockResults = [
      Result.fromElement({
        _id: '1',
        name: 'Result 1',
      }),
    ];

    const getMock = testing.fn().mockResolvedValue({
      data: mockResults,
      meta: {
        counts: new CollectionCounts({
          filtered: 20,
          all: 20,
          first: 1,
          rows: 10,
        }),
        filter,
      },
    });

    const gmp = {
      results: {
        get: getMock,
      },
      settings: {
        token: 'test-token',
      },
    };

    const {render} = rendererWith({gmp});

    const {userEvent} = render(
      <ContainerScanningResultsTab reportFilter={filter} reportId={reportId} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    });

    const nextButtons = screen.getAllByTitle(/next/i);
    const nextButton = nextButtons[0];

    await userEvent.click(nextButton);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledTimes(2);
    });

    const secondCall = getMock.mock.calls[1][0];
    expect(secondCall.filter.toFilterString()).toContain('first=11');
  });

  test('should handle pagination - previous page', async () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('first=11');
    const mockResults = [
      Result.fromElement({
        _id: '1',
        name: 'Result 1',
      }),
    ];

    const getMock = testing.fn().mockResolvedValue({
      data: mockResults,
      meta: {
        counts: new CollectionCounts({
          filtered: 20,
          all: 20,
          first: 11,
          rows: 10,
        }),
        filter,
      },
    });

    const gmp = {
      results: {
        get: getMock,
      },
      settings: {
        token: 'test-token',
      },
    };

    const {render} = rendererWith({gmp});

    const {userEvent} = render(
      <ContainerScanningResultsTab reportFilter={filter} reportId={reportId} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    });

    const previousButtons = screen.getAllByTitle(/previous/i);
    const previousButton = previousButtons[0];

    await userEvent.click(previousButton);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledTimes(2);
    });

    const secondCall = getMock.mock.calls[1][0];
    expect(secondCall.filter.toFilterString()).toContain('first=1');
  });

  test('should handle pagination - first page', async () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('first=11');
    const mockResults = [
      Result.fromElement({
        _id: '1',
        name: 'Result 1',
      }),
    ];

    const getMock = testing.fn().mockResolvedValue({
      data: mockResults,
      meta: {
        counts: new CollectionCounts({
          filtered: 20,
          all: 20,
          first: 11,
          rows: 10,
        }),
        filter,
      },
    });

    const gmp = {
      results: {
        get: getMock,
      },
      settings: {
        token: 'test-token',
      },
    };

    const {render} = rendererWith({gmp});

    const {userEvent} = render(
      <ContainerScanningResultsTab reportFilter={filter} reportId={reportId} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    });

    const firstButtons = screen.getAllByTitle(/first/i);
    const firstButton = firstButtons[0];

    await userEvent.click(firstButton);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledTimes(2);
    });

    const secondCall = getMock.mock.calls[1][0];
    expect(secondCall.filter.toFilterString()).toContain('first=1');
  });

  test('should handle pagination - last page', async () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('');
    const mockResults = [
      Result.fromElement({
        _id: '1',
        name: 'Result 1',
      }),
    ];

    const getMock = testing.fn().mockResolvedValue({
      data: mockResults,
      meta: {
        counts: new CollectionCounts({
          filtered: 25,
          all: 25,
          first: 1,
          rows: 10,
        }),
        filter,
      },
    });

    const gmp = {
      results: {
        get: getMock,
      },
      settings: {
        token: 'test-token',
      },
    };

    const {render} = rendererWith({gmp});

    const {userEvent} = render(
      <ContainerScanningResultsTab reportFilter={filter} reportId={reportId} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    });

    const lastButtons = screen.getAllByTitle(/last/i);
    const lastButton = lastButtons[0];

    await userEvent.click(lastButton);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledTimes(2);
    });

    const secondCall = getMock.mock.calls[1][0];
    expect(secondCall.filter.toFilterString()).toContain('first=21');
  });

  test('should update filter when reportFilter prop changes', async () => {
    const reportId = 'report-123';
    const filter1 = Filter.fromString('severity>5');
    const filter2 = Filter.fromString('severity>7');
    const mockResults = [
      Result.fromElement({
        _id: '1',
        name: 'Result 1',
      }),
    ];

    const getMock = testing.fn().mockResolvedValue({
      data: mockResults,
      meta: {
        counts: new CollectionCounts({
          filtered: 1,
          all: 1,
          first: 1,
          rows: 10,
        }),
        filter: filter1,
      },
    });

    const gmp = {
      results: {
        get: getMock,
      },
      settings: {
        token: 'test-token',
      },
    };

    const {render} = rendererWith({gmp});

    const {rerender} = render(
      <ContainerScanningResultsTab
        reportFilter={filter1}
        reportId={reportId}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    });

    rerender(
      <ContainerScanningResultsTab
        reportFilter={filter2}
        reportId={reportId}
      />,
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledTimes(2);
    });

    const secondCall = getMock.mock.calls[1][0];
    expect(secondCall.filter.toFilterString()).toContain('severity>7');
  });

  test('should render error panel on error', async () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('');

    const getMock = testing.fn().mockRejectedValue(new Error('API Error'));

    const gmp = {
      results: {
        get: getMock,
      },
      settings: {
        token: 'test-token',
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <ContainerScanningResultsTab reportFilter={filter} reportId={reportId} />,
    );

    await waitFor(() => {
      expect(getMock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('error-message')).toHaveTextContent(
        'Error while loading Container Scanning Results for Report report-123',
      );
    });
  });

  test('should show subtle loading indicator when refetching (not full spinner)', async () => {
    const reportId = 'report-123';
    const filter = Filter.fromString('');
    const mockResults = [
      Result.fromElement({
        _id: '1',
        name: 'Result 1',
      }),
    ];

    let resolveFirstQuery: ((value: unknown) => void) | undefined;
    let resolveSecondQuery: ((value: unknown) => void) | undefined;

    const firstQueryPromise = new Promise(resolve => {
      resolveFirstQuery = resolve;
    });

    const secondQueryPromise = new Promise(resolve => {
      resolveSecondQuery = resolve;
    });

    const getMock = testing
      .fn()
      .mockReturnValueOnce(firstQueryPromise)
      .mockReturnValueOnce(secondQueryPromise);

    const gmp = {
      results: {
        get: getMock,
      },
      settings: {
        token: 'test-token',
      },
    };

    const {render} = rendererWith({gmp});

    const {userEvent} = render(
      <ContainerScanningResultsTab reportFilter={filter} reportId={reportId} />,
    );

    if (resolveFirstQuery) {
      resolveFirstQuery({
        data: mockResults,
        meta: {
          counts: new CollectionCounts({
            filtered: 1,
            all: 1,
            first: 1,
            rows: 10,
          }),
          filter,
        },
      });
    }

    await waitFor(() => {
      expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    });

    const severityHeader = screen.getByRole('button', {name: /severity/i});
    await userEvent.click(severityHeader);

    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();

    if (resolveSecondQuery) {
      resolveSecondQuery({
        data: mockResults,
        meta: {
          counts: new CollectionCounts({
            filtered: 1,
            all: 1,
            first: 1,
            rows: 10,
          }),
          filter: Filter.fromString('sort=severity'),
        },
      });
    }

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledTimes(2);
    });
  });
});
