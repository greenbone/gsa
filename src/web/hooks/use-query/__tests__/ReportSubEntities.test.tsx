/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import {createSession} from 'gmp/testing';
import useAuditReportSubEntities from 'web/hooks/use-query/use-audit-report-sub-entities';
import useReportSubEntities from 'web/hooks/use-query/use-report-sub-entities';

const filter = QueryFilter.fromString('rows=10');

const createResponse = () => ({
  data: [{id: 'entity-1'}],
  meta: {
    filter,
    counts: new CollectionCounts({all: 1, filtered: 1, length: 1}),
  },
});

const createGmp = () => {
  const get = testing.fn().mockResolvedValue(createResponse());

  return {
    session: createSession({token: 'test-token'}),
    settings: {},
    reporthosts: {get},
    reportports: {get},
    reportapplications: {get},
    reportoperatingsystems: {get},
    reportcves: {get},
    reportclosedcves: {get},
    reporttlscertificates: {get},
    reporterrors: {get},
    auditreport: {
      getHosts: get,
    },
  };
};

const ReportEntitiesComponent = ({reportId}: {reportId: string}) => {
  const entities = useReportSubEntities({reportId, filter});

  return (
    <div>
      <div data-testid="hosts">{entities.hosts.data?.entities.length}</div>
      <div data-testid="ports">{entities.ports.data?.entities.length}</div>
      <div data-testid="applications">
        {entities.applications.data?.entities.length}
      </div>
      <div data-testid="operating-systems">
        {entities.operatingSystems.data?.entities.length}
      </div>
      <div data-testid="cves">{entities.cves.data?.entities.length}</div>
      <div data-testid="closed-cves">
        {entities.closedCves.data?.entities.length}
      </div>
      <div data-testid="tls-certificates">
        {entities.tlsCertificates.data?.entities.length}
      </div>
      <div data-testid="errors">{entities.errors.data?.entities.length}</div>
    </div>
  );
};

describe('report sub-entity query hooks', () => {
  test('should fetch all report sub-entities with the report ID and filter', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<ReportEntitiesComponent reportId="report-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('hosts')).toHaveTextContent('1');
      expect(screen.getByTestId('ports')).toHaveTextContent('1');
      expect(screen.getByTestId('applications')).toHaveTextContent('1');
      expect(screen.getByTestId('operating-systems')).toHaveTextContent('1');
      expect(screen.getByTestId('cves')).toHaveTextContent('1');
      expect(screen.getByTestId('closed-cves')).toHaveTextContent('1');
      expect(screen.getByTestId('tls-certificates')).toHaveTextContent('1');
      expect(screen.getByTestId('errors')).toHaveTextContent('1');
    });

    for (const command of [
      gmp.reporthosts.get,
      gmp.reportports.get,
      gmp.reportapplications.get,
      gmp.reportoperatingsystems.get,
      gmp.reportcves.get,
      gmp.reportclosedcves.get,
      gmp.reporttlscertificates.get,
      gmp.reporterrors.get,
    ]) {
      expect(command).toHaveBeenCalledWith({
        report_id: 'report-1',
        filter,
      });
    }
  });

  test('should not fetch report sub-entities when the report ID is empty', () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    render(<ReportEntitiesComponent reportId="" />);

    for (const command of [
      gmp.reporthosts.get,
      gmp.reportports.get,
      gmp.reportapplications.get,
      gmp.reportoperatingsystems.get,
      gmp.reportcves.get,
      gmp.reportclosedcves.get,
      gmp.reporttlscertificates.get,
      gmp.reporterrors.get,
    ]) {
      expect(command).not.toHaveBeenCalled();
    }
  });

  test('should expose audit report sub-entities through the audit-specific hook', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const entities = useAuditReportSubEntities({
        reportId: 'report-1',
        filter,
      });
      return (
        <div data-testid="audit-sub-entities">
          {Number(entities.hosts.data?.entities.length ?? 0) +
            Number(entities.operatingSystems.data?.entities.length ?? 0) +
            Number(entities.tlsCertificates.data?.entities.length ?? 0) +
            Number(entities.errors.data?.entities.length ?? 0)}
        </div>
      );
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('audit-sub-entities')).toHaveTextContent('4');
    });
  });
});
