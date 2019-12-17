/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {TASK_STATUS} from 'gmp/models/task';

import {isDefined} from 'gmp/utils/identity';

import StatusBar from 'web/components/bar/statusbar';
import ToolBar from 'web/components/bar/toolbar';

import DateTime from 'web/components/date/datetime';

import ReportIcon from 'web/components/icon/reporticon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import Loading from 'web/components/loading/loading';

import Powerfilter from 'web/components/powerfilter/powerfilter';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import Section from 'web/components/section/section';
import SectionHeader from 'web/components/section/header';

import EntityInfo from 'web/entity/info';
import EntityTags from 'web/entity/tags';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import ApplicationsTab from './details/applicationstab';
import CvesTab from './details/cvestab';
import ClosedCvesTab from './details/closedcvestab';
import ErrorsTab from './details/errorstab';
import HostsTab from './details/hoststab';
import OperatingSystemsTab from './details/operatingsystemstab';
import PortsTab from './details/portstab';
import ResultsTab from './details/resultstab';
import Summary from './details/summary';
import TabTitle from './details/tabtitle';
import ThresholdPanel from './details/thresholdpanel';
import TLSCertificatesTab from './details/tlscertificatestab';
import ToolBarIcons from './details/toolbaricons';
import ErrorPanel from 'web/components/error/errorpanel';

const Span = styled.span`
  margin-top: 2px;
`;

const PageContent = ({
  activeTab,
  entity,
  filters,
  gmp,
  isLoading = true,
  isUpdating = false,
  reportError,
  reportFilter,
  reportId,
  sorting,
  showError,
  showErrorMessage,
  showSuccessMessage,
  task,
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
  const {report = {}} = entity || {};

  const {userTags = {}} = report;
  const userTagsCount = userTags.length;

  const {
    applications = {},
    closed_cves = {},
    cves = {},
    errors = {},
    hosts = {},
    operatingsystems = {},
    ports = {},
    results = {},
    tls_certificates = {},
    timestamp,
    scan_run_status,
  } = report;

  const hasReport = isDefined(entity);

  if (!hasReport && isDefined(reportError)) {
    return (
      <ErrorPanel
        message={_('Error while loading Report {{reportId}}', {reportId})}
        error={reportError}
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
            <StatusBar status={status} progress={progress} />
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
    <Layout grow flex="column" align={['start', 'stretch']}>
      <ToolBar>
        <ToolBarIcons
          filter={reportFilter}
          isLoading={showIsLoading}
          report={hasReport ? report : undefined}
          reportId={reportId}
          showError={showError}
          showSuccessMessage={showSuccessMessage}
          showErrorMessage={showErrorMessage}
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
            filter={reportFilter}
            filters={filters}
            onEditClick={onFilterEditClick}
            onError={onError}
            onFilterCreated={onFilterCreated}
            onResetClick={onFilterResetClick}
            onRemoveClick={onFilterRemoveClick}
            onUpdate={onFilterChanged}
          />
        </Layout>
      </ToolBar>

      <Section header={header}>
        {showIsLoading ? (
          <Loading />
        ) : (
          <React.Fragment>
            <TabLayout grow="1" align={['start', 'end']}>
              <TabList
                active={activeTab}
                align={['start', 'stretch']}
                onActivateTab={onActivateTab}
              >
                <Tab>{_('Information')}</Tab>
                <Tab>
                  <TabTitle title={_('Results')} counts={results.counts} />
                </Tab>
                <Tab>
                  <TabTitle title={_('Hosts')} counts={hosts.counts} />
                </Tab>
                <Tab>
                  <TabTitle title={_('Ports')} counts={ports.counts} />
                </Tab>
                <Tab>
                  <TabTitle
                    title={_('Applications')}
                    counts={applications.counts}
                  />
                </Tab>
                <Tab>
                  <TabTitle
                    title={_('Operating Systems')}
                    counts={operatingsystems.counts}
                  />
                </Tab>
                <Tab>
                  <TabTitle title={_('CVEs')} counts={cves.counts} />
                </Tab>
                <Tab>
                  <TabTitle
                    title={_('Closed CVEs')}
                    counts={closed_cves.counts}
                  />
                </Tab>
                <Tab>
                  <TabTitle
                    title={_('TLS Certificates')}
                    counts={tls_certificates.counts}
                  />
                </Tab>
                <Tab>
                  <TabTitle
                    title={_('Error Messages')}
                    counts={errors.counts}
                  />
                </Tab>
                <Tab>
                  <TabTitle title={_('User Tags')} count={userTagsCount} />
                </Tab>
              </TabList>
            </TabLayout>

            {hasReport ? (
              <Tabs active={activeTab}>
                <TabPanels>
                  <TabPanel>
                    <Summary
                      filter={reportFilter}
                      report={report}
                      reportError={reportError}
                      reportId={reportId}
                      isUpdating={isUpdating}
                      onError={onError}
                      onTagChanged={onTagSuccess}
                    />
                  </TabPanel>
                  <TabPanel>
                    <ResultsTab
                      status={status}
                      progress={progress}
                      hasTarget={!isContainer}
                      reportFilter={reportFilter}
                      reportId={reportId}
                      results={results.entities}
                      sortField={sorting.results.sortField}
                      sortReverse={sorting.results.sortReverse}
                      onFilterAddLogLevelClick={onFilterAddLogLevelClick}
                      onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
                      onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
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
                      <ThresholdPanel
                        entityType={_('Hosts')}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        threshold={threshold}
                        onFilterEditClick={onFilterEditClick}
                        onFilterChanged={onFilterChanged}
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
                        onFilterEditClick={onFilterEditClick}
                        onFilterChanged={onFilterChanged}
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
                        onFilterEditClick={onFilterEditClick}
                        onFilterChanged={onFilterChanged}
                      />
                    ) : (
                      <ApplicationsTab
                        counts={applications.counts}
                        applications={applications.entities}
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
                        onFilterEditClick={onFilterEditClick}
                        onFilterChanged={onFilterChanged}
                      />
                    ) : (
                      <OperatingSystemsTab
                        counts={operatingsystems.counts}
                        operatingsystems={operatingsystems.entities}
                        filter={reportFilter}
                        sortField={sorting.os.sortField}
                        sortReverse={sorting.os.sortReverse}
                        isUpdating={isUpdating}
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
                        onFilterEditClick={onFilterEditClick}
                        onFilterChanged={onFilterChanged}
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
                        threshold={threshold}
                        isUpdating={isUpdating}
                        onFilterEditClick={onFilterEditClick}
                        onFilterChanged={onFilterChanged}
                      />
                    ) : (
                      <ClosedCvesTab
                        counts={closed_cves.counts}
                        closedCves={closed_cves.entities}
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
                        onFilterEditClick={onFilterEditClick}
                        onFilterChanged={onFilterChanged}
                      />
                    ) : (
                      <TLSCertificatesTab
                        counts={tls_certificates.counts}
                        tlsCertificates={tls_certificates.entities}
                        filter={reportFilter}
                        isUpdating={isUpdating}
                        sortField={sorting.tlscerts.sortField}
                        sortReverse={sorting.tlscerts.sortReverse}
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
  entity: PropTypes.model,
  filters: PropTypes.array,
  gmp: PropTypes.gmp.isRequired,
  isLoading: PropTypes.bool,
  isUpdating: PropTypes.bool,
  reportError: PropTypes.error,
  reportFilter: PropTypes.filter,
  reportId: PropTypes.id.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  sorting: PropTypes.object,
  task: PropTypes.model,
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

// vim: set ts=2 sw=2 tw=80:
