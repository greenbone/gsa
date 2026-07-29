/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import {
  useGetAuditReport,
  useGetAuditReportHosts,
} from 'web/hooks/use-query/audit-report';

const filter = QueryFilter.fromString('rows=10 first=1 sort=compliant');

const HostsComponent = ({reportId}: {reportId: string}) => {
  const {data, isLoading, isError} = useGetAuditReportHosts({
    reportId,
    filter,
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
      {data.entities.map(host => (
        <div key={host.id} data-testid="host-entity">
          {host.ip}
        </div>
      ))}
    </div>
  );
};

const AuditReportComponent = ({reportId}: {reportId: string}) => {
  const {data, isLoading} = useGetAuditReport({id: reportId, filter});

  if (isLoading) {
    return <div data-testid="loading-report">Loading...</div>;
  }

  if (!data) {
    return <div data-testid="no-report">No report</div>;
  }

  return <div data-testid="report-id">{data.id}</div>;
};

const createGmp = () => ({
  session: createSession({token: 'test-token'}),
  settings: {
    severityRating: SEVERITY_RATING_CVSS_3,
    reloadInterval: 0,
    reloadIntervalActive: 0,
    reloadIntervalInactive: 0,
  },
  auditreport: {
    get: testing.fn().mockResolvedValue({
      data: {id: 'report-1234'},
    }),
    getHosts: testing.fn().mockResolvedValue({
      data: [
        {
          id: '123.456.78.910',
          ip: '123.456.78.910',
          hostname: 'foo.bar',
        },
      ],
      meta: {
        filter,
        counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
      },
    }),
  },
});

describe('audit-report query hooks', () => {
  test('should fetch audit report hosts from auditreport command', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<HostsComponent reportId="1234" />);

    await waitFor(() => {
      expect(screen.getAllByTestId('host-entity')).toHaveLength(1);
    });

    expect(gmp.auditreport.getHosts).toHaveBeenCalledWith(
      expect.objectContaining({report_id: '1234'}),
    );
  });

  test('should fetch audit report entity', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<AuditReportComponent reportId="report-1234" />);

    await waitFor(() => {
      expect(screen.getByTestId('report-id')).toHaveTextContent('report-1234');
    });

    expect(gmp.auditreport.get).toHaveBeenCalledWith(
      {id: 'report-1234'},
      expect.objectContaining({details: false}),
    );
  });

  test('should not fetch hosts when reportId is empty', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<HostsComponent reportId="" />);

    expect(screen.getByTestId('no-data')).toBeInTheDocument();
    expect(gmp.auditreport.getHosts).not.toHaveBeenCalled();
  });
});
