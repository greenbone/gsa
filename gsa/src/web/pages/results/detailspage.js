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

import {useSelector} from 'react-redux';

import _ from 'gmp/locale';

import {MANUAL, TASK_SELECTED, RESULT_ANY} from 'gmp/models/override';

import {isDefined} from 'gmp/utils/identity';

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
import withEntityContainer from 'web/entity/withEntityContainer';

import NoteComponent from 'web/pages/notes/component';

import OverrideComponent from 'web/pages/overrides/component';

import TicketComponent from 'web/pages/tickets/component';

import {loadEntity, selector} from 'web/store/entities/results';

import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {getUsername} from 'web/store/usersettings/selectors';

import compose from 'web/utils/compose';
import {generateFilename} from 'web/utils/render';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import useGmp from 'web/utils/useGmp';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import ResultDetails from './details';

let ToolBarIcons = ({
  capabilities,
  entity,
  onNoteCreateClick,
  onOverrideCreateClick,
  onResultDownloadClick,
  onTicketCreateClick,
}) => (
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
      {capabilities.mayAccess('reports') && isDefined(entity.report) && (
        <DetailsLink type="report" id={entity.report.id}>
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

ToolBarIcons.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  onNoteCreateClick: PropTypes.func.isRequired,
  onOverrideCreateClick: PropTypes.func.isRequired,
  onResultDownloadClick: PropTypes.func.isRequired,
  onTicketCreateClick: PropTypes.func.isRequired,
};

ToolBarIcons = withCapabilities(ToolBarIcons);

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

const Page = ({entity, onChanged, onDownloaded, onError, ...props}) => {
  const gmp = useGmp();
  const [, renewSession] = useUserSessionTimeout();

  const userDefaultsSelector = useSelector(getUserSettingsDefaults);
  const username = useSelector(getUsername);

  const detailsExportFileName = userDefaultsSelector.getValueByName(
    'detailsexportfilename',
  );

  const handleDownload = result => {
    return gmp.result
      .export(result)
      .then(response => {
        const {creationTime, entityType, id, modificationTime, name} = result;
        const filename = generateFilename({
          creationTime: creationTime,
          fileNameFormat: detailsExportFileName,
          id: id,
          modificationTime,
          resourceName: name,
          resourceType: entityType,
          username,
        });
        return {filename, data: response.data};
      })
      .then(onDownloaded, onError);
  };

  const openDialog = (result = {}, createfunc) => {
    const {nvt = {}, task = {}, host = {}} = result;
    createfunc({
      fixed: true,
      oid: nvt.oid,
      nvt_name: nvt.name,
      task_id: TASK_SELECTED,
      task_name: task.name,
      result_id: RESULT_ANY,
      task_uuid: task.id,
      result_uuid: result.id,
      result_name: result.name,
      severity: result.original_severity > 0 ? 0.1 : result.original_severity,
      hosts: MANUAL,
      hosts_manual: host.name,
      port: MANUAL,
      port_manual: result.port,
    });
  };

  return (
    <NoteComponent onCreated={onChanged} onInteraction={renewSession}>
      {({create: createnote}) => (
        <OverrideComponent onCreated={onChanged} onInteraction={renewSession}>
          {({create: createoverride}) => (
            <TicketComponent
              onCreated={goto_details('ticket', props)}
              onInteraction={renewSession}
            >
              {({createFromResult: createticket}) => (
                <EntityPage
                  {...props}
                  entity={entity}
                  sectionIcon={<ResultIcon size="large" />}
                  title={_('Result')}
                  toolBarIcons={ToolBarIcons}
                  onInteraction={renewSession}
                  onNoteCreateClick={result => openDialog(result, createnote)}
                  onOverrideCreateClick={result =>
                    openDialog(result, createoverride)
                  }
                  onResultDownloadClick={handleDownload}
                  onTicketCreateClick={createticket}
                >
                  {({activeTab = 0, onActivateTab}) => (
                    <Layout grow="1" flex="column">
                      <TabLayout grow="1" align={['start', 'end']}>
                        <TabList
                          active={activeTab}
                          align={['start', 'stretch']}
                          onActivateTab={onActivateTab}
                        >
                          <Tab>{_('Information')}</Tab>
                          <EntitiesTab entities={entity.userTags}>
                            {_('User Tags')}
                          </EntitiesTab>
                        </TabList>
                      </TabLayout>

                      <Tabs active={activeTab}>
                        <TabPanels>
                          <TabPanel>
                            <Details entity={entity} />
                          </TabPanel>
                          <TabPanel>
                            <EntityTags
                              entity={entity}
                              onChanged={onChanged}
                              onError={onError}
                              onInteraction={renewSession}
                            />
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </Layout>
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
