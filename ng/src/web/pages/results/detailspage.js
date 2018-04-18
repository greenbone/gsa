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

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils';

import {MANUAL, TASK_SELECTED, RESULT_UUID} from 'gmp/models/override';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import DetailsBlock from '../../entity/block.js';
import EntityPage from '../../entity/page.js';
import Note from '../../entity/note.js';
import Override from '../../entity/override.js';
import EntityContainer from '../../entity/container.js';

import SeverityBar from '../../components/bar/severitybar.js';

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';
import InnerLink from '../../components/link/innerlink.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import InfoTable from '../../components/table/infotable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import NoteComponent from '../notes/component.js';

import OverrideComponent from '../overrides/component.js';

import ResultDetails from './details.js';

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
  const {notes, overrides, qod, host, user_tags} = entity;
  const active_notes = notes.filter(active_filter);
  const active_overrides = overrides.filter(active_filter);
  return (
    <Layout flex="column">
      <DetailsBlock
        title={_('Vulnerability')}>
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
                      to="overrides">
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
                  id={host.id}>
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

      {user_tags.length > 0 &&
        <DetailsBlock
          title={_('Tags')}
        >
          <Divider>
            {user_tags.map(tag => (
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
          title={_('Overrides')}>
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px">
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
          title={_('Notes')}>
          <Divider
            wrap
            align={['start', 'stretch']}
            width="15px">
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
    const {gmp} = this.context;

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
    const {onChanged} = this.props;
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
                sectionIcon="result.svg"
                title={_('Result')}
                toolBarIcons={ToolBarIcons}
                detailsComponent={Details}
                permissionsComponent={false}
                onNoteCreateClick={
                  result => this.openDialog(result, createnote)}
                onOverrideCreateClick={
                  result => this.openDialog(result, createoverride)}
                onResultDownloadClick={this.handleDownload}
              >
                {({
                  activeTab = 0,
                  permissionsComponent,
                  permissionsTitle,
                  tagsComponent,
                  tagsTitle,
                  onActivateTab,
                  entity,
                  ...other
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
                          {is_defined(tagsComponent) &&
                            <Tab>
                              {tagsTitle}
                            </Tab>
                          }
                          {is_defined(permissionsComponent) &&
                            <Tab>
                              {permissionsTitle}
                            </Tab>
                          }
                        </TabList>
                      </TabLayout>

                      <Tabs active={activeTab}>
                        <TabPanels>
                          <TabPanel>
                            <Details
                              entity={entity}
                            />
                          </TabPanel>
                          {is_defined(tagsComponent) &&
                            <TabPanel>
                              {tagsComponent}
                            </TabPanel>
                          }
                          {is_defined(permissionsComponent) &&
                            <TabPanel>
                              {permissionsComponent}
                            </TabPanel>
                          }
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
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

Page.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

const ResultPage = props => (
  <EntityContainer
    {...props}
    name="result"
  >
    {cprops => <Page {...cprops} />}
  </EntityContainer>
);

export default ResultPage;

// vim: set ts=2 sw=2 tw=80:
