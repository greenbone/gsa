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
import React, {useEffect} from 'react';
import {useHistory, useParams} from 'react-router-dom';

import {useSelector} from 'react-redux';

import _ from 'gmp/locale';

import {MANUAL, TASK_SELECTED, RESULT_ANY} from 'gmp/models/override';

import {hasValue, isDefined} from 'gmp/utils/identity';

import Badge from 'web/components/badge/badge';

import SeverityBar from 'web/components/bar/severitybar';

import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import NewNoteIcon from 'web/components/icon/newnoteicon';
import NewOverrideIcon from 'web/components/icon/newoverrideicon';
import NewTicketIcon from 'web/components/icon/newticketicon';
import OverrideIcon from 'web/components/icon/overrideicon';
import ReportIcon from 'web/components/icon/reporticon';
import ResultIcon from 'web/components/icon/resulticon';
import TaskIcon from 'web/components/icon/taskicon';
import TicketIcon from 'web/components/icon/ticketicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import DetailsLink from 'web/components/link/detailslink';
import InnerLink from 'web/components/link/innerlink';
import Link from 'web/components/link/link';

import useReload from 'web/components/loading/useReload';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import DetailsBlock from 'web/entity/block';
import {goto_details} from 'web/entity/component';
import EntityPage, {Col} from 'web/entity/page';
import Note from 'web/entity/note';
import Override from 'web/entity/override';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import useEntityReloadInterval from 'web/entity/useEntityReloadInterval';
import withEntityContainer from 'web/entity/withEntityContainer';

import {useGetResult} from 'web/graphql/results';

import NoteComponent from 'web/pages/notes/component';
import OverrideComponent from 'web/pages/overrides/component';
import TicketComponent from 'web/pages/tickets/component';

import {loadEntity, selector} from 'web/store/entities/results';

import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';

import compose from 'web/utils/compose';
import {generateFilename} from 'web/utils/render';
import PropTypes from 'web/utils/proptypes';
import useCapabilities from 'web/utils/useCapabilities';
import useGmp from 'web/utils/useGmp';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import ResultDetails from './details';

export const ToolBarIcons = ({
  entity,
  onNoteCreateClick,
  onOverrideCreateClick,
  onResultDownloadClick,
  onTicketCreateClick,
}) => {
  const capabilities = useCapabilities();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="reports"
          anchor="displaying-all-existing-results"
          title={_('Help: Results')}
        />
        <ListIcon title={_('Results List')} page="results" />
        <ExportIcon
          value={entity}
          title={_('Export Result as XML')}
          onClick={onResultDownloadClick}
        />
      </IconDivider>
      <IconDivider>
        {capabilities.mayCreate('note') && (
          <NewNoteIcon
            title={_('Add new Note')}
            value={entity}
            onClick={onNoteCreateClick}
          />
        )}
        {capabilities.mayCreate('override') && (
          <NewOverrideIcon
            title={_('Add new Override')}
            value={entity}
            onClick={onOverrideCreateClick}
          />
        )}
        {capabilities.mayCreate('ticket') && (
          <NewTicketIcon
            title={_('Create new Ticket')}
            value={entity}
            onClick={onTicketCreateClick}
          />
        )}
      </IconDivider>
      <IconDivider>
        {capabilities.mayAccess('tasks') && isDefined(entity.task) && (
          <DetailsLink type="task" id={entity.task.id}>
            <TaskIcon title={_('Corresponding Task ({{name}})', entity.task)} />
          </DetailsLink>
        )}
        {capabilities.mayAccess('reports') && isDefined(entity.reportId) && (
          <DetailsLink type="report" id={entity.reportId}>
            <ReportIcon title={_('Corresponding Report')} />
          </DetailsLink>
        )}
        {capabilities.mayAccess('tickets') && entity.tickets.length > 0 && (
          <Link
            to="tickets"
            filter={'result_id=' + entity.id}
            title={_('Corresponding Tickets')}
          >
            <Badge content={entity.tickets.length}>
              <TicketIcon />
            </Badge>
          </Link>
        )}
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onNoteCreateClick: PropTypes.func.isRequired,
  onOverrideCreateClick: PropTypes.func.isRequired,
  onResultDownloadClick: PropTypes.func.isRequired,
  onTicketCreateClick: PropTypes.func.isRequired,
};

