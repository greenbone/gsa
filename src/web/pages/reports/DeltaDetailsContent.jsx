/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {TASK_STATUS} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import StatusBar from 'web/components/bar/StatusBar';
import ToolBar from 'web/components/bar/Toolbar';
import DateTime from 'web/components/date/DateTime';
import ErrorMessage from 'web/components/error/ErrorMessage';
import {ReportIcon} from 'web/components/icon';
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
import TabsContainer from 'web/components/tab/TabsContainer';
import EntityInfo from 'web/entity/EntityInfo';
import EntityTags from 'web/entity/Tags';
import useTranslation from 'web/hooks/useTranslation';
import DeltaResultsTab from 'web/pages/reports/details/DeltaResultsTab';
import Summary from 'web/pages/reports/details/Summary';
import TabTitle from 'web/pages/reports/details/TabTitle';
import ToolBarIcons from 'web/pages/reports/details/ToolbarIcons';
import PropTypes from 'web/utils/PropTypes';
const Span = styled.span`
  margin-top: 2px;
`;

const PageContent = ({
  audit = false,
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
  onAddToAssetsClick,
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
  onSortChange,
  onTagSuccess,
  onTargetEditClick,
}) => {
  const [_] = useTranslation();
  const {report = {}} = entity || {};

  const {userTags = {}} = report;
  const userTagsCount = userTags.length;

  const {
    results = {},
    complianceCounts = {},
    result_count = {},
    timestamp,
    scan_run_status,
  } = report;

  const hasReport = isDefined(entity);

  if (!hasReport && isDefined(entityError)) {
    return <ErrorMessage message={entityError.message} />;
  }

  const isContainer = isDefined(task) && task.isContainer();
  const status = isContainer ? TASK_STATUS.container : scan_run_status;
  const progress = isDefined(task) ? task.progress : 0;

  const header_title = (
    <Divider>
      {audit ? <span>{_('Audit Report:')}</span> : <span>{_('Report:')}</span>}
      {isLoading ? (
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

  const {filtered} = audit ? complianceCounts : result_count;

  return (
    <Layout grow align={['start', 'stretch']} flex="column">
      <ToolBar>
        <ToolBarIcons
          audit={audit}
          delta={true}
          filter={filter}
          isLoading={isLoading}
          report={report}
          reportId={reportId}
          showError={showError}
          showErrorMessage={showErrorMessage}
          showSuccessMessage={showSuccessMessage}
          task={task}
          onAddToAssetsClick={onAddToAssetsClick}
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
            onRemoveClick={onFilterRemoveClick}
            onResetClick={onFilterResetClick}
            onUpdate={onFilterChanged}
          />
        </Layout>
      </ToolBar>

      <Section header={header}>
        {isLoading ? (
          <Loading />
        ) : (
          <TabsContainer flex="column" grow="1">
            <TabLayout align={['start', 'end']} grow="1">
              <TabList align={['start', 'stretch']}>
                <Tab>{_('Information')}</Tab>
                <Tab>
                  <TabTitle count={filtered} title={_('Results')} />
                </Tab>
                <Tab>
                  <TabTitle count={userTagsCount} title={_('User Tags')} />
                </Tab>
              </TabList>
            </TabLayout>
            {isDefined(report) ? (
              <Tabs>
                <TabPanels>
                  <TabPanel>
                    <Summary
                      audit={audit}
                      filter={filter}
                      report={report}
                      reportId={reportId}
                      onError={onError}
                      onTagChanged={onTagSuccess}
                    />
                  </TabPanel>
                  <TabPanel>
                    <DeltaResultsTab
                      audit={audit}
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
                      onFilterEditClick={onFilterEditClick}
                      onFilterRemoveClick={onFilterRemoveClick}
                      onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
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
                    />
                  </TabPanel>
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

PageContent.propTypes = {
  audit: PropTypes.bool,
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
  onAddToAssetsClick: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterAddLogLevelClick: PropTypes.func,
  onFilterChanged: PropTypes.func.isRequired,
  onFilterCreated: PropTypes.func.isRequired,
  onFilterDecreaseMinQoDClick: PropTypes.func.isRequired,
  onFilterEditClick: PropTypes.func.isRequired,
  onFilterRemoveClick: PropTypes.func.isRequired,
  onFilterRemoveSeverityClick: PropTypes.func,
  onFilterResetClick: PropTypes.func.isRequired,
  onRemoveFromAssetsClick: PropTypes.func.isRequired,
  onReportDownloadClick: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired,
  onTagSuccess: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
};

export default PageContent;
