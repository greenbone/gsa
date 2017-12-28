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

import Table from '../../components/table/stripedtable.js';
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

import ManualIcon from '../../components/icon/manualicon.js';

import Loading from '../../components/loading/loading.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';
import withGmp from '../../utils/withGmp.js';

import TrashActions from './trashactions.js';


const ToolBarIcons = () => (
  <ManualIcon
    page="search"
    searchTerm="trashcan"
    title={_('Help: Trashcan')}
  />
);

const EmptyTrashButton = withCapabilities(({onClick, capabilities}) => {
  if (!capabilities.mayOp('empty_trashcan')) {
    return null;
  }
  return (
    <Layout align="end">
      <Button
        onClick={onClick}
      >{_('Empty Trash')}</Button>
    </Layout>
  );
});

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

  createContentRow(type, title, count) {
    return (
      <TableRow key={type}>
        <TableData>
          <InnerLink to={type}>{_(title)}</InnerLink>
        </TableData>
        <TableData>
          {count}
        </TableData>
      </TableRow>
    );
  }

  createContentsTable(trash) {
    const render_agents = is_defined(trash.agent_list);
    const render_alerts = is_defined(trash.alert_list);
    const render_configs = is_defined(trash.config_list);
    const render_credentials = is_defined(trash.credential_list);
    const render_filters = is_defined(trash.filter_list);
    const render_groups = is_defined(trash.group_list);
    const render_notes = is_defined(trash.note_list);
    const render_overrides = is_defined(trash.override_list);
    const render_permissions = is_defined(trash.permission_list);
    const render_port_lists = is_defined(trash.port_list_list);
    const render_report_formats = is_defined(trash.report_format_list);
    const render_roles = is_defined(trash.role_list);
    const render_scanners = is_defined(trash.scanner_list);
    const render_schedules = is_defined(trash.schedule_list);
    const render_tags = is_defined(trash.tag_list);
    const render_targets = is_defined(trash.target_list);
    const render_tasks = is_defined(trash.task_list);

    return (
      <TableBody>
        {render_agents && this.createContentRow(
          'agent', 'Agents', trash.agent_list.length)}
        {render_alerts && this.createContentRow(
          'alert', 'Alerts', trash.alert_list.length)}
        {render_configs && this.createContentRow(
          'config', 'Configs', trash.config_list.length)}
        {render_credentials && this.createContentRow(
          'credential', 'Credentials', trash.credential_list.length)}
        {render_filters && this.createContentRow(
          'filter', 'Filters', trash.filter_list.length)}
        {render_groups && this.createContentRow(
          'group', 'Groups', trash.group_list.length)}
        {render_notes && this.createContentRow(
          'note', 'Notes', trash.note_list.length)}
        {render_overrides && this.createContentRow(
          'override', 'Overrides', trash.override_list.length)}
        {render_permissions && this.createContentRow(
          'permission', 'Permissions', trash.permission_list.length)}
        {render_port_lists && this.createContentRow(
          'port_list', 'Port Lists', trash.port_list_list.length)}
        {render_report_formats && this.createContentRow(
          'report_format', 'Report Formats', trash.report_format_list.length)}
        {render_roles && this.createContentRow(
          'role', 'Roles', trash.role_list.length)}
        {render_scanners && this.createContentRow(
          'scanner', 'Scanners', trash.scanner_list.length)}
        {render_schedules && this.createContentRow(
          'schedule', 'Schedules', trash.schedule_list.length)}
        {render_tags && this.createContentRow(
          'tag', 'Tags', trash.tag_list.length)}
        {render_targets && this.createContentRow(
          'target', 'Targets', trash.target_list.length)}
        {render_tasks && this.createContentRow(
          'task', 'Tasks', trash.task_list.length)}
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

        {is_defined(trash.agent_list) &&
          <span>
            <LinkTarget id="agent"/>
            <h1>{_('Agents')}</h1>
            <AgentsTable
              entities={trash.agent_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.alert_list) &&
          <span>
            <LinkTarget id="alert"/>
            <h1>{_('Alerts')}</h1>
            <AlertsTable
              entities={trash.alert_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.config_list) &&
          <span>
            <LinkTarget id="config"/>
            <h1>{_('Scan Configs')}</h1>
            <ScanConfigsTable
              entities={trash.config_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.credential_list) &&
          <span>
            <LinkTarget id="credential"/>
            <h1>{_('Credentials')}</h1>
            <CredentialsTable
              entities={trash.credential_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.filter_list) &&
          <span>
            <LinkTarget id="filter"/>
            <h1>{_('Filters')}</h1>
            <FiltersTable
              entities={trash.filter_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.group_list) &&
          <span>
            <LinkTarget id="group"/>
            <h1>{_('Groups')}</h1>
            <GroupsTable
              entities={trash.group_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.note_list) &&
          <span>
            <LinkTarget id="note"/>
            <h1>{_('Notes')}</h1>
            <NotesTable
              entities={trash.note_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.override_list) &&
          <span>
            <LinkTarget id="override"/>
            <h1>{_('Overrides')}</h1>
            <OverridesTable
              entities={trash.override_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.permission_list) &&
          <span>
            <LinkTarget id="permission"/>
            <h1>{_('Permissions')}</h1>
            <PermissionsTable
              entities={trash.permission_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.port_list_list) &&
          <span>
            <LinkTarget id="port_list"/>
            <h1>{_('Port Lists')}</h1>
            <PortListsTable
              entities={trash.port_list_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.report_format_list) &&
          <span>
            <LinkTarget id="report_format"/>
            <h1>{_('Report Formats')}</h1>
            <ReportFormatsTable
              entities={trash.report_format_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.role_list) &&
          <span>
            <LinkTarget id="role"/>
            <h1>{_('Roles')}</h1>
            <RolesTable
              entities={trash.role_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.scanner_list) &&
          <span>
            <LinkTarget id="scanner"/>
            <h1>{_('Scanners')}</h1>
            <ScannersTable
              entities={trash.scanner_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.schedule_list) &&
          <span>
            <LinkTarget id="schedule"/>
            <h1>{_('Schedules')}</h1>
            <SchedulesTable
              entities={trash.schedule_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.tag_list) &&
          <span>
            <LinkTarget id="tag"/>
            <h1>{_('Tags')}</h1>
            <TagsTable
              entities={trash.tag_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.target_list) &&
          <span>
            <LinkTarget id="target"/>
            <h1>{_('Targets')}</h1>
            <TargetsTable
              entities={trash.target_list}
              {...table_props}
            />
          </span>
        }
        {is_defined(trash.task_list) &&
          <span>
            <LinkTarget id="task"/>
            <h1>{_('Tasks')}</h1>
            <TasksTable
              entities={trash.task_list}
              {...table_props}
            />
          </span>
        }
      </Layout>
    );
  }
};

Trashcan.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(Trashcan);

// vim: set ts=2 sw=2 tw=80:
