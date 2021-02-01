/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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

import DeltaResultsTab from './details/deltaresultstab';
import Summary from './details/summary';
import TabTitle from './details/tabtitle';
import ToolBarIcons from './details/toolbaricons';

const Span = styled.span`
  margin-top: 2px;
`;

const PageContent = ({
  activeTab,
  entity,
  entityError,
  filter,
  filters,
  isLoading = true,
  isUpdating = false,
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

  const {results = {}, result_count = {}, timestamp, scan_run_status} = report;

  const hasReport = isDefined(entity);

  if (!hasReport && isDefined(entityError)) {
    return <ErrorMessage message={entityError.message} />;
  }

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

  const {filtered} = result_count;

  return (
    <Layout grow flex="column" align={['start', 'stretch']}>
      <ToolBar>
        <ToolBarIcons
          delta={true}
          filter={filter}
          isLoading={isLoading}
          report={report}
          reportId={reportId}
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
                <Tab>
                  <TabTitle title={_('Results')} count={filtered} />
                </Tab>
                <Tab>
                  <TabTitle title={_('User Tags')} count={userTagsCount} />
                </Tab>
              </TabList>
            </TabLayout>
            {isDefined(report) ? (
              <Tabs active={activeTab}>
                <TabPanels>
                  <TabPanel>
                    <Summary
                      filter={filter}
                      report={report}
                      reportId={reportId}
                      onError={onError}
                      onTagChanged={onTagSuccess}
                    />
                  </TabPanel>
                  <TabPanel>
                    <DeltaResultsTab
                      counts={isDefined(results.counts) ? results.counts : {}}
                      delta={true}
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

export default PageContent;

// vim: set ts=2 sw=2 tw=80:
