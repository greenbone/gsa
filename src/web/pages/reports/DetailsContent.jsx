/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {TASK_STATUS} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import StatusBar from 'web/components/bar/StatusBar';
import ToolBar from 'web/components/bar/Toolbar';
import DateTime from 'web/components/date/DateTime';
import ErrorPanel from 'web/components/error/ErrorPanel';
import ReportIcon from 'web/components/icon/ReportIcon';
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
import EntityInfo from 'web/entity/Info';
import EntityTags from 'web/entity/Tags';
import PropTypes from 'web/utils/PropTypes';
import withGmp from 'web/utils/withGmp';

import ApplicationsTab from './details/ApplicationsTab';
import ClosedCvesTab from './details/ClosedCvesTab';
import CvesTab from './details/CvesTab';
import ErrorsTab from './details/ErrorsTab';
import HostsTab from './details/HostsTab';
import OperatingSystemsTab from './details/OperatingSystemsTab';
import PortsTab from './details/PortsTab';
import ResultsTab from './details/ResultsTab';
import Summary from './details/Summary';
import TabTitle from './details/TabTitle';
import ThresholdPanel from './details/ThresholdPanel';
import TLSCertificatesTab from './details/TlsCertificatesTab';
import ToolBarIcons from './details/ToolbarIcons';

const Span = styled.span`
  margin-top: 2px;
`;

const PageContent = ({
  activeTab,
  applicationsCounts,
  closedCvesCounts,
  cvesCounts,
  entity,
  errorsCounts,
  filters,
  gmp,
  hostsCounts,
  isLoading = true,
  isLoadingFilters = true,
  isUpdating = false,
  operatingSystemsCounts,
  pageFilter,
  portsCounts,
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
  onFilterAddLogLevelClick,
  onFilterChanged,
  onFilterCreated,
  onFilterDecreaseMinQoDClick,
  onFilterEditClick,
  onFilterRemoveSeverityClick,
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

  const {
    applications = {},
    closedCves = {},
    cves = {},
    errors = {},
    hosts = {},
    operatingsystems = {},
    ports = {},
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
      <span>{_('Report:')}</span>
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
                  <TabTitle counts={portsCounts} title={_('Ports')} />
                </Tab>
                <Tab>
                  <TabTitle
                    counts={applicationsCounts}
                    title={_('Applications')}
                  />
                </Tab>
                <Tab>
                  <TabTitle
                    counts={operatingSystemsCounts}
                    title={_('Operating Systems')}
                  />
                </Tab>
                <Tab>
                  <TabTitle counts={cvesCounts} title={_('CVEs')} />
                </Tab>
                <Tab>
                  <TabTitle
                    counts={closedCvesCounts}
                    title={_('Closed CVEs')}
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
                      hasTarget={!isContainer}
                      progress={progress}
                      reportFilter={reportFilter}
                      reportId={reportId}
                      reportResultsCounts={resultsCounts}
                      results={results.entities}
                      sortField={sorting.results.sortField}
                      sortReverse={sorting.results.sortReverse}
                      status={status}
                      onFilterAddLogLevelClick={onFilterAddLogLevelClick}
                      onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
                      onFilterEditClick={onFilterEditClick}
                      onFilterRemoveClick={onFilterRemoveClick}
                      onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
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
                      <ThresholdPanel
                        entityType={_('Hosts')}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        threshold={threshold}
                        onFilterChanged={onFilterChanged}
                        onFilterEditClick={onFilterEditClick}
                      />
                    ) : (
                      <HostsTab
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
                      <ThresholdPanel
                        entityType={_('Ports')}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        threshold={threshold}
                        onFilterChanged={onFilterChanged}
                        onFilterEditClick={onFilterEditClick}
                      />
                    ) : (
                      <PortsTab
                        counts={ports.counts}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        ports={ports.entities}
                        sortField={sorting.ports.sortField}
                        sortReverse={sorting.ports.sortReverse}
                        onInteraction={onInteraction}
                        onSortChange={sortField =>
                          onSortChange('ports', sortField)
                        }
                      />
                    )}
                  </TabPanel>
                  <TabPanel>
                    {showInitialLoading ? (
                      <Loading />
                    ) : showThresholdMessage ? (
                      <ThresholdPanel
                        entityType={_('Applications')}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        threshold={threshold}
                        onFilterChanged={onFilterChanged}
                        onFilterEditClick={onFilterEditClick}
                      />
                    ) : (
                      <ApplicationsTab
                        applications={applications.entities}
                        counts={applications.counts}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        sortField={sorting.apps.sortField}
                        sortReverse={sorting.apps.sortReverse}
                        onInteraction={onInteraction}
                        onSortChange={sortField =>
                          onSortChange('apps', sortField)
                        }
                      />
                    )}
                  </TabPanel>
                  <TabPanel>
                    {showInitialLoading ? (
                      <Loading />
                    ) : showThresholdMessage ? (
                      <ThresholdPanel
                        entityType={_('Operating Systems')}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        threshold={threshold}
                        onFilterChanged={onFilterChanged}
                        onFilterEditClick={onFilterEditClick}
                      />
                    ) : (
                      <OperatingSystemsTab
                        counts={operatingsystems.counts}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        operatingsystems={operatingsystems.entities}
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
                      <ThresholdPanel
                        entityType={_('CVEs')}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        threshold={threshold}
                        onFilterChanged={onFilterChanged}
                        onFilterEditClick={onFilterEditClick}
                      />
                    ) : (
                      <CvesTab
                        counts={cves.counts}
                        cves={cves.entities}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        sortField={sorting.cves.sortField}
                        sortReverse={sorting.cves.sortReverse}
                        onInteraction={onInteraction}
                        onSortChange={sortField =>
                          onSortChange('cves', sortField)
                        }
                      />
                    )}
                  </TabPanel>
                  <TabPanel>
                    {showInitialLoading ? (
                      <Loading />
                    ) : showThresholdMessage ? (
                      <ThresholdPanel
                        entityType={_('Closed CVEs')}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        threshold={threshold}
                        onFilterChanged={onFilterChanged}
                        onFilterEditClick={onFilterEditClick}
                      />
                    ) : (
                      <ClosedCvesTab
                        closedCves={closedCves.entities}
                        counts={closedCves.counts}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        sortField={sorting.closedcves.sortField}
                        sortReverse={sorting.closedcves.sortReverse}
                        onInteraction={onInteraction}
                        onSortChange={sortField =>
                          onSortChange('closedcves', sortField)
                        }
                      />
                    )}
                  </TabPanel>
                  <TabPanel>
                    {showInitialLoading ? (
                      <Loading />
                    ) : showThresholdMessage ? (
                      <ThresholdPanel
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
  gmp: PropTypes.gmp.isRequired,
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
  onFilterAddLogLevelClick: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onFilterCreated: PropTypes.func.isRequired,
  onFilterDecreaseMinQoDClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
  onFilterRemoveClick: PropTypes.func.isRequired,
  onFilterRemoveSeverityClick: PropTypes.func.isRequired,
  onFilterResetClick: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onRemoveFromAssetsClick: PropTypes.func.isRequired,
  onReportDownloadClick: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onTagSuccess: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
  onTlsCertificateDownloadClick: PropTypes.func.isRequired,
};

export default withGmp(PageContent);
