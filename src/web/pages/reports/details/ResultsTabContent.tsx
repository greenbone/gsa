/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CollectionCounts from 'gmp/collection/collection-counts';
import type Filter from 'gmp/models/filter';
import type Result from 'gmp/models/result';
import type {TaskStatus} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import Loading from 'web/components/loading/Loading';
import ContainerScanningResultsTab from 'web/pages/reports/details/ContainerScanningResultsTab';
import EmptyReport from 'web/pages/reports/details/EmptyReport';
import EmptyResultsReport from 'web/pages/reports/details/EmptyResultsReport';
import ResultsTab from 'web/pages/reports/details/ResultsTab';

interface ResultsData {
  counts?: CollectionCounts;
  entities?: Result[];
}

interface ResultsTabContentProps {
  results: ResultsData;
  isContainerScanning: boolean;
  isLoading?: boolean;
  hasTarget: boolean;
  progress: number;
  reportFilter: Filter;
  reportId: string;
  reportResultsCounts?: CollectionCounts;
  status: TaskStatus;
  onFilterAddLogLevelClick?: () => void;
  onFilterDecreaseMinQoDClick: () => void;
  onFilterEditClick: () => void;
  onFilterRemoveClick: () => void;
  onFilterRemoveSeverityClick?: () => void;
  onTargetEditClick: () => void;
}

const ResultsTabContent = ({
  results,
  isContainerScanning,
  isLoading = false,
  hasTarget,
  progress,
  reportFilter,
  reportId,
  reportResultsCounts,
  status,
  onFilterAddLogLevelClick,
  onFilterDecreaseMinQoDClick,
  onFilterEditClick,
  onFilterRemoveClick,
  onFilterRemoveSeverityClick,
  onTargetEditClick,
}: ResultsTabContentProps) => {
  // Container scanning: show empty report when no results at all
  if (
    isContainerScanning &&
    reportResultsCounts?.filtered === 0 &&
    reportResultsCounts.all === 0
  ) {
    return (
      <EmptyReport
        hasTarget={hasTarget}
        progress={progress}
        status={status}
        onTargetEditClick={onTargetEditClick}
      />
    );
  }

  // Container scanning: show empty results report when filtered out
  if (
    isContainerScanning &&
    reportResultsCounts?.filtered === 0 &&
    reportResultsCounts.all > 0
  ) {
    return (
      <EmptyResultsReport
        all={reportResultsCounts.all}
        filter={reportFilter}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
      />
    );
  }

  // Container scanning: show results table
  if (isContainerScanning) {
    return (
      <ContainerScanningResultsTab
        reportFilter={reportFilter}
        reportId={reportId}
      />
    );
  }

  // Loading state for regular scanning
  if (
    isLoading &&
    (!isDefined(results.entities) || results.entities.length === 0)
  ) {
    return <Loading />;
  }

  // Default: regular scanning results table
  return (
    <ResultsTab
      hasTarget={hasTarget}
      progress={progress}
      reportFilter={reportFilter}
      reportId={reportId}
      reportResultsCounts={reportResultsCounts}
      status={status}
      onFilterAddLogLevelClick={onFilterAddLogLevelClick}
      onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
      onFilterEditClick={onFilterEditClick}
      onFilterRemoveClick={onFilterRemoveClick}
      onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
      onTargetEditClick={onTargetEditClick}
    />
  );
};

export default ResultsTabContent;
