/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import CollectionCounts from 'gmp/collection/collection-counts';
import type AuditReport from 'gmp/models/audit-report';
import {type default as Filter, type FilterType} from 'gmp/models/filter';
import type Report from 'gmp/models/report';
import {
  type default as AuditReportReport,
  type AuditReportComplianceCounts,
} from 'gmp/models/report/audit-report';
import type ReportReport from 'gmp/models/report/report';
import type ReportTask from 'gmp/models/report/task';
import {TASK_STATUS} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import StatusBar from 'web/components/bar/StatusBar';
import ToolBar from 'web/components/bar/Toolbar';
import DateTime from 'web/components/date/DateTime';
import ErrorMessage from 'web/components/error/ErrorMessage';
import {ReportIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import Powerfilter from 'web/components/powerfilter/PowerFilter';
import SectionHeader from 'web/components/section/Header';
import Section from 'web/components/section/Section';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import EntityInfo from 'web/entity/EntityInfo';
import EntityTags from 'web/entity/Tags';
import useTranslation from 'web/hooks/useTranslation';
import DeltaResultsTab from 'web/pages/reports/details/DeltaResultsTab';
import ReportDetailsToolBarIcons from 'web/pages/reports/details/ReportDetailsPageToolBarIcons';
import Summary from 'web/pages/reports/details/Summary';
import TabTitle from 'web/pages/reports/details/TabTitle';

interface DeltaReportDetailsContentProps {
  audit?: boolean;
  entity?: Report | AuditReport;
  entityError?: Error;
  filter?: FilterType;
  filters?: Filter[];
  isLoading?: boolean;
  isUpdating?: boolean;
  reportId: string;
  sortField: string;
  sortReverse: boolean;
  showError: (error: Error) => void;
  showErrorMessage: (message: string) => void;
  showSuccessMessage: (message: string) => void;
  task?: ReportTask;
  onAddToAssetsClick?: () => void;
  onError?: (error: Error) => void;
  onFilterAddLogLevelClick?: () => void;
  onFilterChanged?: (filter: FilterType) => void;
  onFilterCreated?: (filter: Filter) => void;
  onFilterDecreaseMinQoDClick?: () => void;
  onFilterEditClick?: () => void;
  onFilterRemoveClick?: () => void;
  onFilterRemoveSeverityClick?: () => void;
  onFilterResetClick?: () => void;
  onRemoveFromAssetsClick?: () => void;
  onReportDownloadClick?: () => void;
  onSortChange?: (tabName: string, sortField: string) => void;
  onTagSuccess?: () => void;
  onTargetEditClick?: () => void;
}

const Span = styled.span`
  margin-top: 2px;
`;

const DeltaReportDetailsContent = ({
  audit = false,
  entity,
  entityError,
  filter,
  filters,
  isLoading = true,
  isUpdating = false,
  reportId,
  sortField,
  sortReverse,
  showError,
  showErrorMessage,
  showSuccessMessage,
  task,
  onAddToAssetsClick,
  onError,
  onFilterAddLogLevelClick,
  onFilterChanged,
  onFilterCreated,
  onFilterDecreaseMinQoDClick,
  onFilterEditClick,
  onFilterRemoveSeverityClick,
  onFilterRemoveClick,
  onFilterResetClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  onSortChange,
  onTagSuccess,
  onTargetEditClick,
}: DeltaReportDetailsContentProps) => {
  const [_] = useTranslation();
  const {report} = entity ?? {};

  const {userTags, timestamp, scan_run_status} = report ?? {};
  const userTagsCount = userTags?.length;

  const complianceCounts: AuditReportComplianceCounts | undefined = (
    report as AuditReportReport
  )?.complianceCounts;

  const hasReport = isDefined(entity);

  if (!hasReport && isDefined(entityError)) {
    return <ErrorMessage message={entityError.message} />;
  }

  const results = (report as ReportReport)?.results;
  const isImport = isDefined(task) && task.isImport();
  const status = isImport ? TASK_STATUS.import : scan_run_status;
  const progress = isDefined(task) ? task.progress : 0;

  const headerTitle = (
    <Divider>
      {audit ? <span>{_('Audit Report:')}</span> : <span>{_('Report:')}</span>}
      {isLoading ? (
        <span>{_('Loading')}</span>
      ) : (
        <Divider>
          <DateTime date={timestamp} />
          <Span>
            <StatusBar progress={progress} status={status} />
          </Span>
        </Divider>
      )}
    </Divider>
  );

  const header = (
    <SectionHeader img={<ReportIcon size="large" />} title={headerTitle}>
      {hasReport && <EntityInfo entity={entity} />}
    </SectionHeader>
  );

  const resultsCounts = results?.counts ?? new CollectionCounts();
  const filtered = audit ? complianceCounts?.filtered : resultsCounts?.filtered;

  return (
    <Layout grow align={['start', 'stretch']} flex="column">
      <ToolBar>
        <ReportDetailsToolBarIcons
          audit={audit}
          delta={true}
          filter={filter}
          isLoading={isLoading}
          report={report}
          reportId={reportId}
          showError={showError}
          showErrorMessage={showErrorMessage}
          showSuccessMessage={showSuccessMessage}
          task={task}
          onAddToAssetsClick={onAddToAssetsClick}
          onRemoveFromAssetsClick={onRemoveFromAssetsClick}
          onReportDownloadClick={onReportDownloadClick}
        />
        <Layout align="end">
          <Powerfilter
            createFilterType="result"
            filter={filter}
            filters={filters}
            onEditClick={onFilterEditClick}
            onError={onError}
            onFilterCreated={onFilterCreated}
            onRemoveClick={onFilterRemoveClick}
            onResetClick={onFilterResetClick}
            onUpdate={onFilterChanged}
          />
        </Layout>
      </ToolBar>

      <Section header={header}>
        {isLoading ? (
          <Loading />
        ) : (
          <TabsContainer flex="column" grow="1">
            <TabLayout align={['start', 'end']} grow="1">
              <TabList align={['start', 'stretch']}>
                <Tab>{_('Information')}</Tab>
                <Tab>
                  <TabTitle count={filtered} title={_('Results')} />
                </Tab>
                <Tab>
                  <TabTitle count={userTagsCount} title={_('User Tags')} />
                </Tab>
              </TabList>
            </TabLayout>
            {isDefined(report) ? (
              <Tabs>
                <TabPanels>
                  <TabPanel>
                    <Summary
                      audit={audit}
                      filter={filter}
                      report={report}
                      reportId={reportId}
                    />
                  </TabPanel>
                  <TabPanel>
                    <DeltaResultsTab
                      audit={audit}
                      counts={resultsCounts ?? new CollectionCounts()}
                      delta={true}
                      filter={filter}
                      hasTarget={!isImport}
                      isUpdating={isUpdating}
                      progress={progress ?? 0}
                      results={results?.entities ?? []}
                      sortField={sortField}
                      sortReverse={sortReverse}
                      status={status ?? TASK_STATUS.unknown}
                      onFilterAddLogLevelClick={onFilterAddLogLevelClick}
                      onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
                      onFilterEditClick={onFilterEditClick}
                      onFilterRemoveClick={onFilterRemoveClick}
                      onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
                      onSortChange={sortField =>
                        onSortChange?.('results', sortField)
                      }
                      onTargetEditClick={onTargetEditClick}
                    />
                  </TabPanel>
                  <TabPanel>
                    <EntityTags
                      entity={report}
                      onChanged={onTagSuccess}
                      onError={onError}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            ) : (
              <Loading />
            )}
          </TabsContainer>
        )}
      </Section>
    </Layout>
  );
};

export default DeltaReportDetailsContent;
