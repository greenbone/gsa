/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import ReportOperatingSystem from 'gmp/models/report/os';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {useGetReportOperatingSystems} from 'web/hooks/use-query/report-operating-system';

const os1 = ReportOperatingSystem.fromElement({
  best_os_cpe: 'cpe:/foo/bar',
  best_os_txt: 'Foo OS',
});
os1.hosts.count = 2;

const os2 = ReportOperatingSystem.fromElement({
  best_os_cpe: 'cpe:/lorem/ipsum',
  best_os_txt: 'Lorem OS',
});
os2.hosts.count = 5;

const filter = Filter.fromString('rows=10 first=1');

const TestComponent = ({
  reportId,
  filter: testFilter,
}: {
  reportId: string;
  filter?: Filter;
}) => {
  const {data, isLoading, isError} = useGetReportOperatingSystems({
    reportId,
    filter: testFilter,
  });

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }
  if (isError) {
    return <div data-testid="error">Error</div>;
  }
  if (!data) {
    return <div data-testid="no-data">No data</div>;
  }

  return (
    <div data-testid="entities">
      {data.entities.map(os => (
        <div key={os.cpe} data-testid="os-entity">
          {os.name}
        </div>
      ))}
    </div>
  );
};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {severityRating: SEVERITY_RATING_CVSS_3},
  reportoperatingsystems: {
    get: testing.fn().mockResolvedValue({
      data: [os1, os2],
      meta: {
        filter,
        counts: new CollectionCounts({all: 2, filtered: 2, length: 2}),
      },
    }),
  },
});

describe('useGetReportOperatingSystems', () => {
  test('should fetch OS entities for a given reportId', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<TestComponent filter={filter} reportId="1234" />);

    await waitFor(() => {
      expect(screen.getAllByTestId('os-entity')).toHaveLength(2);
    });

    expect(gmp.reportoperatingsystems.get).toHaveBeenCalledWith(
      expect.objectContaining({report_id: '1234'}),
    );
    expect(screen.getByText('Foo OS')).toBeInTheDocument();
    expect(screen.getByText('Lorem OS')).toBeInTheDocument();
  });

  test('should show loading state initially', () => {
    const gmp = createGmp();
    // Replace with a promise that never resolves to keep loading state
    gmp.reportoperatingsystems.get = testing
      .fn()
      .mockReturnValue(new Promise(() => {}));

    const {render} = rendererWith({gmp, router: true});
    render(<TestComponent filter={filter} reportId="1234" />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('should not fetch when reportId is empty', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<TestComponent filter={filter} reportId="" />);

    // Query is disabled when reportId is empty — no fetch is triggered
    expect(screen.getByTestId('no-data')).toBeInTheDocument();
    expect(gmp.reportoperatingsystems.get).not.toHaveBeenCalled();
  });
});
