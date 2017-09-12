/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_entities_counts, render_options} from '../../utils/render.js';

import ToolBar from '../../components/bar/toolbar.js';

import Select2 from '../../components/form/select2.js';

import HelpIcon from '../../components/icon/helpicon.js';
import Icon from '../../components/icon/icon.js';

import IconDivider from '../../components/layout/icondivider.js';
import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';
import Link from '../../components/link/link.js';

import Powerfilter from '../../components/powerfilter/powerfilter.js';

import IconSizeProvider from '../../components/provider/iconsizeprovider.js';

import Tab from '../../components/tab/tab.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import Section from '../../components/section/section.js';
import SectionHeader from '../../components/section/header.js';

import ResultsTable from '../results/table.js';

import ApplicationsTable from './applicationstable.js';
import HostsTable from './hoststable.js';
import OperatingSystemsTable from './operatingsystemstable.js';

import EntityInfo from '../../entity/info.js';

import ReportEntitiesContainer from './reportentitiescontainer.js';
import Summary from './summary.js';

const StyledSection = glamorous(Section, {
  diplayName: 'Section',
})({
  marginTop: '10px',
});

const StyledLayout = glamorous(Layout)({
  marginLeft: '10px',
  marginRight: '10px',
});

const TabTitle = ({title, entities}) => (
  <Divider wrap align={['center', 'center']}>
    <span>{title}</span>
    <span>(<i>{render_entities_counts(entities)}</i>)</span>
  </Divider>
);

TabTitle.propTypes = {
  entities: PropTypes.collection.isRequired,
  title: PropTypes.string.isRequired,
};

const ToolBarIcons = ({
  report,
  report_formats,
  report_format_id,
  onAddToAssetsClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  onReportFormatChange,
}) => {
  const {task} = report;
  const task_id = task.id;
  return (
    <IconSizeProvider size="medium">
      <Divider margin="15px">
        <HelpIcon
          page="view_report"
          title={_('Help: View Report')}/>
        <IconDivider>
          <Select2
            name="report_format_id"
            value={report_format_id}
            onChange={onReportFormatChange}
          >
            {render_options(report_formats)}
          </Select2>
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
      </Divider>
    </IconSizeProvider>
  );
};

ToolBarIcons.propTypes = {
  report: PropTypes.model.isRequired,
  report_format_id: PropTypes.id,
  report_formats: PropTypes.collection,
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
  report_formats,
  report_format_id,
  onAddToAssetsClick,
  onActivateTab,
  onError,
  onFilterChanged,
  onFilterCreated,
  onFilterEditClick,
  onRemoveFromAssetsClick,
  onReportDownloadClick,
  onReportFormatChange,
  onTagSuccess,
}) => {
  if (!is_defined(entity)) {
    return null;
  }

  const {
    report,
  } = entity;

  const {
    applications,
    hosts,
    operatingsystems,
    results,
  } = report;

  const header = (
    <SectionHeader
      img="report.svg"
      title={_('Report:')}
      align={['space-between', 'stretch']}
    >
      <StyledLayout
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
              entities={results}
            />
          </Tab>
          <Tab>
            <TabTitle
              title={_('Hosts')}
              entities={hosts}
            />
          </Tab>
          <Tab>
            <TabTitle
              title={_('Applications')}
              entities={applications}
            />
          </Tab>
          <Tab>
            <TabTitle
              title={_('Operating Systems')}
              entities={operatingsystems}
            />
          </Tab>
        </TabList>
      </StyledLayout>
      <EntityInfo
        entity={entity}
      />
    </SectionHeader>
  );
  return (
    <Layout
      flex="column"
      align={['start', 'stretch']}
    >
      <ToolBar>
        <ToolBarIcons
          report={report}
          report_format_id={report_format_id}
          report_formats={report_formats}
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
            onResetClick={onFilterChanged}
            onUpdate={onFilterChanged}
          />
        </Layout>
      </ToolBar>

      <StyledSection
        header={header}
      >
        <Tabs active={activeTab}>
          <TabPanels>
            <TabPanel>
              <Summary
                report={report}
                onSuccess={onTagSuccess}
                onError={onError}
              />
            </TabPanel>
            <TabPanel>
              <ReportEntitiesContainer entities={results}>
                {props => (
                  <ResultsTable
                    {...props}
                  />
                )}
              </ReportEntitiesContainer>
            </TabPanel>
            <TabPanel>
              <ReportEntitiesContainer entities={hosts}>
                {props => (
                  <HostsTable
                    {...props}
                  />
                )}
              </ReportEntitiesContainer>
            </TabPanel>
            <TabPanel>
              <ReportEntitiesContainer entities={applications}>
                {props => (
                  <ApplicationsTable
                    {...props}
                  />
                )}
              </ReportEntitiesContainer>
            </TabPanel>
            <TabPanel>
              <ReportEntitiesContainer entities={operatingsystems}>
                {props => (
                  <OperatingSystemsTable
                    {...props}
                  />
                )}
              </ReportEntitiesContainer>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </StyledSection>
    </Layout>
  );
};

PageContent.propTypes = {
  activeTab: PropTypes.number,
  entity: PropTypes.model,
  filter: PropTypes.filter,
  filters: PropTypes.arrayLike,
  report_format_id: PropTypes.id,
  report_formats: PropTypes.collection,
  onActivateTab: PropTypes.func.isRequired,
  onAddToAssetsClick: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onFilterCreated: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
  onRemoveFromAssetsClick: PropTypes.func.isRequired,
  onReportDownloadClick: PropTypes.func.isRequired,
  onReportFormatChange: PropTypes.func.isRequired,
  onTagSuccess: PropTypes.func.isRequired,
};

export default PageContent;

// vim: set ts=2 sw=2 tw=80:
