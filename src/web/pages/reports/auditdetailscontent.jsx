/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TASK_STATUS} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import StatusBar from 'web/components/bar/statusbar';
import ToolBar from 'web/components/bar/toolbar';
import DateTime from 'web/components/date/datetime';
import ErrorPanel from 'web/components/error/errorpanel';
import ReportIcon from 'web/components/icon/reporticon';
import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';
import Loading from 'web/components/loading/loading';
import Powerfilter from 'web/components/powerfilter/powerfilter';
import SectionHeader from 'web/components/section/header';
import Section from 'web/components/section/section';
import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';
import EntityInfo from 'web/entity/info';
import EntityTags from 'web/entity/tags';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

import AuditThresholdPanel from './details/auditthresholdpanel';
import ErrorsTab from './details/errorstab';
import HostsTab from './details/hoststab';
import OperatingSystemsTab from './details/operatingsystemstab';
import ResultsTab from './details/resultstab';
import Summary from './details/summary';
import TabTitle from './details/tabtitle';
import TLSCertificatesTab from './details/tlscertificatestab';
import ToolBarIcons from './details/toolbaricons';

const Span = styled.span`
  margin-top: 2px;
`;

const PageContent = ({
  activeTab,
  entity,
  errorsCounts,
  filters,
  hostsCounts,
  isLoading = true,
  isLoadingFilters = true,
  isUpdating = false,
  operatingSystemsCounts,
  pageFilter,
  reportError,
  reportFilter,
  reportId,
  resetFilter,
  resultsCounts,
  sorting,
  showError,
  showErrorMessage,
  showSuccessMessage,
  task,
  tlsCertificatesCounts,
  onActivateTab,
  onAddToAssetsClick,
  onTlsCertificateDownloadClick,
  onError,
  onFilterChanged,
  onFilterCreated,
  onFilterDecreaseMinQoDClick,
  onFilterEditClick,
  onFilterRemoveClick,
  onFilterResetClick,
  onInteraction,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  onSortChange,
  onTagSuccess,
  onTargetEditClick,
}) => {
  const hasReport = isDefined(entity);

  const report = hasReport ? entity.report : undefined;

  const userTags = hasReport ? report.userTags : undefined;
  const userTagsCount = isDefined(userTags) ? userTags.length : 0;
  const gmp = useGmp();
  const [_] = useTranslation();

  const {
    errors = {},
    hosts = {},
    operatingSystems = {},
    results = {},
    tlsCertificates = {},
    timestamp,
    scan_run_status,
  } = report || {};

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
    !isLoading && hasReport && results.counts.filtered > threshold;

  const isContainer = isDefined(task) && task.isContainer();
  const status = isContainer ? TASK_STATUS.container : scan_run_status;
  const progress = isDefined(task) ? task.progress : 0;

  const showIsLoading = isLoading && !hasReport;

  const showInitialLoading =
    isLoading &&
    !isDefined(reportError) &&
    !showThresholdMessage &&
    (!isDefined(results.entities) || results.entities.length === 0);

  const header_title = (
    <Divider>
      <span>{_('Audit Report:')}</span>
      {showIsLoading ? (
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
    <SectionHeader img={<ReportIcon size="large" />} title={header_title}>
      {hasReport && <EntityInfo entity={entity} />}
    </SectionHeader>
  );

  return (
    <Layout grow align={['start', 'stretch']} flex="column">
      <ToolBar>
        <ToolBarIcons
          audit={true}
          delta={false}
          filter={reportFilter}
          isLoading={showIsLoading}
          report={hasReport ? report : undefined}
          reportId={reportId}
          showError={showError}
          showErrorMessage={showErrorMessage}
          showSuccessMessage={showSuccessMessage}
          showThresholdMessage={showThresholdMessage}
          task={task}
          threshold={threshold}
          onAddToAssetsClick={onAddToAssetsClick}
          onInteraction={onInteraction}
          onRemoveFromAssetsClick={onRemoveFromAssetsClick}
          onReportDownloadClick={onReportDownloadClick}
        />
        <Layout align="end">
          <Powerfilter
            createFilterType="result"
            // use loaded filter from report if available otherwise already show the requested filter
            filter={isDefined(reportFilter) ? reportFilter : pageFilter}
            filters={filters}
            isLoading={isLoading || isUpdating}
            isLoadingFilters={isLoadingFilters}
            resetFilter={resetFilter}
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
        {showIsLoading ? (
          <Loading />
        ) : (
          <React.Fragment>
            <TabLayout align={['start', 'end']} grow="1">
              <TabList
                active={activeTab}
                align={['start', 'stretch']}
                onActivateTab={onActivateTab}
              >
                <Tab>{_('Information')}</Tab>
                <Tab>
                  <TabTitle counts={resultsCounts} title={_('Results')} />
                </Tab>
                <Tab>
                  <TabTitle counts={hostsCounts} title={_('Hosts')} />
                </Tab>
                <Tab>
                  <TabTitle
                    counts={operatingSystemsCounts}
                    title={_('Operating Systems')}
                  />
                </Tab>
                <Tab>
                  <TabTitle
                    counts={tlsCertificatesCounts}
                    title={_('TLS Certificates')}
                  />
                </Tab>
                <Tab>
                  <TabTitle counts={errorsCounts} title={_('Error Messages')} />
                </Tab>
                <Tab>
                  <TabTitle count={userTagsCount} title={_('User Tags')} />
                </Tab>
              </TabList>
            </TabLayout>

            {hasReport ? (
              <Tabs active={activeTab}>
                <TabPanels>
                  <TabPanel>
                    <Summary
                      filter={reportFilter}
                      isUpdating={isUpdating}
                      report={report}
                      reportError={reportError}
                      reportId={reportId}
                      onError={onError}
                      onTagChanged={onTagSuccess}
                    />
                  </TabPanel>
                  <TabPanel>
                    <ResultsTab
                      audit={true}
                      hasTarget={!isContainer}
                      progress={progress}
                      reportFilter={reportFilter}
                      reportId={reportId}
                      reportResultsCounts={resultsCounts}
                      results={results.entities}
                      sortField={sorting.results.sortField}
                      sortReverse={sorting.results.sortReverse}
                      status={status}
                      onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
                      onFilterEditClick={onFilterEditClick}
                      onFilterRemoveClick={onFilterRemoveClick}
                      onInteraction={onInteraction}
                      onSortChange={sortField =>
                        onSortChange('results', sortField)
                      }
                      onTargetEditClick={onTargetEditClick}
                    />
                  </TabPanel>
                  <TabPanel>
                    {showInitialLoading ? (
                      <Loading />
                    ) : showThresholdMessage ? (
                      <AuditThresholdPanel
                        entityType={_('Hosts')}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        threshold={threshold}
                        onFilterChanged={onFilterChanged}
                        onFilterEditClick={onFilterEditClick}
                      />
                    ) : (
                      <HostsTab
                        audit={true}
                        counts={hosts.counts}
                        filter={reportFilter}
                        hosts={hosts.entities}
                        isUpdating={isUpdating}
                        sortField={sorting.hosts.sortField}
                        sortReverse={sorting.hosts.sortReverse}
                        onInteraction={onInteraction}
                        onSortChange={sortField =>
                          onSortChange('hosts', sortField)
                        }
                      />
                    )}
                  </TabPanel>
                  <TabPanel>
                    {showInitialLoading ? (
                      <Loading />
                    ) : showThresholdMessage ? (
                      <AuditThresholdPanel
                        entityType={_('Operating Systems')}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        threshold={threshold}
                        onFilterChanged={onFilterChanged}
                        onFilterEditClick={onFilterEditClick}
                      />
                    ) : (
                      <OperatingSystemsTab
                        audit={true}
                        counts={operatingSystems.counts}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        operatingsystems={operatingSystems.entities}
                        sortField={sorting.os.sortField}
                        sortReverse={sorting.os.sortReverse}
                        onInteraction={onInteraction}
                        onSortChange={sortField =>
                          onSortChange('os', sortField)
                        }
                      />
                    )}
                  </TabPanel>
                  <TabPanel>
                    {showInitialLoading ? (
                      <Loading />
                    ) : showThresholdMessage ? (
                      <AuditThresholdPanel
                        entityType={_('TLS Certificates')}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        threshold={threshold}
                        onFilterChanged={onFilterChanged}
                        onFilterEditClick={onFilterEditClick}
                      />
                    ) : (
                      <TLSCertificatesTab
                        counts={tlsCertificates.counts}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        sortField={sorting.tlscerts.sortField}
                        sortReverse={sorting.tlscerts.sortReverse}
                        tlsCertificates={tlsCertificates.entities}
                        onInteraction={onInteraction}
                        onSortChange={sortField =>
                          onSortChange('tlscerts', sortField)
                        }
                        onTlsCertificateDownloadClick={
                          onTlsCertificateDownloadClick
                        }
                      />
                    )}
                  </TabPanel>
                  <TabPanel>
                    <ErrorsTab
                      counts={errors.counts}
                      errors={errors.entities}
                      filter={reportFilter}
                      isUpdating={isUpdating}
                      sortField={sorting.errors.sortField}
                      sortReverse={sorting.errors.sortReverse}
                      onInteraction={onInteraction}
                      onSortChange={sortField =>
                        onSortChange('errors', sortField)
                      }
                    />
                  </TabPanel>
                  <TabPanel>
                    <EntityTags
                      entity={report}
                      onChanged={onTagSuccess}
                      onError={onError}
                      onInteraction={onInteraction}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            ) : (
              <Loading />
            )}
          </React.Fragment>
        )}
      </Section>
    </Layout>
  );
};

PageContent.propTypes = {
  activeTab: PropTypes.number,
  applicationsCounts: PropTypes.counts,
  closedCvesCounts: PropTypes.counts,
  cvesCounts: PropTypes.counts,
  entity: PropTypes.model,
  errorsCounts: PropTypes.counts,
  filters: PropTypes.array,
  hostsCounts: PropTypes.counts,
  isLoading: PropTypes.bool,
  isLoadingFilters: PropTypes.bool,
  isUpdating: PropTypes.bool,
  operatingSystemsCounts: PropTypes.counts,
  pageFilter: PropTypes.filter,
  portsCounts: PropTypes.counts,
  reportError: PropTypes.error,
  reportFilter: PropTypes.filter,
  reportId: PropTypes.id.isRequired,
  resetFilter: PropTypes.filter,
  resultsCounts: PropTypes.counts,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  sorting: PropTypes.object,
  task: PropTypes.model,
  tlsCertificatesCounts: PropTypes.counts,
  onActivateTab: PropTypes.func.isRequired,
  onAddToAssetsClick: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onFilterCreated: PropTypes.func.isRequired,
  onFilterDecreaseMinQoDClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
  onFilterRemoveClick: PropTypes.func.isRequired,
  onFilterResetClick: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onRemoveFromAssetsClick: PropTypes.func.isRequired,
  onReportDownloadClick: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onTagSuccess: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
  onTlsCertificateDownloadClick: PropTypes.func.isRequired,
};

export default PageContent;
