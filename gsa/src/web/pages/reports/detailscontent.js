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

import ErrorMessage from 'web/components/error/errormessage';

import AddToAssetsIcon from 'web/components/icon/addtoassetsicon';
import DownloadIcon from 'web/components/icon/downloadicon';
import VulnerabilityIcon from 'web/components/icon/vulnerabilityicon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import PerformanceIcon from 'web/components/icon/performanceicon';
import RemoveFromAssetsIcon from 'web/components/icon/removefromassetsicon';
import ReportIcon from 'web/components/icon/reporticon';
import ResultIcon from 'web/components/icon/resulticon';
import TaskIcon from 'web/components/icon/taskicon';

import IconDivider from 'web/components/layout/icondivider';
import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import Loading from 'web/components/loading/loading';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

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

import AlertActions from './alertactions';
import ApplicationsTable from './applicationstable';
import ClosedCvesTable from './closedcvestable';
import CvesTable from './cvestable';
import ErrorsTable from './errorstable';
import HostsTable from './hoststable';
import OperatingSystemsTable from './operatingsystemstable';
import PortsTable from './portstable';
import ReportEntitiesContainer from './reportentitiescontainer';
import ResultsTab from './resultstab';
import Summary from './summary';
import TLSCertificatesTable from './tlscertificatestable';

import {
  appsSortFunctions,
  closedCvesSortFunctions,
  cvesSortFunctions,
  errorsSortFunctions,
  hostsSortFunctions,
  operatingssystemsSortFunctions,
  portsSortFunctions,
  tlsCertificatesSortFunctions,
} from './sort';

const TabTitleCounts = styled.span`
  font-size: 0.7em;
`;

const Span = styled.span`
  margin-top: 2px;
`;

const TabTitle = ({title, counts}) => (
  <Layout flex="column" align={['center', 'center']}>
    <span>{title}</span>
    <TabTitleCounts>
      (<i>{_('{{filtered}} of {{all}}', counts)}</i>)
    </TabTitleCounts>
  </Layout>
);

TabTitle.propTypes = {
  counts: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
};

const TabTitleWithSingleCount = ({title, count}) => (
  <Layout flex="column" align={['center', 'center']}>
    <span>{title}</span>
    <TabTitleCounts>
      (<i>{count}</i>)
    </TabTitleCounts>
  </Layout>
);

