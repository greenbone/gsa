/* Greenbone Security Assistant
*
* Authors:
* Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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
import {Col} from 'glamorous';

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils.js';

import AlertsTable from '../alerts/table.js';
import AgentsTable from '../agents/table.js';
import ScanConfigsTable from '../scanconfigs/table.js';
import CredentialsTable from '../credentials/table.js';
import FiltersTable from '../filters/table.js';
import GroupsTable from '../groups/table.js';
import NotesTable from '../notes/table.js';
import OverridesTable from '../overrides/table.js';
import PermissionsTable from '../permissions/table.js';
import PortListsTable from '../portlists/table.js';
import ReportFormatsTable from '../reportformats/table.js';
import RolesTable from '../roles/table.js';
import ScannersTable from '../scanners/table.js';
import SchedulesTable from '../schedules/table.js';
import TagsTable from '../tags/table.js';
import TargetsTable from '../targets/table.js';
import TasksTable from '../tasks/table.js';

import Table from '../../components/table/strippedtable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';
import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';

import Layout from '../../components/layout/layout.js';
import Section from '../../components/section/section.js';

import InnerLink from '../../components/link/innerlink.js';
import LinkTarget from '../../components/link/target.js';

import Button from '../../components/form/button.js';

import HelpIcon from '../../components/icon/helpicon.js';

import Loading from '../../components/loading/loading.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import TrashActions from './trashactions.js';


const ToolBarIcons = () => (
  <HelpIcon
    page="trashcan"
    title={_('Help: Trashcan')}
  />
);

const EmptyTrashButton = ({onClick}) => (
  <Layout align="right">
    <Button
      onClick={onClick}
    >{_('Empty Trash')}</Button>
  </Layout>
);

class Trashcan extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      trash: undefined,
    };

    this.createContentRow = this.createContentRow.bind(this);
    this.createContentsTable = this.createContentsTable.bind(this);
    this.getTrash = this.getTrash.bind(this);
    this.handleEmpty = this.handleEmpty.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleRestore = this.handleRestore.bind(this);
  }

  componentDidMount() {
      this.getTrash();
  }

  getTrash() {
    const {gmp} = this.props;
    const data = gmp.trashcan.get().then(response => {
      const trash = response.data;
      this.setState({trash});
    });
    return data;
  }

  handleRestore(entity) {
    const {gmp} = this.props;
    gmp.trashcan.restore(entity).then(this.getTrash);
  }

  handleDelete(entity) {
    const {gmp} = this.props;
    gmp.trashcan.delete(entity).then(this.getTrash);
  }

  handleEmpty() {
    const {gmp} = this.props;
    gmp.trashcan.empty().then(this.getTrash);
  }

  createContentRow(type, count) {
    return (
      <TableRow key={type}>
        <TableData>
          <InnerLink to={type}>{type}</InnerLink>
        </TableData>
        <TableData>
          {count}
        </TableData>
      </TableRow>
    );
  }

  createContentsTable(trash) {
    return (
      <TableBody>
        {this.createContentRow('Agents', trash.agent_list.length)}
        {this.createContentRow('Alerts', trash.alert_list.length)}
        {this.createContentRow('Configs', trash.scan_config_list.length)}
        {this.createContentRow('Credentials', trash.credential_list.length)}
        {this.createContentRow('Filters', trash.filter_list.length)}
        {this.createContentRow('Groups', trash.group_list.length)}
        {this.createContentRow('Notes', trash.note_list.length)}
        {this.createContentRow('Overrides', trash.override_list.length)}
        {this.createContentRow('Permissions', trash.permission_list.length)}
        {this.createContentRow('Port Lists', trash.port_list_list.length)}
        {this.createContentRow(
          'Report Formats', trash.report_format_list.length)}
        {this.createContentRow('Roles', trash.role_list.length)}
        {this.createContentRow('Scanners', trash.scanner_list.length)}
        {this.createContentRow('Schedules', trash.schedule_list.length)}
        {this.createContentRow('Tags', trash.tag_list.length)}
        {this.createContentRow('Targets', trash.target_list.length)}
        {this.createContentRow('Tasks', trash.task_list.length)}
      </TableBody>
    );
  };

  render() {
    const {trash} = this.state;
    if (!is_defined(trash)) {
      return <Loading/>;
    }

    const contents_table = this.createContentsTable(trash);

    const table_props = {
      links: true,
      onEntityRestore: this.handleRestore,
      onEntityDelete: this.handleDelete,
      actions: TrashActions,
      footnote: false,
      footer: false,
    };

    return (
      <Layout flex="column">
        <ToolBarIcons/>
        <Section
          img="trashcan.svg"
          title={_('Trashcan')}
        />
        <EmptyTrashButton
          onClick={this.handleEmpty}
        />

        <LinkTarget id="Contents"/>
        <h1>{_('Contents')}</h1>
        <Table>
          <colgroup>
            <Col width="50%"/>
            <Col width="50%"/>
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>
                {_('Type')}
              </TableHead>
              <TableHead>
                {_('Items')}
              </TableHead>
            </TableRow>
          </TableHeader>
          {contents_table}
        </Table>

        <LinkTarget id="Agents"/>
        <h1>{_('Agents')}</h1>
        <AgentsTable
          entities={trash.agent_list}
          {...table_props}
        />

        <LinkTarget id="Alerts"/>
        <h1>{_('Alerts')}</h1>
        <AlertsTable
          entities={trash.alert_list}
          {...table_props}
         />

        <LinkTarget id="Configs"/>
        <h1>{_('Scan Configs')}</h1>
        <ScanConfigsTable
          entities={trash.scan_config_list}
          {...table_props}
         />

        <LinkTarget id="Credentials"/>
        <h1>{_('Credentials')}</h1>
        <CredentialsTable
          entities={trash.credential_list}
          {...table_props}
         />

        <LinkTarget id="Filters"/>
        <h1>{_('Filters')}</h1>
        <FiltersTable
          entities={trash.filter_list}
          {...table_props}
         />

        <LinkTarget id="Groups"/>
        <h1>{_('Groups')}</h1>
        <GroupsTable
          entities={trash.group_list}
          {...table_props}
         />

        <LinkTarget id="Notes"/>
        <h1>{_('Notes')}</h1>
        <NotesTable
          entities={trash.note_list}
          {...table_props}
         />

        <LinkTarget id="Overrides"/>
        <h1>{_('Overrides')}</h1>
        <OverridesTable
          entities={trash.override_list}
          {...table_props}
         />

        <LinkTarget id="Permissions"/>
        <h1>{_('Permissions')}</h1>
        <PermissionsTable
          entities={trash.permission_list}
          {...table_props}
         />

        <LinkTarget id="Port Lists"/>
        <h1>{_('Port Lists')}</h1>
        <PortListsTable
          entities={trash.port_list_list}
          {...table_props}
         />

        <LinkTarget id="Report Formats"/>
        <h1>{_('Report Formats')}</h1>
        <ReportFormatsTable
          entities={trash.report_format_list}
          {...table_props}
         />

        <LinkTarget id="Roles"/>
        <h1>{_('Roles')}</h1>
        <RolesTable
          entities={trash.role_list}
          {...table_props}
         />

        <LinkTarget id="Scanners"/>
        <h1>{_('Scanners')}</h1>
        <ScannersTable
          entities={trash.scanner_list}
          {...table_props}
         />

        <LinkTarget id="Schedules"/>
        <h1>{_('Schedules')}</h1>
        <SchedulesTable
          entities={trash.schedule_list}
          {...table_props}
         />

        <LinkTarget id="Tags"/>
        <h1>{_('Tags')}</h1>
        <TagsTable
          entities={trash.tag_list}
          {...table_props}
         />

        <LinkTarget id="Targets"/>
        <h1>{_('Targets')}</h1>
        <TargetsTable
          entities={trash.target_list}
          {...table_props}
         />

        <LinkTarget id="Tasks"/>
        <h1>{_('Tasks')}</h1>
        <TasksTable
          entities={trash.task_list}
          {...table_props}
         />

      </Layout>
    );
  }
};

Trashcan.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(Trashcan);

// vim: set ts=2 sw=2 tw=80:
