/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import type Filter from 'gmp/models/filter';
import type Report from 'gmp/models/report';
import type ReportTask from 'gmp/models/report/task';
import type ReportTLSCertificate from 'gmp/models/report/tls-certificate';
import {isActive, TASK_STATUS} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import StatusBar from 'web/components/bar/StatusBar';
import DateTime from 'web/components/date/DateTime';
import ErrorPanel from 'web/components/error/ErrorPanel';
import {ReportIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import Layout from 'web/components/layout/Layout';
import Loading from 'web/components/loading/Loading';
import {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
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
import useReportSubEntities from 'web/hooks/use-query/use-report-sub-entities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import DetailsToolbar from 'web/pages/reports/details/DetailsToolbar';
import {buildReportTabDefinitions} from 'web/pages/reports/details/ReportTabDefinitions';

interface ThresholdConfig {
  showInitialLoading: boolean;
  showThresholdMessage: boolean;
  isUpdating: boolean;
  threshold: number;
  onFilterChanged: (filter: Filter) => void;
  onFilterEditClick: () => void;
}

interface PageContentProps {
  entity?: Report;
  filters?: Filter[];
  isLoading?: boolean;
  isLoadingFilters?: boolean;
  isUpdating?: boolean;
  pageFilter?: Filter;
  reportError?: Error;
  reportFilter?: Filter;
  reportId: string;
  resetFilter?: Filter;
  resultsCounts?: {filtered?: number; full?: number};
  showError: (...args: unknown[]) => void;
  showErrorMessage: (message: string) => void;
  showSuccessMessage: (message: string) => void;
  task?: ReportTask;
  onAddToAssetsClick: () => void;
  onError: (error: Error) => void;
  onFilterAddLogLevelClick: () => void;
  onFilterChanged: (filter: Filter) => void;
  onFilterDecreaseMinQoDClick: () => void;
  onFilterEditClick: () => void;
  onFilterRemoveClick: () => void;
  onFilterRemoveSeverityClick: () => void;
  onFilterResetClick: () => void;
  onRemoveFromAssetsClick: () => void;
  onReportDownloadClick: () => void;
  onTagSuccess: () => void;
  onTargetEditClick: () => void;
  onTlsCertificateDownloadClick: (entity: ReportTLSCertificate) => void;
}

const Span = styled.span`
  margin-top: 2px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  white-space: normal;
  word-break: normal;
  word-wrap: break-word;
`;

const PageContent = ({
  entity,
  filters,
  isLoading = true,
  isLoadingFilters = true,
  isUpdating = false,
  pageFilter,
  reportError,
  reportFilter,
  reportId,
  resetFilter,
  resultsCounts,
  showError,
  showErrorMessage,
  showSuccessMessage,
  task,
  onAddToAssetsClick,
  onTlsCertificateDownloadClick,
  onError,
  onFilterAddLogLevelClick,
  onFilterChanged,
  onFilterDecreaseMinQoDClick,
  onFilterEditClick,
  onFilterRemoveSeverityClick,
  onFilterRemoveClick,
  onFilterResetClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  onTagSuccess,
  onTargetEditClick,
}: PageContentProps) => {
  const gmp = useGmp();
  const [_] = useTranslation();

  const hasReport = isDefined(entity);
  const report = entity?.report;

  const isContainerScanning =
    hasReport && isDefined(entity.report?.task?.ociImageTarget?.id);
  const isAgentScanning =
    hasReport && isDefined(entity.report?.task?.agentGroup?.id);

  const {timestamp, scan_run_status} = report ?? {};

  const isImport = isDefined(task) && task.isImport();
  const status = isImport
    ? TASK_STATUS.import
    : (scan_run_status ?? TASK_STATUS.unknown);
  const refetchInterval = isActive(status)
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : NO_RELOAD;

  const reportEntities = useReportSubEntities({
    reportId,
    filter: reportFilter,
    refetchInterval,
  });

  if (!hasReport && isDefined(reportError)) {
    return (
      <ErrorPanel
        error={reportError}
        message={_('Error while loading Report {{reportId}}', {reportId})}
      />
    );
  }

  const threshold = gmp.settings.reportResultsThreshold;

  const showThresholdMessage =
    !isLoading && hasReport && (resultsCounts?.filtered ?? 0) > threshold;

  const progress = task?.progress ?? 0;

  const showIsLoading = isLoading && !hasReport;

  const showInitialLoading =
    isLoading && !isDefined(reportError) && !showThresholdMessage;

  const HeaderTitle = (
    <Divider>
      <span style={{whiteSpace: 'nowrap'}}>{_('Report:')}</span>
      {showIsLoading ? (
        <span>{_('Loading')}</span>
      ) : (
        <HeaderContainer>
          <DateTime showTimezoneAsSeparateLine date={timestamp} />
          <Span>
            <StatusBar progress={progress} status={status} />
          </Span>
        </HeaderContainer>
      )}
    </Divider>
  );

  const header = (
    <SectionHeader
      alignHeading={['start', 'baseline']}
      img={<ReportIcon size="large" />}
      title={HeaderTitle}
    >
      {hasReport && <EntityInfo entity={entity} />}
    </SectionHeader>
  );

  const thresholdConfig: ThresholdConfig = {
    showInitialLoading,
    showThresholdMessage,
    isUpdating,
    threshold,
    onFilterChanged,
    onFilterEditClick,
  };

  const tabDefinitions =
    isDefined(report) && isDefined(reportFilter)
      ? buildReportTabDefinitions({
          activeReport: report,
          activeFilter: reportFilter,
          reportId,
          isImport,
          isAgentScanning,
          isContainerScanning,
          isUpdating,
          progress,
          status,
          resultsCounts,
          thresholdConfig,
          reportEntities,
          onFilterAddLogLevelClick,
          onFilterDecreaseMinQoDClick,
          onFilterEditClick,
          onFilterRemoveClick,
          onFilterRemoveSeverityClick,
          onTargetEditClick,
          onTlsCertificateDownloadClick,
          onTagSuccess,
          onError,
        })
      : [];

  return (
    <Layout grow align={['start', 'stretch']} flex="column">
      <DetailsToolbar
        delta={false}
        filters={filters}
        isLoading={showIsLoading}
        isLoadingFilters={isLoadingFilters}
        isUpdating={isUpdating}
        pageFilter={pageFilter}
        report={report}
        reportFilter={reportFilter}
        reportId={reportId}
        resetFilter={resetFilter}
        showError={showError}
        showErrorMessage={showErrorMessage}
        showSuccessMessage={showSuccessMessage}
        showThresholdMessage={showThresholdMessage}
        task={task}
        threshold={threshold}
        onAddToAssetsClick={onAddToAssetsClick}
        onFilterChanged={onFilterChanged}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterResetClick={onFilterResetClick}
        onRemoveFromAssetsClick={onRemoveFromAssetsClick}
        onReportDownloadClick={onReportDownloadClick}
      />

      <Section header={header}>
        {showIsLoading ? (
          <Loading />
        ) : (
          <TabsContainer flex="column" grow="1">
            <TabLayout align={['start', 'end']} grow="1">
              <TabList align={['start', 'stretch']}>
                {tabDefinitions.map(tab => (
                  <Tab key={tab.key}>{tab.renderTab()}</Tab>
                ))}
              </TabList>
            </TabLayout>

            {tabDefinitions.length > 0 ? (
              <Tabs>
                <TabPanels>
                  {tabDefinitions.map(tab => (
                    <TabPanel key={tab.key}>{tab.renderPanel()}</TabPanel>
                  ))}
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

export default PageContent;