TabTitleWithSingleCount.propTypes = {
  count: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

const ToolBarIcons = ({
  delta = false,
  filter,
  loading,
  report,
  task,
  onAddToAssetsClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  showError,
  showErrorMessage,
  showSuccessMessage,
  onInteraction,
}) => {
  return (
    <Divider margin="15px">
      <IconDivider>
        <ManualIcon
          page="vulnerabilitymanagement"
          anchor="reports-and-vulnerability-management"
          title={_('Help: Reports')}
        />
        <ListIcon title={_('Reports List')} page="reports" />
      </IconDivider>
      {!loading && (
        <React.Fragment>
          <IconDivider>
            <AddToAssetsIcon
              title={_('Add to Assets with QoD=>70% and Overrides enabled')}
              onClick={onAddToAssetsClick}
            />
            <RemoveFromAssetsIcon
              title={_('Remove from Assets')}
              onClick={onRemoveFromAssetsClick}
            />
          </IconDivider>
          <IconDivider>
            <DetailsLink
              type="task"
              textOnly={!isDefined(task)}
              id={isDefined(task) ? task.id : ''}
              title={_('Corresponding Task')}
            >
              <TaskIcon />
            </DetailsLink>
            <Link
              to="results"
              filter={'report_id=' + report.id}
              title={_('Corresponding Results')}
            >
              <ResultIcon />
            </Link>
            <Link
              to="vulnerabilities"
              filter={'report_id=' + report.id}
              title={_('Corresponding Vulnerabilities')}
            >
              <VulnerabilityIcon />
            </Link>
            {isDefined(task) && !task.isContainer() && (
              <Link
                to="performance"
                title={_('Corresponding Performance')}
                query={{
                  start: isDefined(report.scan_start)
                    ? report.scan_start.toISOString()
                    : undefined,
                  end: isDefined(report.scan_end)
                    ? report.scan_end.toISOString()
                    : undefined,
                  scanner: isDefined(report.slave)
                    ? report.slave.id
                    : undefined,
                }}
              >
                <PerformanceIcon />
              </Link>
            )}
          </IconDivider>
          <IconDivider>
            <DownloadIcon
              title={_('Download filtered Report')}
              onClick={onReportDownloadClick}
            />
            {!delta && (
              <AlertActions
                filter={filter}
                report={report}
                showError={showError}
                showSuccessMessage={showSuccessMessage}
                showErrorMessage={showErrorMessage}
                onInteraction={onInteraction}
              />
            )}
          </IconDivider>
        </React.Fragment>
      )}
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  delta: PropTypes.bool,
  filter: PropTypes.filter,
  loading: PropTypes.bool,
  report: PropTypes.object.isRequired,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  task: PropTypes.model,
  onAddToAssetsClick: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onRemoveFromAssetsClick: PropTypes.func.isRequired,
  onReportDownloadClick: PropTypes.func.isRequired,
};

const PageContent = ({
  activeTab,
  entity,
  entityError,
  filter,
  filters,
  isLoading = true,
  isUpdating = false,
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
    applications,
    closed_cves,
    cves,
    errors,
    hosts,
    operatingsystems,
    ports,
    results,
    result_count = {},
    tls_certificates,
    timestamp,
    scan_run_status,
  } = report;

  const hasReport = isDefined(entity);

  if (!hasReport && isDefined(entityError)) {
    return <ErrorMessage message={entityError.message} />;
  }

  const delta = isDefined(report.isDeltaReport)
    ? report.isDeltaReport()
    : undefined;

  const isContainer = isDefined(task) && task.isContainer();
  const status = isContainer ? TASK_STATUS.container : scan_run_status;
  const progress = isDefined(task) ? task.progress : 0;

  const header_title = (
    <Divider>
      <span>{_('Report:')}</span>
      {isLoading ? (
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

  const {full, filtered} = result_count;
  const resultCounts = {filtered, all: full};

  return (
    <Layout grow flex="column" align={['start', 'stretch']}>
      <ToolBar>
        <ToolBarIcons
          delta={delta}
          filter={filter}
          loading={isLoading}
          report={report}
          showError={showError}
          showSuccessMessage={showSuccessMessage}
          showErrorMessage={showErrorMessage}
          task={task}
          onAddToAssetsClick={onAddToAssetsClick}
          onInteraction={onInteraction}
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
            onResetClick={onFilterResetClick}
            onRemoveClick={onFilterRemoveClick}
            onUpdate={onFilterChanged}
          />
        </Layout>
      </ToolBar>

      <Section header={header}>
        {isLoading ? (
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
                {delta ? (
                  <Tab>
                    <TabTitleWithSingleCount
                      title={_('Results')}
                      count={filtered}
                    />
                  </Tab>
                ) : (
                  <Tab>
                    <TabTitle title={_('Results')} counts={resultCounts} />
                  </Tab>
                )}
                {!delta && (
                  <Tab>
                    <TabTitle title={_('Hosts')} counts={hosts.counts} />
                  </Tab>
                )}
                {!delta && (
                  <Tab>
                    <TabTitle title={_('Ports')} counts={ports.counts} />
                  </Tab>
                )}
                {!delta && (
                  <Tab>
                    <TabTitle
                      title={_('Applications')}
                      counts={applications.counts}
                    />
                  </Tab>
                )}
                {!delta && (
                  <Tab>
                    <TabTitle
                      title={_('Operating Systems')}
                      counts={operatingsystems.counts}
                    />
                  </Tab>
                )}
                {!delta && (
                  <Tab>
                    <TabTitle title={_('CVEs')} counts={cves.counts} />
                  </Tab>
                )}
                {!delta && (
                  <Tab>
                    <TabTitle
                      title={_('Closed CVEs')}
                      counts={closed_cves.counts}
                    />
                  </Tab>
                )}
                {!delta && (
                  <Tab>
                    <TabTitle
                      title={_('TLS Certificates')}
                      counts={tls_certificates.counts}
                    />
                  </Tab>
                )}
                {!delta && (
                  <Tab>
                    <TabTitle
                      title={_('Error Messages')}
                      counts={errors.counts}
                    />
                  </Tab>
                )}
                <Tab>
                  <TabTitleWithSingleCount
                    title={_('User Tags')}
                    count={userTagsCount}
                  />
                </Tab>
              </TabList>
            </TabLayout>
            {isDefined(results) ? (
              <Tabs active={activeTab}>
                <TabPanels>
                  <TabPanel>
                    <Summary
                      report={report}
                      onError={onError}
                      onTagChanged={onTagSuccess}
                    />
                  </TabPanel>
                  <TabPanel>
                    <ResultsTab
                      counts={results.counts}
                      delta={delta}
                      filter={filter}
                      hasTarget={!isContainer}
                      isUpdating={isUpdating}
                      progress={progress}
                      results={isDefined(results) ? results.entities : {}}
                      sortField={sorting.results.sortField}
                      sortReverse={sorting.results.sortReverse}
                      status={status}
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
                    <ReportEntitiesContainer
                      counts={hosts.counts}
                      entities={hosts.entities}
                      filter={filter}
                      sortField={sorting.hosts.sortField}
                      sortReverse={sorting.hosts.sortReverse}
                      sortFunctions={hostsSortFunctions}
                      onInteraction={onInteraction}
                    >
                      {({
                        entities,
                        entitiesCounts,
                        sortBy,
                        sortDir,
                        onFirstClick,
                        onLastClick,
                        onNextClick,
                        onPreviousClick,
                      }) => (
                        <HostsTable
                          entities={entities}
                          entitiesCounts={entitiesCounts}
                          filter={filter}
                          isUpdating={isUpdating}
                          sortBy={sortBy}
                          sortDir={sortDir}
                          toggleDetailsIcon={false}
                          onFirstClick={onFirstClick}
                          onLastClick={onLastClick}
                          onNextClick={onNextClick}
                          onPreviousClick={onPreviousClick}
                          onSortChange={sortField =>
                            onSortChange('hosts', sortField)
                          }
                        />
                      )}
                    </ReportEntitiesContainer>
                  </TabPanel>
                  <TabPanel>
                    <ReportEntitiesContainer
                      counts={ports.counts}
                      entities={ports.entities}
                      filter={filter}
                      sortField={sorting.ports.sortField}
                      sortFunctions={portsSortFunctions}
                      sortReverse={sorting.ports.sortReverse}
                      onInteraction={onInteraction}
                    >
                      {({
                        entities,
                        entitiesCounts,
                        sortBy,
                        sortDir,
                        onFirstClick,
                        onLastClick,
                        onNextClick,
                        onPreviousClick,
                      }) => (
                        <PortsTable
                          entities={entities}
                          entitiesCounts={entitiesCounts}
                          filter={filter}
                          isUpdating={isUpdating}
                          sortBy={sortBy}
                          sortDir={sortDir}
                          toggleDetailsIcon={false}
                          onFirstClick={onFirstClick}
                          onLastClick={onLastClick}
                          onNextClick={onNextClick}
                          onPreviousClick={onPreviousClick}
                          onSortChange={sortField =>
                            onSortChange('ports', sortField)
                          }
                        />
                      )}
                    </ReportEntitiesContainer>
                  </TabPanel>
                  <TabPanel>
                    <ReportEntitiesContainer
                      counts={applications.counts}
                      entities={applications.entities}
                      filter={filter}
                      sortField={sorting.apps.sortField}
                      sortFunctions={appsSortFunctions}
                      sortReverse={sorting.apps.sortReverse}
                      onInteraction={onInteraction}
                    >
                      {({
                        entities,
                        entitiesCounts,
                        sortBy,
                        sortDir,
                        onFirstClick,
                        onLastClick,
                        onNextClick,
                        onPreviousClick,
                      }) => (
                        <ApplicationsTable
                          entities={entities}
                          entitiesCounts={entitiesCounts}
                          filter={filter}
                          isUpdating={isUpdating}
                          sortBy={sortBy}
                          sortDir={sortDir}
                          toggleDetailsIcon={false}
                          onFirstClick={onFirstClick}
                          onLastClick={onLastClick}
                          onNextClick={onNextClick}
                          onPreviousClick={onPreviousClick}
                          onSortChange={sortField =>
                            onSortChange('apps', sortField)
                          }
                        />
                      )}
                    </ReportEntitiesContainer>
                  </TabPanel>
                  <TabPanel>
                    <ReportEntitiesContainer
                      counts={operatingsystems.counts}
                      entities={operatingsystems.entities}
                      filter={filter}
                      sortFunctions={operatingssystemsSortFunctions}
                      sortField={sorting.os.sortField}
                      sortReverse={sorting.os.sortReverse}
                      onInteraction={onInteraction}
                    >
                      {({
                        entities,
                        entitiesCounts,
                        sortBy,
                        sortDir,
                        onFirstClick,
                        onLastClick,
                        onNextClick,
                        onPreviousClick,
                      }) => (
                        <OperatingSystemsTable
                          entities={entities}
                          entitiesCounts={entitiesCounts}
                          filter={filter}
                          isUpdating={isUpdating}
                          sortBy={sortBy}
                          sortDir={sortDir}
                          toggleDetailsIcon={false}
                          onFirstClick={onFirstClick}
                          onLastClick={onLastClick}
                          onNextClick={onNextClick}
                          onPreviousClick={onPreviousClick}
                          onSortChange={sortField =>
                            onSortChange('os', sortField)
                          }
                        />
                      )}
                    </ReportEntitiesContainer>
                  </TabPanel>
                  <TabPanel>
                    <ReportEntitiesContainer
                      counts={cves.counts}
                      entities={cves.entities}
                      filter={filter}
                      sortFunctions={cvesSortFunctions}
                      sortField={sorting.cves.sortField}
                      sortReverse={sorting.cves.sortReverse}
                      onInteraction={onInteraction}
                    >
                      {({
                        entities,
                        entitiesCounts,
                        sortBy,
                        sortDir,
                        onFirstClick,
                        onLastClick,
                        onNextClick,
                        onPreviousClick,
                      }) => (
                        <CvesTable
                          entities={entities}
                          entitiesCounts={entitiesCounts}
                          filter={filter}
                          isUpdating={isUpdating}
                          sortBy={sortBy}
                          sortDir={sortDir}
                          toggleDetailsIcon={false}
                          onFirstClick={onFirstClick}
                          onLastClick={onLastClick}
                          onNextClick={onNextClick}
                          onPreviousClick={onPreviousClick}
                          onSortChange={sortField =>
                            onSortChange('cves', sortField)
                          }
                        />
                      )}
                    </ReportEntitiesContainer>
                  </TabPanel>
                  <TabPanel>
                    <ReportEntitiesContainer
                      counts={closed_cves.counts}
                      entities={closed_cves.entities}
                      filter={filter}
                      sortFunctions={closedCvesSortFunctions}
                      sortField={sorting.closedcves.sortField}
                      sortReverse={sorting.closedcves.sortReverse}
                      onInteraction={onInteraction}
                    >
                      {({
                        entities,
                        entitiesCounts,
                        sortBy,
                        sortDir,
                        onFirstClick,
                        onLastClick,
                        onNextClick,
                        onPreviousClick,
                      }) => (
                        <ClosedCvesTable
                          entities={entities}
                          entitiesCounts={entitiesCounts}
                          filter={filter}
                          isUpdating={isUpdating}
                          sortBy={sortBy}
                          sortDir={sortDir}
                          toggleDetailsIcon={false}
                          onFirstClick={onFirstClick}
                          onLastClick={onLastClick}
                          onNextClick={onNextClick}
                          onPreviousClick={onPreviousClick}
                          onSortChange={sortField =>
                            onSortChange('closedcves', sortField)
                          }
                        />
                      )}
                    </ReportEntitiesContainer>
                  </TabPanel>
                  <TabPanel>
                    <ReportEntitiesContainer
                      counts={tls_certificates.counts}
                      entities={tls_certificates.entities}
                      filter={filter}
                      sortFunctions={tlsCertificatesSortFunctions}
                      sortField={sorting.tlscerts.sortField}
                      sortReverse={sorting.tlscerts.sortReverse}
                      onInteraction={onInteraction}
                    >
                      {({
                        entities,
                        entitiesCounts,
                        sortBy,
                        sortDir,
                        onFirstClick,
                        onLastClick,
                        onNextClick,
                        onPreviousClick,
                      }) => (
                        <TLSCertificatesTable
                          entities={entities}
                          entitiesCounts={entitiesCounts}
                          filter={filter}
                          isUpdating={isUpdating}
                          sortBy={sortBy}
                          sortDir={sortDir}
                          toggleDetailsIcon={false}
                          onFirstClick={onFirstClick}
                          onLastClick={onLastClick}
                          onNextClick={onNextClick}
                          onPreviousClick={onPreviousClick}
                          onSortChange={sortField =>
                            onSortChange('tlscerts', sortField)
                          }
                          onTlsCertificateDownloadClick={
                            onTlsCertificateDownloadClick
                          }
                        />
                      )}
                    </ReportEntitiesContainer>
                  </TabPanel>
                  <TabPanel>
                    <ReportEntitiesContainer
                      counts={errors.counts}
                      entities={errors.entities}
                      filter={filter}
                      sortFunctions={errorsSortFunctions}
                      sortField={sorting.errors.sortField}
                      sortReverse={sorting.errors.sortReverse}
                      onInteraction={onInteraction}
                    >
                      {({
                        entities,
                        entitiesCounts,
                        sortBy,
                        sortDir,
                        onFirstClick,
                        onLastClick,
                        onNextClick,
                        onPreviousClick,
                      }) => (
                        <ErrorsTable
                          entities={entities}
                          entitiesCounts={entitiesCounts}
                          filter={filter}
                          isUpdating={isUpdating}
                          sortBy={sortBy}
                          sortDir={sortDir}
                          toggleDetailsIcon={false}
                          onFirstClick={onFirstClick}
                          onLastClick={onLastClick}
                          onNextClick={onNextClick}
                          onPreviousClick={onPreviousClick}
                          onSortChange={sortField =>
                            onSortChange('errors', sortField)
                          }
                        />
                      )}
                    </ReportEntitiesContainer>
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
  entityError: PropTypes.object,
  filter: PropTypes.filter,
  filters: PropTypes.array,
  isLoading: PropTypes.bool,
  isUpdating: PropTypes.bool,
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

export default PageContent;

// vim: set ts=2 sw=2 tw=80:
