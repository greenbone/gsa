/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import type ReportHost from 'gmp/models/report/host';
import Loading from 'web/components/loading/Loading';
import useTranslation from 'web/hooks/useTranslation';
import AgentScanningHostsTab from 'web/pages/reports/details/AgentScanningHostsTab';
import ContainerScanningHostsTab from 'web/pages/reports/details/ContainerScanningHostsTab';
import HostsTab from 'web/pages/reports/details/HostsTab';
import ThresholdPanel from 'web/pages/reports/details/ThresholdPanel';

interface HostsData {
  counts?: CollectionCounts;
  entities?: ReportHost[];
}

interface SortingData {
  hosts: {
    sortField: string;
    sortReverse: boolean;
  };
}

interface HostsTabContentProps {
  audit?: boolean;
  hosts: HostsData;
  isAgentScanning?: boolean;
  isContainerScanning: boolean;
  reportFilter: Filter;
  isUpdating: boolean;
  showInitialLoading: boolean;
  showThresholdMessage: boolean;
  sorting: SortingData;
  threshold: number;
  onFilterChanged: (filter: Filter) => void;
  onFilterEditClick: () => void;
  onSortChange: (type: string, sortField: string) => void;
}

const HostsTabContent = ({
  audit = false,
  hosts,
  isAgentScanning,
  isContainerScanning,
  reportFilter,
  isUpdating,
  showInitialLoading,
  showThresholdMessage,
  sorting,
  threshold,
  onFilterChanged,
  onFilterEditClick,
  onSortChange,
}: HostsTabContentProps) => {
  const [_] = useTranslation();

  if (showInitialLoading) {
    return <Loading />;
  }

  if (showThresholdMessage) {
    return (
      <ThresholdPanel
        entityType={_('Hosts')}
        filter={reportFilter}
        isUpdating={isUpdating}
        threshold={threshold}
        onFilterChanged={onFilterChanged}
        onFilterEditClick={onFilterEditClick}
      />
    );
  }

  if (isAgentScanning) {
    return (
      <AgentScanningHostsTab
        audit={audit}
        counts={hosts.counts}
        filter={reportFilter}
        hosts={hosts.entities}
        isUpdating={isUpdating}
        sortField={sorting.hosts.sortField}
        sortReverse={sorting.hosts.sortReverse}
        onSortChange={(sortField: string) => onSortChange('hosts', sortField)}
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
        isUpdating={isUpdating}
        sortField={sorting.hosts.sortField}
        sortReverse={sorting.hosts.sortReverse}
        onSortChange={(sortField: string) => onSortChange('hosts', sortField)}
      />
    );
  }

  return (
    <HostsTab
      audit={audit}
      counts={hosts.counts}
      filter={reportFilter}
      hosts={hosts.entities}
      isUpdating={isUpdating}
      sortField={sorting.hosts.sortField}
      sortReverse={sorting.hosts.sortReverse}
      onSortChange={(sortField: string) => onSortChange('hosts', sortField)}
    />
  );
};

export default HostsTabContent;
