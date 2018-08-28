/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import _ from 'gmp/locale';

import {MANUAL, TASK_SELECTED, RESULT_UUID} from 'gmp/models/override';

import SeverityBar from 'web/components/bar/severitybar';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import Icon from 'web/components/icon/icon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';
import InnerLink from 'web/components/link/innerlink';

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
import EntityPage from 'web/entity/page';
import Note from 'web/entity/note';
import Override from 'web/entity/override';
import EntityContainer from 'web/entity/container';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import withGmp from 'web/utils/withGmp';

import NoteComponent from '../notes/component';

import OverrideComponent from '../overrides/component';

import ResultDetails from './details';

let ToolBarIcons = ({
  capabilities,
  entity,
  onNoteCreateClick,
  onOverrideCreateClick,
  onResultDownloadClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="results"
        title={_('Help: Results')}
      />
      <ListIcon
        title={_('Results List')}
        page="results"
      />
      <ExportIcon
        value={entity}
        title={_('Export Result as XML')}
        onClick={onResultDownloadClick}
      />
    </IconDivider>
    <IconDivider>
      {capabilities.mayCreate('note') &&
        <Icon
          img="new_note.svg"
          title={_('Add new Note')}
          value={entity}
          onClick={onNoteCreateClick}
        />
      }
      {capabilities.mayCreate('override') &&
        <Icon
          img="new_override.svg"
          title={_('Add new Override')}
          value={entity}
          onClick={onOverrideCreateClick}
        />
      }
    </IconDivider>
    <IconDivider>
      {capabilities.mayAccess('tasks') &&
        <DetailsLink
          type="task"
          id={entity.task.id}
        >
          <Icon
            img="task.svg"
            title={_('Corresponding Task ({{name}})', entity.task)}
          />
        </DetailsLink>
      }
      {capabilities.mayAccess('reports') &&
        <DetailsLink
          type="report"
          id={entity.report.id}
        >
          <Icon
            img="report.svg"
            title={_('Corresponding Report')}
          />
        </DetailsLink>
      }
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  entity: PropTypes.model.isRequired,
  onNoteCreateClick: PropTypes.func.isRequired,
  onOverrideCreateClick: PropTypes.func.isRequired,
  onResultDownloadClick: PropTypes.func.isRequired,
};

ToolBarIcons = withCapabilities(ToolBarIcons);

const active_filter = entity => entity.isActive();

const Details = ({
  entity,
  ...props
}) => {
  const {notes, overrides, qod, host, userTags} = entity;
  const active_notes = notes.filter(active_filter);
  const active_overrides = overrides.filter(active_filter);
  return (
    <Layout flex="column">
      <DetailsBlock
        title={_('Vulnerability')}
      >
        <InfoTable>
          <TableBody>
            <TableRow>
              <TableData>
                {_('Name')}
              </TableData>
              <TableData>
                {entity.name}
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Severity')}
              </TableData>
              <TableData flex align={['start', 'center']}>
                <Divider>
                  <SeverityBar severity={entity.severity}/>
                  {overrides.active &&
                    <InnerLink
                      to="overrides"
                    >
                      <Icon
                        img="override.svg"
                        title={_('Overrides are applied')}
                      />
                    </InnerLink>
                  }
                </Divider>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('QoD')}
              </TableData>
              <TableData>
                {qod.value} %
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Host')}
              </TableData>
              <TableData>
                <DetailsLink
                  type="host"
                  id={host.id}
                >
                  {host.name}
                </DetailsLink>
              </TableData>
            </TableRow>
            <TableRow>
              <TableData>
                {_('Location')}
              </TableData>
              <TableData>
                {entity.port}
              </TableData>
            </TableRow>
          </TableBody>
        </InfoTable>
      </DetailsBlock>

      {userTags.length > 0 &&
        <DetailsBlock
          title={_('Tags')}
        >
          <Divider>
            {userTags.map(tag => (
              <DetailsLink
                key={tag.id}
                id={tag.id}
                type="tag"
              >
                {tag.name + '=' + tag.value}
              </DetailsLink>
            ))}
          </Divider>
        </DetailsBlock>
      }

      <ResultDetails
        entity={entity}
        {...props}
      />

      {active_overrides.length > 0 &&
        <DetailsBlock
          id="overrides"
          title={_('Overrides')}
        >
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px"
          >
            {
              active_overrides.map(override => (
                <Override
                  key={override.id}
                  override={override}
                />
              ))
            }
          </Divider>
        </DetailsBlock>
      }

      {active_notes.length > 0 &&
        <DetailsBlock
          id="notes"
          title={_('Notes')}
        >
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px"
          >
            {
              active_notes.map(note => (
                <Note
                  key={note.id}
                  note={note}
                />
              ))
            }
          </Divider>
        </DetailsBlock>
      }
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

class Page extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleDownload = this.handleDownload.bind(this);

    this.openDialog = this.openDialog.bind(this);
  }

  handleDownload(result) {
    const {gmp} = this.props;

    const {onError, onDownloaded} = this.props;
    return gmp.result.export(result).then(response => {
      const filename = 'result-' + result.id + '.xml';
      return {filename, data: response.data};
    }).then(onDownloaded, onError);
  }

  openDialog(result = {}, createfunc) {
    const {nvt = {}, task = {}, host = {}} = result;
    createfunc({
      fixed: true,
      oid: nvt.oid,
      nvt_name: nvt.name,
      task_id: TASK_SELECTED,
      task_name: task.name,
      result_id: RESULT_UUID,
      task_uuid: task.id,
      result_uuid: result.id,
      result_name: result.name,
      severity: result.original_severity > 0 ? 0.1 : result.original_severity,
      hosts: MANUAL,
      hosts_manual: host.name,
      port: MANUAL,
      port_manual: result.port,
    });
  }

  render() {
    const {
      entity,
      onChanged,
      onTagAddClick,
      onTagCreateClick,
      onTagDeleteClick,
      onTagDisableClick,
      onTagEditClick,
      onTagEnableClick,
      onTagRemoveClick,
    } = this.props;
    return (
      <NoteComponent
        onCreated={onChanged}
      >
        {({create: createnote}) => (
          <OverrideComponent
            onCreated={onChanged}
          >
            {({create: createoverride}) => (
              <EntityPage
                {...this.props}
                entity={entity}
                sectionIcon="result.svg"
                title={_('Result')}
                toolBarIcons={ToolBarIcons}
                onNoteCreateClick={
                  result => this.openDialog(result, createnote)}
                onOverrideCreateClick={
                  result => this.openDialog(result, createoverride)}
                onResultDownloadClick={this.handleDownload}
              >
                {({
                  activeTab = 0,
                  onActivateTab,
                }) => {
                  return (
                    <Layout grow="1" flex="column">
                      <TabLayout
                        grow="1"
                        align={['start', 'end']}
                      >
                        <TabList
                          active={activeTab}
                          align={['start', 'stretch']}
                          onActivateTab={onActivateTab}
                        >
                          <Tab>
                            {_('Information')}
                          </Tab>
                          <EntitiesTab entities={entity.userTags}>
                            {_('User Tags')}
                          </EntitiesTab>
                        </TabList>
                      </TabLayout>

                      <Tabs active={activeTab}>
                        <TabPanels>
                          <TabPanel>
                            <Details
                              entity={entity}
                            />
                          </TabPanel>
                          <TabPanel>
                            <EntityTags
                              entity={entity}
                              onTagAddClick={onTagAddClick}
                              onTagDeleteClick={onTagDeleteClick}
                              onTagDisableClick={onTagDisableClick}
                              onTagEditClick={onTagEditClick}
                              onTagEnableClick={onTagEnableClick}
                              onTagCreateClick={onTagCreateClick}
                              onTagRemoveClick={onTagRemoveClick}
                            />
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </Layout>
                  );
                }}
              </EntityPage>
            )}
          </OverrideComponent>
        )}
      </NoteComponent>
    );
  }
}

Page.propTypes = {
  entity: PropTypes.model,
  gmp: PropTypes.gmp.isRequired,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onTagAddClick: PropTypes.func.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagEnableClick: PropTypes.func.isRequired,
  onTagRemoveClick: PropTypes.func.isRequired,
};

Page = withGmp(Page);

const ResultPage = props => (
  <EntityContainer
    {...props}
    name="result"
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default ResultPage;

// vim: set ts=2 sw=2 tw=80:
