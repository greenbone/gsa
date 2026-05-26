/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import type Filter from 'gmp/models/filter';
import {isActive, type TaskStatus} from 'gmp/models/task';
import ErrorPanel from 'web/components/error/ErrorPanel';
import Loading from 'web/components/loading/Loading';
import {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import useGetReportHosts from 'web/hooks/use-query/report-hosts';
import useTranslation from 'web/hooks/useTranslation';
import AgentScanningHostsTab from 'web/pages/reports/details/AgentScanningHostsTab';
import ContainerScanningHostsTab from 'web/pages/reports/details/ContainerScanningHostsTab';
import HostsTab from 'web/pages/reports/details/HostsTab';

export interface HostsTabContentProps {
  audit?: boolean;
  reportId: string;
  status: TaskStatus;
  isAgentScanning?: boolean;
  isContainerScanning: boolean;
  reportFilter: Filter;
}

const HostsTabContent = ({
  audit = false,
  reportId,
  status,
  isAgentScanning,
  isContainerScanning,
  reportFilter,
}: HostsTabContentProps) => {
  const [_] = useTranslation();
  const [{sortField, sortReverse}, setSorting] = useState({
    sortField: 'severity',
    sortReverse: true,
  });

  const {data, isLoading, isFetching, isError, error} = useGetReportHosts({
    reportId,
    filter: reportFilter,
    refetchInterval: isActive(status)
      ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
      : NO_RELOAD,
  });

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
        error={error}
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
