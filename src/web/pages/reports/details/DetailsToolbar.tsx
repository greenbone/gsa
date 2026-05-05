/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import type ReportReport from 'gmp/models/report/report';
import type ReportTask from 'gmp/models/report/task';
import ToolBar from 'web/components/bar/Toolbar';
import Layout from 'web/components/layout/Layout';
import Powerfilter from 'web/components/powerfilter/PowerFilter';
import ToolBarIcons from 'web/pages/reports/details/ToolbarIcons';

export interface DetailsToolbarProps {
  delta?: boolean;
  filters?: Filter[];
  isLoading?: boolean;
  isLoadingFilters?: boolean;
  isUpdating?: boolean;
  pageFilter?: Filter;
  report?: ReportReport;
  reportFilter?: Filter;
  reportId: string;
  resetFilter?: Filter;
  showError: (...args: unknown[]) => void;
  showErrorMessage: (message: string) => void;
  showSuccessMessage: (message: string) => void;
  showThresholdMessage?: boolean;
  task?: ReportTask;
  threshold?: number;
  onAddToAssetsClick: () => void;
  onFilterChanged: (filter: Filter) => void;
  onFilterEditClick: () => void;
  onFilterRemoveClick: () => void;
  onFilterResetClick: () => void;
  onRemoveFromAssetsClick: () => void;
  onReportDownloadClick: () => void;
}

const DetailsToolbar = ({
  delta = false,
  filters,
  isLoading,
  isLoadingFilters,
  isUpdating,
  pageFilter,
  report,
  reportFilter,
  reportId,
  resetFilter,
  showError,
  showErrorMessage,
  showSuccessMessage,
  showThresholdMessage,
  task,
  threshold,
  onAddToAssetsClick,
  onFilterChanged,
  onFilterEditClick,
  onFilterRemoveClick,
  onFilterResetClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
}: DetailsToolbarProps) => {
  return (
    <ToolBar>
      <ToolBarIcons
        delta={delta}
        filter={reportFilter}
        isLoading={isLoading}
        report={report}
        reportId={reportId}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
        showThresholdMessage={showThresholdMessage}
        task={task}
        threshold={threshold}
        onAddToAssetsClick={onAddToAssetsClick}
        onRemoveFromAssetsClick={onRemoveFromAssetsClick}
        onReportDownloadClick={onReportDownloadClick}
      />
      <Layout align="end">
        <Powerfilter
          createFilterType="result"
          filter={reportFilter ?? pageFilter}
          filters={filters}
          isLoading={isLoading || isUpdating}
          isLoadingFilters={isLoadingFilters}
          resetFilter={resetFilter}
          onEditClick={onFilterEditClick}
          onRemoveClick={onFilterRemoveClick}
          onResetClick={onFilterResetClick}
          onUpdate={onFilterChanged}
        />
      </Layout>
    </ToolBar>
  );
};

export default DetailsToolbar;
