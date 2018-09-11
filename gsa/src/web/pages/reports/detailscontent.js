/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {longDate} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems} from 'web/utils/render';

import EntityInfo from 'web/entity/info';

import StatusBar from 'web/components/bar/statusbar';
import ToolBar from 'web/components/bar/toolbar';

import Select from 'web/components/form/select';

import ManualIcon from 'web/components/icon/manualicon';
import Icon from 'web/components/icon/icon';
import ListIcon from 'web/components/icon/listicon';

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

import EntityTags from 'web/entity/tags';

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
  apps_sort_functions,
  closed_cves_sort_functions,
  cves_sort_functions,
  errors_sort_functions,
  hosts_sort_functions,
  operatingssystems_sort_functions,
  ports_sort_functions,
  tls_certificates_sort_functions,
} from './sort';
import {TASK_STATUS} from 'gmp/models/task';

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
  counts: PropTypes.counts.isRequired,
  title: PropTypes.string.isRequired,
};

const TabTitleForUserTags = ({title, count}) => (
  <Layout flex="column" align={['center', 'center']}>
    <span>{title}</span>
    <TabTitleCounts>(<i>{count}</i>)</TabTitleCounts>
  </Layout>
);

TabTitleForUserTags.propTypes = {
  count: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

const ToolBarIcons = ({
  delta = false,
  filter,
  loading,
  report,
  report_formats,
  report_format_id,
  onAddToAssetsClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  onReportFormatChange,
  showError,
  showErrorMessage,
  showSuccessMessage,
  onInteraction,
}) => {
  const {task = {}} = report;
  const {id: task_id = ''} = task;
  return (
    <Divider margin="15px">
      <IconDivider>
        <ManualIcon
          page="vulnerabilitymanagement"
          anchor="reports-and-vulnerability-management"
          title={_('Help: Reports')}
        />
        <ListIcon
          title={_('Reports List')}
          page="reports"
        />
      </IconDivider>
      <IconDivider>
        <Select
          name="report_format_id"
          value={report_format_id}
          items={renderSelectItems(report_formats)}
          onChange={onReportFormatChange}
        />
        <Icon
          img="download.svg"
          title={_('Download filtered Report')}
          onClick={onReportDownloadClick}
        />
      </IconDivider>
      {!loading &&
        <React.Fragment>
          <IconDivider>
            <Icon
              img="add_to_assets.svg"
              title={_('Add to Assets with QoD=>70% and Overrides enabled')}
              onClick={onAddToAssetsClick}
            />
            <Icon
              img="remove_from_assets.svg"
              title={_('Remove from Assets')}
              onClick={onRemoveFromAssetsClick}
            />
          </IconDivider>
          <IconDivider>
            <DetailsLink
              type="task"
              id={task_id}
              title={_('Corresponding Task')}
            >
              <Icon
                img="task.svg"
              />
            </DetailsLink>
            <Link
              to="results"
              filter={'report_id=' + report.id}
              title={_('Corresponding Results')}
            >
              <Icon
                img="result.svg"
              />
            </Link>
            <Link
              to="vulnerabilities"
              filter={'report_id=' + report.id}
              title={_('Corresponding Vulnerabilities')}
            >
              <Icon
                img="vulnerability.svg"
              />
            </Link>
          </IconDivider>
          {!delta &&
            <AlertActions
              filter={filter}
              report={report}
              showError={showError}
              showSuccessMessage={showSuccessMessage}
              showErrorMessage={showErrorMessage}
              onInteraction={onInteraction}
            />
          }
        </React.Fragment>
      }
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  delta: PropTypes.bool,
  filter: PropTypes.filter,
  loading: PropTypes.bool,
  report: PropTypes.object.isRequired,
  report_format_id: PropTypes.id,
  report_formats: PropTypes.array,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  onAddToAssetsClick: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  onRemoveFromAssetsClick: PropTypes.func.isRequired,
  onReportDownloadClick: PropTypes.func.isRequired,
  onReportFormatChange: PropTypes.func.isRequired,
};

const PageContent = ({
  activeTab,
  entity,
  filter,
  filters,
  isLoading = true,
  reportFormats,
  reportFormatId,
  sorting,
  showError,
  showErrorMessage,
  showSuccessMessage,
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
  onReportFormatChange,
  onSortChange,
  onTagSuccess,
  onTargetEditClick,
}) => {

  const {
    report = {},
  } = entity || {};

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
    task = {},
    tls_certificates,
    timestamp,
    scan_run_status,
  } = report;

  const hasReport = isDefined(entity);

  const delta = isDefined(report.isDeltaReport) ?
    report.isDeltaReport() : undefined;

  const isContainer = isDefined(task.isContainer) && task.isContainer();
  const status = isContainer ? TASK_STATUS.container : scan_run_status;

  const header_title = (
    <Divider>
      <span>
        {_('Report:')}
      </span>
      {isLoading ?
        <span>
          {_('Loading')}
        </span> :
        <Divider>
          <span>
            {longDate(timestamp)}
          </span>
          <Span>
            <StatusBar
              status={status}
              progress={task.progress}
            />
          </Span>
        </Divider>
      }
    </Divider>
  );

  const header = (
    <SectionHeader
      img="report.svg"
      title={header_title}
    >
      {hasReport &&
        <EntityInfo
          entity={entity}
        />
      }
    </SectionHeader>
  );
  return (
    <Layout
      grow
      flex="column"
      align={['start', 'stretch']}
    >
      <ToolBar>
        <ToolBarIcons
          delta={delta}
          filter={filter}
          loading={isLoading}
          report={report}
          report_format_id={reportFormatId}
          report_formats={reportFormats}
          showError={showError}
          showSuccessMessage={showSuccessMessage}
          showErrorMessage={showErrorMessage}
          onAddToAssetsClick={onAddToAssetsClick}
          onInteraction={onInteraction}
          onRemoveFromAssetsClick={onRemoveFromAssetsClick}
          onReportDownloadClick={onReportDownloadClick}
          onReportFormatChange={onReportFormatChange}
        />
        <Layout flex align="end">
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

      <Section
        header={header}
      >
        {isLoading ?
          <Loading/> :
          <React.Fragment>
            <TabLayout
              grow="1"
              align={['start', 'end']}
            >
              <TabList
                active={activeTab}
                align={['start', 'stretch']}i
                onActivateTab={onActivateTab}
              >
                <Tab>
                  {_('Information')}
                </Tab>
                <Tab>
                  <TabTitle
                    title={_('Results')}
                    counts={results.counts}
                  />
                </Tab>
                {!delta &&
                  <Tab>
                    <TabTitle
                      title={_('Hosts')}
                      counts={hosts.counts}
                    />
                  </Tab>
                }
                {!delta &&
                  <Tab>
                    <TabTitle
                      title={_('Ports')}
                      counts={ports.counts}
                    />
                  </Tab>
                }
                {!delta &&
                  <Tab>
                    <TabTitle
                      title={_('Applications')}
                      counts={applications.counts}
                    />
                  </Tab>
                }
                {!delta &&
                  <Tab>
                    <TabTitle
                      title={_('Operating Systems')}
                      counts={operatingsystems.counts}
                    />
                  </Tab>
                }
                {!delta &&
                  <Tab>
                    <TabTitle
                      title={_('CVEs')}
                      counts={cves.counts}
                    />
                  </Tab>
                }
                {!delta &&
                  <Tab>
                    <TabTitle
                      title={_('Closed CVEs')}
                      counts={closed_cves.counts}
                    />
                  </Tab>
                }
                {!delta &&
                  <Tab>
                    <TabTitle
                      title={_('TLS Certificates')}
                      counts={tls_certificates.counts}
                    />
                  </Tab>
                }
                {!delta &&
                  <Tab>
                    <TabTitle
                      title={_('Error Messages')}
                      counts={errors.counts}
                    />
                  </Tab>
                }
                <Tab>
                  <TabTitleForUserTags
                    title={_('User Tags')}
                    count={userTagsCount}
                  />
                </Tab>
              </TabList>
            </TabLayout>
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
                    progress={task.progress}
                    results={results.entities}
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
                      onSortChange('results', sortField)}
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
                    sortFunctions={hosts_sort_functions}
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
                        sortBy={sortBy}
                        sortDir={sortDir}
                        toggleDetailsIcon={false}
                        onFirstClick={onFirstClick}
                        onLastClick={onLastClick}
                        onNextClick={onNextClick}
                        onPreviousClick={onPreviousClick}
                        onSortChange={
                          sortField => onSortChange('hosts', sortField)}
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
                    sortFunctions={ports_sort_functions}
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
                        sortBy={sortBy}
                        sortDir={sortDir}
                        toggleDetailsIcon={false}
                        onFirstClick={onFirstClick}
                        onLastClick={onLastClick}
                        onNextClick={onNextClick}
                        onPreviousClick={onPreviousClick}
                        onSortChange={
                          sortField => onSortChange('ports', sortField)}
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
                    sortFunctions={apps_sort_functions}
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
                        sortBy={sortBy}
                        sortDir={sortDir}
                        toggleDetailsIcon={false}
                        onFirstClick={onFirstClick}
                        onLastClick={onLastClick}
                        onNextClick={onNextClick}
                        onPreviousClick={onPreviousClick}
                        onSortChange={
                          sortField => onSortChange('apps', sortField)}
                      />
                    )}
                  </ReportEntitiesContainer>
                </TabPanel>
                <TabPanel>
                  <ReportEntitiesContainer
                    counts={operatingsystems.counts}
                    entities={operatingsystems.entities}
                    filter={filter}
                    sortFunctions={operatingssystems_sort_functions}
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
                        sortBy={sortBy}
                        sortDir={sortDir}
                        toggleDetailsIcon={false}
                        onFirstClick={onFirstClick}
                        onLastClick={onLastClick}
                        onNextClick={onNextClick}
                        onPreviousClick={onPreviousClick}
                        onSortChange={
                          sortField => onSortChange('os', sortField)}
                      />
                    )}
                  </ReportEntitiesContainer>
                </TabPanel>
                <TabPanel>
                  <ReportEntitiesContainer
                    counts={cves.counts}
                    entities={cves.entities}
                    filter={filter}
                    sortFunctions={cves_sort_functions}
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
                        sortBy={sortBy}
                        sortDir={sortDir}
                        toggleDetailsIcon={false}
                        onFirstClick={onFirstClick}
                        onLastClick={onLastClick}
                        onNextClick={onNextClick}
                        onPreviousClick={onPreviousClick}
                        onSortChange={
                          sortField => onSortChange('cves', sortField)}
                      />
                    )}
                  </ReportEntitiesContainer>
                </TabPanel>
                <TabPanel>
                  <ReportEntitiesContainer
                    counts={closed_cves.counts}
                    entities={closed_cves.entities}
                    filter={filter}
                    sortFunctions={closed_cves_sort_functions}
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
                        sortBy={sortBy}
                        sortDir={sortDir}
                        toggleDetailsIcon={false}
                        onFirstClick={onFirstClick}
                        onLastClick={onLastClick}
                        onNextClick={onNextClick}
                        onPreviousClick={onPreviousClick}
                        onSortChange={
                          sortField => onSortChange('closedcves', sortField)}
                      />
                    )}
                  </ReportEntitiesContainer>
                </TabPanel>
                <TabPanel>
                  <ReportEntitiesContainer
                    counts={tls_certificates.counts}
                    entities={tls_certificates.entities}
                    filter={filter}
                    sortFunctions={tls_certificates_sort_functions}
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
                        sortBy={sortBy}
                        sortDir={sortDir}
                        toggleDetailsIcon={false}
                        onFirstClick={onFirstClick}
                        onLastClick={onLastClick}
                        onNextClick={onNextClick}
                        onPreviousClick={onPreviousClick}
                        onSortChange={
                          sortField => onSortChange('tlscerts', sortField)}
                        onTlsCertificateDownloadClick={
                          onTlsCertificateDownloadClick}
                      />
                    )}
                  </ReportEntitiesContainer>
                </TabPanel>
                <TabPanel>
                  <ReportEntitiesContainer
                    counts={errors.counts}
                    entities={errors.entities}
                    filter={filter}
                    sortFunctions={errors_sort_functions}
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
                        sortBy={sortBy}
                        sortDir={sortDir}
                        toggleDetailsIcon={false}
                        onFirstClick={onFirstClick}
                        onLastClick={onLastClick}
                        onNextClick={onNextClick}
                        onPreviousClick={onPreviousClick}
                        onSortChange={
                          sortField => onSortChange('errors', sortField)}
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
          </React.Fragment>
        }
      </Section>
    </Layout>
  );
};

PageContent.propTypes = {
  activeTab: PropTypes.number,
  entity: PropTypes.model,
  filter: PropTypes.filter,
  filters: PropTypes.array,
  isLoading: PropTypes.bool,
  reportFormatId: PropTypes.id,
  reportFormats: PropTypes.array,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
  sorting: PropTypes.object,
  updating: PropTypes.bool,
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
  onReportFormatChange: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onTagSuccess: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
  onTlsCertificateDownloadClick: PropTypes.func.isRequired,
};

export default PageContent;

// vim: set ts=2 sw=2 tw=80:
