/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import type {TaskStatus} from 'gmp/models/task';
import EmptyReport from 'web/pages/reports/details/EmptyReport';
import EmptyResultsReport from 'web/pages/reports/details/EmptyResultsReport';
import ContainerScanningResultsTab from 'web/pages/reports/details/result/ContainerScanningResultsTab';
import ResultsTab from 'web/pages/reports/details/result/ResultsTab';

interface ResultsCounts {
  filtered?: number;
  full?: number;
}

interface ResultsTabContentProps {
  isContainerScanning: boolean;
  hasTarget: boolean;
  progress: number;
  reportFilter: Filter;
  reportId: string;
  reportResultsCounts?: ResultsCounts;
  status: TaskStatus;
  onFilterAddLogLevelClick?: () => void;
  onFilterDecreaseMinQoDClick: () => void;
  onFilterEditClick: () => void;
  onFilterRemoveClick: () => void;
  onFilterRemoveSeverityClick?: () => void;
  onTargetEditClick: () => void;
}

const ResultsTabContent = ({
  isContainerScanning,
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
    reportResultsCounts.full === 0
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
    (reportResultsCounts.full ?? 0) > 0
  ) {
    return (
      <EmptyResultsReport
        all={reportResultsCounts.full ?? 0}
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
        status={status}
      />
    );
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