const active_filter = entity => entity.isActive();

const Details = ({entity, ...props}) => {
  const {notes, overrides, qod, host, userTags} = entity;
  const active_notes = notes.filter(active_filter);
  const active_overrides = overrides.filter(active_filter);
  return (
    <React.Fragment>
      <PageTitle title={_('Result: {{name}}', {name: entity.name})} />
      <Layout flex="column">
        <DetailsBlock title={_('Vulnerability')}>
          <Layout flex="column">
            <InfoTable>
              <colgroup>
                <Col width="10%" />
                <Col width="90%" />
              </colgroup>
              <TableBody>
                <TableRow>
                  <TableData>{_('Name')}</TableData>
                  <TableData>{entity.name}</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Severity')}</TableData>
                  <TableData align={['center', 'start']}>
                    <Divider>
                      <SeverityBar severity={entity.severity} />
                      {active_overrides.length > 0 && (
                        <InnerLink to="overrides">
                          <OverrideIcon
                            title={_('There are overrides for this result')}
                          />
                        </InnerLink>
                      )}
                    </Divider>
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('QoD')}</TableData>
                  <TableData>{qod.value} %</TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Host')}</TableData>
                  <TableData>
                    <span>
                      {isDefined(host.id) ? (
                        <DetailsLink type="host" id={host.id}>
                          {host.name}
                        </DetailsLink>
                      ) : (
                        host.name
                      )}
                    </span>
                  </TableData>
                </TableRow>
                <TableRow>
                  <TableData>{_('Location')}</TableData>
                  <TableData>{entity.port}</TableData>
                </TableRow>
              </TableBody>
            </InfoTable>
          </Layout>
        </DetailsBlock>

        {userTags.length > 0 && (
          <DetailsBlock title={_('Tags')}>
            <Divider>
              {userTags.map(tag => {
                const valueString = isDefined(tag.value) ? '' : '=' + tag.value;
                return (
                  <DetailsLink key={tag.id} id={tag.id} type="tag">
                    {tag.name + valueString}
                  </DetailsLink>
                );
              })}
            </Divider>
          </DetailsBlock>
        )}

        <ResultDetails entity={entity} {...props} />

        {active_overrides.length > 0 && (
          <DetailsBlock id="overrides" title={_('Overrides')}>
            <Divider wrap align={['start', 'stretch']} width="15px">
              {active_overrides.map(override => (
                <Override key={override.id} override={override} />
              ))}
            </Divider>
          </DetailsBlock>
        )}

        {active_notes.length > 0 && (
          <DetailsBlock id="notes" title={_('Notes')}>
            <Divider wrap align={['start', 'stretch']} width="15px">
              {active_notes.map(note => (
                <Note key={note.id} note={note} />
              ))}
            </Divider>
          </DetailsBlock>
        )}
      </Layout>
    </React.Fragment>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({onDownloaded}) => {
  // Page methods
  const {id} = useParams();
  const history = useHistory();
  const [, renewSessionTimeout] = useUserSessionTimeout();

  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();
  const gmp = useGmp();

  const userDefaultsSelector = useSelector(getUserSettingsDefaults);
  const username = useSelector(getUsername);

  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );

  // Load result related entities
  const {
    result,
    refetch: refetchResult,
    loading,
    error: entityError,
  } = useGetResult(id);

  // Timeout and reload
  const timeoutFunc = useEntityReloadInterval(result);

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetchResult,
    timeoutFunc,
  );

  useEffect(() => {
    // start reloading if result is available and no timer is running yet
    if (hasValue(result) && !hasRunningTimer) {
      startReload();
    }
  }, [result, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);

  const handleResultDownload = exportedResult => {
    return gmp.result
      .export(exportedResult)
      .then(response => {
        const {
          creationTime,
          entityType,
          modificationTime,
          name,
        } = exportedResult;
        const filename = generateFilename({
          creationTime: creationTime,
          fileNameFormat: detailsExportFileName,
          id: exportedResult.id,
          modificationTime,
          resourceName: name,
          resourceType: entityType,
          username,
        });
        return {filename, data: response.data};
      })
      .then(onDownloaded, showError);
  };

  const openDialog = (resultEntity = {}, createfunc) => {
    const {nvt = {}, task = {}, host = {}} = resultEntity;
    createfunc({
      fixed: true,
      nvtId: nvt.id,
      nvtName: nvt.name,
      taskId: TASK_SELECTED,
      taskName: task.name,
      resultId: RESULT_ANY,
      taskUuid: task.id,
      resultUuid: resultEntity.id,
      resultName: resultEntity.name,
      severity:
        resultEntity.originalSeverity > 0 ? 0.1 : resultEntity.originalSeverity,
      hosts: MANUAL,
      hostsManual: host.name,
      port: MANUAL,
      portManual: resultEntity.port,
    });
  };

  return (
    <NoteComponent
      onCreated={refetchResult}
      onInteraction={renewSessionTimeout}
    >
      {({create: createnote}) => (
        <OverrideComponent
          onCreated={refetchResult}
          onInteraction={renewSessionTimeout}
        >
          {({create: createoverride}) => (
            <TicketComponent
              onCreated={goto_details('ticket', {history})}
              onInteraction={renewSessionTimeout}
            >
              {({createFromResult: createticket}) => (
                <EntityPage
                  entity={result}
                  entityError={entityError}
                  entityType={'result'}
                  isLoading={loading}
                  sectionIcon={<ResultIcon size="large" />}
                  title={_('Result')}
                  toolBarIcons={ToolBarIcons}
                  onInteraction={renewSessionTimeout}
                  onNoteCreateClick={dialogResult =>
                    openDialog(dialogResult, createnote)
                  }
                  onOverrideCreateClick={dialogResult =>
                    openDialog(dialogResult, createoverride)
                  }
                  onResultDownloadClick={handleResultDownload}
                  onTicketCreateClick={createticket}
                >
                  {({activeTab = 0, onActivateTab}) => (
                    <React.Fragment>
                      <Layout grow="1" flex="column">
                        <TabLayout grow="1" align={['start', 'end']}>
                          <TabList
                            active={activeTab}
                            align={['start', 'stretch']}
                            onActivateTab={onActivateTab}
                          >
                            <Tab>{_('Information')}</Tab>
                            <EntitiesTab entities={result.userTags}>
                              {_('User Tags')}
                            </EntitiesTab>
                          </TabList>
                        </TabLayout>

                        <Tabs active={activeTab}>
                          <TabPanels>
                            <TabPanel>
                              <Details entity={result} />
                            </TabPanel>
                            <TabPanel>
                              <EntityTags
                                entity={result}
                                onChanged={() => refetchResult()}
                                onError={showError}
                                onInteraction={renewSessionTimeout}
                              />
                            </TabPanel>
                          </TabPanels>
                        </Tabs>
                      </Layout>
                      <DialogNotification
                        {...notificationDialogState}
                        onCloseClick={closeNotificationDialog}
                      />
                    </React.Fragment>
                  )}
                </EntityPage>
              )}
            </TicketComponent>
          )}
        </OverrideComponent>
      )}
    </NoteComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default compose(
  withEntityContainer('result', {
    entitySelector: selector,
    load: loadEntity,
  }),
)(Page);

// vim: set ts=2 sw=2 tw=80:
