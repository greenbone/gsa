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

import _, {datetime} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import Theme from '../../utils/theme.js';
import {render_entities_counts, render_options} from '../../utils/render.js';

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
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import Section from '../../components/section/section.js';
import SectionHeader from '../../components/section/header.js';

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

const TabLayout = glamorous(Layout)({
  borderBottom: '1px solid ' + Theme.extra.lightGray,
  marginTop: '30px',
  marginBottom: '15px',
  paddingBottom: '0px',
});

const TabTitleCounts = glamorous.span({
  fontSize: '0.7em',
});

const TabTitle = ({title, counts}) => (
  <Layout flex="column" align={['center', 'center']}>
    <span>{title}</span>
    <TabTitleCounts>(<i>{render_entities_counts(counts)}</i>)</TabTitleCounts>
  </Layout>
);

TabTitle.propTypes = {
  counts: PropTypes.counts.isRequired,
  title: PropTypes.string.isRequired,
};

const ToolBarIcons = ({
  delta = false,
  filter,
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
  const {task} = report;
  const {id: task_id} = task;
  return (
    <Divider margin="15px">
      <IconDivider>
        <ManualIcon
          page="vulnerabilitymanagement"
          anchor="reports-and-vulnerability-management"
          title={_('Help: Reports')}/>
        <ListIcon
          title={_('Reports List')}
          page="reports"
        />
      </IconDivider>
      <IconDivider>
        <Select
          name="report_format_id"
          value={report_format_id}
          onChange={onReportFormatChange}
        >
          {render_options(report_formats)}
        </Select>
        <Icon
          img="download.svg"
          title={_('Download filtered Report')}
          onClick={onReportDownloadClick}
        />
      </IconDivider>
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
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  delta: PropTypes.bool,
  filter: PropTypes.filter,
  report: PropTypes.model.isRequired,
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

const PageContent = ({
  activeTab,
  entity,
  filter,
  filters,
  loading = false,
  report_formats,
  report_format_id,
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
  onFilterResetClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  onReportFormatChange,
  onTagSuccess,
  onTargetEditClick,
}) => {
  if (!is_defined(entity)) {
    return (
      <Loading loading={loading}/>
    );
  }

  const {
    report,
  } = entity;

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

  const delta = report.isDeltaReport();

  const status = is_defined(task.isContainer) && task.isContainer() ?
    _('Container') : scan_run_status;

  const header_title = (
    <Divider>
      <span>
        {_('Report:')}
      </span>
      <span>
        {datetime(timestamp)}
      </span>
      <Span marginTop="2px">
        <StatusBar
          status={status}
          progress={task.progress}
        />
      </Span>
    </Divider>
  );

  const header = (
    <SectionHeader
      img="report.svg"
      title={header_title}
    >
      <EntityInfo
        entity={entity}
      />
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
            onUpdate={onFilterChanged}
          />
        </Layout>
      </ToolBar>

      <Section
        header={header}
      >
        <TabLayout
          grow="1"
          align={['start', 'end']}>
          <TabList
            active={activeTab}
            align={['start', 'stretch']}i
            onActivateTab={onActivateTab}
          >
            <Tab>
              {_('Summary')}
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
                delta={delta}
                filter={filter}
                results={results.entities}
                counts={results.counts}
                progress={task.progress}
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
          </TabPanels>
        </Tabs>
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
  onActivateTab: PropTypes.func.isRequired,
  onAddToAssetsClick: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterAddLogLevelClick: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onFilterCreated: PropTypes.func.isRequired,
  onFilterDecreaseMinQoDClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
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
