/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import type Filter from 'gmp/models/filter';
import type ReportHost from 'gmp/models/report/host';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import useTranslation from 'web/hooks/useTranslation';
import AgentScanningHostsTab from 'web/pages/reports/details/host/AgentScanningHostsTab';
import ContainerScanningHostsTab from 'web/pages/reports/details/host/ContainerScanningHostsTab';
import HostsTab from 'web/pages/reports/details/host/HostsTab';
import WebApplicationHostsTab from 'web/pages/reports/details/host/WebApplicationHostsTab';
import {type UseGetEntitiesReturn} from 'web/queries/useGetEntities';

export interface HostsTabContentProps {
  audit?: boolean;
  reportId: string;
  isAgentScanning?: boolean;
  isContainerScanning: boolean;
  isWebApplicationScanning?: boolean;
  reportFilter: Filter;
  hostsData?: UseGetEntitiesReturn<ReportHost>;
  isHostsFetching?: boolean;
  isHostsError?: boolean;
}

const HostsTabContent = ({
  audit = false,
  reportId,
  isHostsError,
  isAgentScanning,
  isContainerScanning,
  isWebApplicationScanning,
  reportFilter,
  hostsData,
  isHostsFetching,
}: HostsTabContentProps) => {
  const [_] = useTranslation();
  const [{sortField, sortReverse}, setSorting] = useState({
    sortField: audit ? 'compliant' : 'severity',
    sortReverse: true,
  });

  const data = hostsData;
  const isFetching = isHostsFetching ?? false;
  const isLoading = !data && isFetching;
  const isError = isHostsError ?? false;

  const handleSortChange = (newSortField: string) => {
    setSorting(prev => ({
      sortField: newSortField,
      sortReverse: newSortField === prev.sortField ? !prev.sortReverse : false,
    }));
  };

  if (isLoading && !data) {
    return <Loading />;
  }

  if (isError) {
    return (
      <ErrorPanel
        message={_('Error while loading Hosts for Report {{reportId}}', {
          reportId,
        })}
      />
    );
  }

  const hosts = {
    counts: data?.entitiesCounts,
    entities: data?.entities ?? [],
  };

  if (isAgentScanning) {
    return (
      <AgentScanningHostsTab
        audit={audit}
        counts={hosts.counts}
        filter={reportFilter}
        hosts={hosts.entities}
        isUpdating={isFetching}
        sortField={sortField}
        sortReverse={sortReverse}
        onSortChange={handleSortChange}
      />
    );
  }

  if (isWebApplicationScanning) {
    return (
      <WebApplicationHostsTab
        audit={audit}
        counts={hosts.counts}
        filter={reportFilter}
        hosts={hosts.entities}
        isUpdating={isFetching}
        sortField={sortField}
        sortReverse={sortReverse}
        onSortChange={handleSortChange}
      />
    );
  }

  if (isContainerScanning) {
    return (
      <ContainerScanningHostsTab
        audit={audit}
        counts={hosts.counts}
        filter={reportFilter}
        hosts={hosts.entities}
        isUpdating={isFetching}
        sortField={sortField}
        sortReverse={sortReverse}
        onSortChange={handleSortChange}
      />
    );
  }

  return (
    <HostsTab
      audit={audit}
      counts={hosts.counts}
      filter={reportFilter}
      hosts={hosts.entities}
      isUpdating={isFetching}
      sortField={sortField}
      sortReverse={sortReverse}
      onSortChange={handleSortChange}
    />
  );
};

export default HostsTabContent;
