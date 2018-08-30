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

import glamorous, {Span} from 'glamorous';

import _ from 'gmp/locale';
import {longDate} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';
import {renderSelectItems} from '../../utils/render.js';

import EntityInfo from '../../entity/info.js';

import StatusBar from '../../components/bar/statusbar.js';
import ToolBar from '../../components/bar/toolbar.js';

import Select from '../../components/form/select.js';

import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import IconDivider from '../../components/layout/icondivider.js';
import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import Loading from '../../components/loading/loading.js';

import DetailsLink from '../../components/link/detailslink.js';
import Link from '../../components/link/link.js';

import Powerfilter from '../../components/powerfilter/powerfilter.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import Section from '../../components/section/section.js';
import SectionHeader from '../../components/section/header.js';

import EntityTags from '../../entity/tags.js';
import TagsHandler from '../../entity/tagshandler.js';

import AlertActions from './alertactions.js';
import ApplicationsTable from './applicationstable.js';
import ClosedCvesTable from './closedcvestable.js';
import CvesTable from './cvestable.js';
import ErrorsTable from './errorstable.js';
import HostsTable from './hoststable.js';
import OperatingSystemsTable from './operatingsystemstable.js';
import PortsTable from './portstable.js';
import ReportEntitiesContainer from './reportentitiescontainer.js';
import ResultsTab from './resultstab.js';
import Summary from './summary.js';
import TLSCertificatesTable from './tlscertificatestable.js';

import {
  apps_sort_functions,
  closed_cves_sort_functions,
  cves_sort_functions,
  errors_sort_functions,
  hosts_sort_functions,
  operatingssystems_sort_functions,
  ports_sort_functions,
  tls_certificates_sort_functions,
} from './sort.js';
import {TASK_STATUS} from 'gmp/models/task.js';

const TabTitleCounts = glamorous.span({
  fontSize: '0.7em',
});

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
  onRemoveFromAssetsClick: PropTypes.func.isRequired,
  onReportDownloadClick: PropTypes.func.isRequired,
  onReportFormatChange: PropTypes.func.isRequired,
};

const UserTags = ({
  report,
  onError,
  onTagChanged,
}) => {
  return (
    <TagsHandler
      onError={onError}
      onChanged={onTagChanged}
      resourceType="report"
    >
      {({
        add,
        create,
        delete: delete_func,
        disable,
        enable,
        edit,
        remove,
      }) => (
        <EntityTags
          entity={report}
          onTagAddClick={add}
          onTagCreateClick={create}
          onTagDeleteClick={delete_func}
          onTagDisableClick={disable}
          onTagEditClick={edit}
          onTagEndableClick={enable}
          onTagRemoveClick={remove}
        />
      )}
    </TagsHandler>
  );
};

UserTags.propTypes = {
  report: PropTypes.model.isRequired,
  onError: PropTypes.func.isRequired,
  onTagChanged: PropTypes.func.isRequired,
};

const PageContent = ({
  activeTab,
  entity,
  filter,
  filters,
  loading = true,
  report_formats,
  report_format_id,
  showError,
  showErrorMessage,
  showSuccessMessage,
  updating = false,
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
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  onReportFormatChange,
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
  loading = loading && (!hasReport || updating);

  const delta = isDefined(report.isDeltaReport) ?
    report.isDeltaReport() : undefined;

  const isContainer = isDefined(task.isContainer) && task.isContainer();
  const status = isContainer ? TASK_STATUS.container : scan_run_status;

  const header_title = (
    <Divider>
      <span>
        {_('Report:')}
      </span>
      {loading ?
        <span>
          {_('Loading')}
        </span> :
        <Divider>
          <span>
            {longDate(timestamp)}
          </span>
          <Span marginTop="2px">
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
          loading={loading}
          report={report}
          report_format_id={report_format_id}
          report_formats={report_formats}
          showError={showError}
          showSuccessMessage={showSuccessMessage}
          showErrorMessage={showErrorMessage}
          onAddToAssetsClick={onAddToAssetsClick}
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
        {loading ?
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
                    status={status}
                    onFilterAddLogLevelClick={onFilterAddLogLevelClick}
                    onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
                    onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
                    onFilterEditClick={onFilterEditClick}
                    onFilterResetClick={onFilterResetClick}
                    onTargetEditClick={onTargetEditClick}
                  />
                </TabPanel>
                <TabPanel>
                  <ReportEntitiesContainer
                    counts={hosts.counts}
                    entities={hosts.entities}
                    filter={filter}
                    sortFunctions={hosts_sort_functions}
                  >
                    {props => (
                      <HostsTable
                        {...props}
                        toggleDetailsIcon={false}
                      />
                    )}
                  </ReportEntitiesContainer>
                </TabPanel>
                <TabPanel>
                  <ReportEntitiesContainer
                    counts={ports.counts}
                    entities={ports.entities}
                    filter={filter}
                    sortFunctions={ports_sort_functions}
                  >
                    {props => (
                      <PortsTable
                        {...props}
                        toggleDetailsIcon={false}
                      />
                    )}
                  </ReportEntitiesContainer>
                </TabPanel>
                <TabPanel>
                  <ReportEntitiesContainer
                    counts={applications.counts}
                    entities={applications.entities}
                    filter={filter}
                    sortFunctions={apps_sort_functions}
                  >
                    {props => (
                      <ApplicationsTable
                        {...props}
                        toggleDetailsIcon={false}
                      />
                    )}
                  </ReportEntitiesContainer>
                </TabPanel>
                <TabPanel>
                  <ReportEntitiesContainer
                    {...operatingsystems}
                    counts={operatingsystems.counts}
                    entities={operatingsystems.entities}
                    filter={filter}
                    sortFunctions={operatingssystems_sort_functions}
                  >
                    {props => (
                      <OperatingSystemsTable
                        {...props}
                        toggleDetailsIcon={false}
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
                  >
                    {props => (
                      <CvesTable
                        {...props}
                        toggleDetailsIcon={false}
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
                  >
                    {props => (
                      <ClosedCvesTable
                        {...props}
                        toggleDetailsIcon={false}
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
                  >
                    {props => (
                      <TLSCertificatesTable
                        {...props}
                        onTlsCertificateDownloadClick={
                          onTlsCertificateDownloadClick}
                        toggleDetailsIcon={false}
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
                  >
                    {props => (
                      <ErrorsTable
                        {...props}
                        toggleDetailsIcon={false}
                      />
                    )}
                  </ReportEntitiesContainer>
                </TabPanel>
                <TabPanel>
                  <UserTags
                    report={report}
                    onError={onError}
                    onTagChanged={onTagSuccess}
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
  loading: PropTypes.bool,
  report_format_id: PropTypes.id,
  report_formats: PropTypes.array,
  showError: PropTypes.func.isRequired,
  showErrorMessage: PropTypes.func.isRequired,
  showSuccessMessage: PropTypes.func.isRequired,
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
  onRemoveFromAssetsClick: PropTypes.func.isRequired,
  onReportDownloadClick: PropTypes.func.isRequired,
  onReportFormatChange: PropTypes.func.isRequired,
  onTagSuccess: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
  onTlsCertificateDownloadClick: PropTypes.func.isRequired,
};

export default PageContent;

// vim: set ts=2 sw=2 tw=80:
