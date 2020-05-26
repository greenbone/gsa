/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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
/* eslint-disable no-shadow */
import React, {useState, useEffect, useCallback} from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import ErrorDialog from 'web/components/dialog/errordialog';

import LoadingButton from 'web/components/form/loadingbutton';

import ManualIcon from 'web/components/icon/manualicon';
import TrashcanIcon from 'web/components/icon/trashcanicon';

import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import InnerLink from 'web/components/link/innerlink';
import LinkTarget from 'web/components/link/target';

import Loading from 'web/components/loading/loading';

import Section from 'web/components/section/section';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';

import withCapabilities from 'web/utils/withCapabilities';
import useGmp from 'web/utils/useGmp';

import AlertsTable from '../alerts/table';
import ScanConfigsTable from '../scanconfigs/table';
import CredentialsTable from '../credentials/table';
import FiltersTable from '../filters/table';
import GroupsTable from '../groups/table';
import NotesTable from '../notes/table';
import OverridesTable from '../overrides/table';
import PermissionsTable from '../permissions/table';
import PoliciesTable from '../policies/table';
import PortListsTable from '../portlists/table';
import ReportFormatsTable from '../reportformats/table';
import RolesTable from '../roles/table';
import ScannersTable from '../scanners/table';
import SchedulesTable from '../schedules/table';
import TagsTable from '../tags/table';
import TargetsTable from '../targets/table';
import TasksTable from '../tasks/table';
import TicketsTable from '../tickets/table';

import TrashActions from './trashactions';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

const Col = styled.col`
  width: 50%;
`;

const ToolBarIcons = () => (
  <ManualIcon
    page="web-interface"
    anchor="using-the-trashcan"
    title={_('Help: Trashcan')}
  />
);

const EmptyTrashButton = withCapabilities(
  ({onClick, capabilities, loading}) => {
    if (!capabilities.mayOp('empty_trashcan')) {
      return null;
    }
    return (
      <Layout align="end">
        <LoadingButton onClick={onClick} isLoading={loading}>
          {_('Empty Trash')}
        </LoadingButton>
      </Layout>
    );
  },
);

const separateByUsageType = inputList => {
  const scan = [];
  const compliance = [];
  if (isDefined(inputList)) {
    for (const elem of inputList) {
      if (elem.usage_type === 'scan') {
        scan.push(elem);
      } else {
        compliance.push(elem);
      }
    }
  }
  return {scan, compliance};
};

const Trashcan = () => {
  const gmp = useGmp();
  const [, renewSessionTimeout] = useUserSessionTimeout();

  const [trash, setTrash] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const getTrash = useCallback(() => {
    const data = gmp.trashcan.get().then(
      response => {
        const trash = response.data;
        setTrash(trash);
      },
      error => {
        setError(error);
      },
    );
    return data;
  }, [gmp.trashcan]);

  useEffect(() => {
    getTrash();
  }, [getTrash]);

  const handleInteraction = useCallback(() => {
    renewSessionTimeout();
  }, [renewSessionTimeout]);

  const handleRestore = useCallback(
    entity => {
      handleInteraction();

      return gmp.trashcan
        .restore(entity)
        .then(getTrash)
        .catch(error => {
          setError(error);
        });
    },
    [getTrash, gmp.trashcan, handleInteraction],
  );

  const handleDelete = useCallback(
    entity => {
      handleInteraction();

      return gmp.trashcan
        .delete(entity)
        .then(getTrash)
        .catch(error => {
          setError(error);
        });
    },
    [getTrash, gmp.trashcan, handleInteraction],
  );

  const handleEmpty = useCallback(() => {
    handleInteraction();

    setLoading(true);

    gmp.trashcan
      .empty()
      .then(() => {
        getTrash();
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, [getTrash, gmp.trashcan, handleInteraction]);

  const handleErrorClose = useCallback(() => {
    setError();
  }, []);

  const createContentRow = useCallback((type, title, count) => {
    return (
      <TableRow key={type}>
        <TableData>
          <InnerLink to={type}>{title}</InnerLink>
        </TableData>
        <TableData>{count}</TableData>
      </TableRow>
    );
  }, []);

  const createContentsTable = useCallback(
    trash => {
      const render_alerts = isDefined(trash.alert_list);
      const render_credentials = isDefined(trash.credential_list);
      const render_filters = isDefined(trash.filter_list);
      const render_groups = isDefined(trash.group_list);
      const render_notes = isDefined(trash.note_list);
      const render_overrides = isDefined(trash.override_list);
      const render_permissions = isDefined(trash.permission_list);
      const render_port_lists = isDefined(trash.port_list_list);
      const render_report_formats = isDefined(trash.report_format_list);
      const render_roles = isDefined(trash.role_list);
      const render_scanners = isDefined(trash.scanner_list);
      const render_schedules = isDefined(trash.schedule_list);
      const render_tags = isDefined(trash.tag_list);
      const render_targets = isDefined(trash.target_list);
      const render_tickets = isDefined(trash.ticket_list);

      const {scan: tasks, compliance: audits} = separateByUsageType(
        trash.task_list,
      );
      const renderTasks = isDefined(trash.task_list);
      const renderAudits = isDefined(trash.task_list);

      const {scan: configs, compliance: policies} = separateByUsageType(
        trash.config_list,
      );
      const renderConfigs = isDefined(trash.config_list);
      const renderPolicies = isDefined(trash.config_list);

      return (
        <TableBody>
          {render_alerts &&
            createContentRow('alert', _('Alerts'), trash.alert_list.length)}
          {renderAudits &&
            createContentRow('audit', _('Audits'), audits.length)}
          {render_credentials &&
            createContentRow(
              'credential',
              _('Credentials'),
              trash.credential_list.length,
            )}
          {render_filters &&
            createContentRow('filter', _('Filters'), trash.filter_list.length)}
          {render_groups &&
            createContentRow('group', _('Groups'), trash.group_list.length)}
          {render_notes &&
            createContentRow('note', _('Notes'), trash.note_list.length)}
          {render_overrides &&
            createContentRow(
              'override',
              _('Overrides'),
              trash.override_list.length,
            )}
          {render_permissions &&
            createContentRow(
              'permission',
              _('Permissions'),
              trash.permission_list.length,
            )}
          {renderPolicies &&
            createContentRow('policy', _('Policies'), policies.length)}
          {render_port_lists &&
            createContentRow(
              'port_list',
              _('Port Lists'),
              trash.port_list_list.length,
            )}
          {render_report_formats &&
            createContentRow(
              'report_format',
              _('Report Formats'),
              trash.report_format_list.length,
            )}
          {render_roles &&
            createContentRow('role', _('Roles'), trash.role_list.length)}
          {renderConfigs &&
            createContentRow('config', _('Scan Configs'), configs.length)}
          {render_scanners &&
            createContentRow(
              'scanner',
              _('Scanners'),
              trash.scanner_list.length,
            )}
          {render_schedules &&
            createContentRow(
              'schedule',
              _('Schedules'),
              trash.schedule_list.length,
            )}
          {render_tags &&
            createContentRow('tag', _('Tags'), trash.tag_list.length)}
          {render_targets &&
            createContentRow('target', _('Targets'), trash.target_list.length)}
          {renderTasks && createContentRow('task', _('Tasks'), tasks.length)}
          {render_tickets &&
            createContentRow('ticket', _('Tickets'), trash.ticket_list.length)}
        </TableBody>
      );
    },
    [createContentRow],
  );

  if (!isDefined(trash) && !isDefined(error)) {
    return <Loading />;
  } else if (!isDefined(trash) && isDefined(error)) {
    setTrash({});
  }

  const {scan: tasks, compliance: audits} = separateByUsageType(
    trash.task_list,
  );
  const {scan: configs, compliance: policies} = separateByUsageType(
    trash.config_list,
  );

  const contents_table = createContentsTable(trash);

  const table_props = {
    links: false,
    onEntityRestore: handleRestore,
    onEntityDelete: handleDelete,
    actionsComponent: TrashActions,
    footnote: false,
    footer: false,
  };

  return (
    <React.Fragment>
      <PageTitle title={_('Trashcan')} />
      <Layout flex="column">
        <ToolBarIcons />
        {error && (
          <ErrorDialog
            text={error.message}
            title={_('Error')}
            onClose={handleErrorClose}
          />
        )}
        <Section img={<TrashcanIcon size="large" />} title={_('Trashcan')} />
        <EmptyTrashButton onClick={handleEmpty} loading={loading} />
        <LinkTarget id="Contents" />
        <h1>{_('Contents')}</h1>
        <Table>
          <colgroup>
            <Col />
            <Col />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>{_('Type')}</TableHead>
              <TableHead>{_('Items')}</TableHead>
            </TableRow>
          </TableHeader>
          {contents_table}
        </Table>

        {isDefined(trash.alert_list) && (
          <span>
            <LinkTarget id="alert" />
            <h1>{_('Alerts')}</h1>
            <AlertsTable entities={trash.alert_list} {...table_props} />
          </span>
        )}
        {isDefined(trash.task_list) && (
          <span>
            <LinkTarget id="audit" />
            <h1>{_('Audits')}</h1>
            <TasksTable entities={audits} {...table_props} />
          </span>
        )}
        {isDefined(trash.credential_list) && (
          <span>
            <LinkTarget id="credential" />
            <h1>{_('Credentials')}</h1>
            <CredentialsTable
              entities={trash.credential_list}
              {...table_props}
            />
          </span>
        )}
        {isDefined(trash.filter_list) && (
          <span>
            <LinkTarget id="filter" />
            <h1>{_('Filters')}</h1>
            <FiltersTable entities={trash.filter_list} {...table_props} />
          </span>
        )}
        {isDefined(trash.group_list) && (
          <span>
            <LinkTarget id="group" />
            <h1>{_('Groups')}</h1>
            <GroupsTable entities={trash.group_list} {...table_props} />
          </span>
        )}
        {isDefined(trash.note_list) && (
          <span>
            <LinkTarget id="note" />
            <h1>{_('Notes')}</h1>
            <NotesTable entities={trash.note_list} {...table_props} />
          </span>
        )}
        {isDefined(trash.override_list) && (
          <span>
            <LinkTarget id="override" />
            <h1>{_('Overrides')}</h1>
            <OverridesTable entities={trash.override_list} {...table_props} />
          </span>
        )}
        {isDefined(trash.permission_list) && (
          <span>
            <LinkTarget id="permission" />
            <h1>{_('Permissions')}</h1>
            <PermissionsTable
              entities={trash.permission_list}
              {...table_props}
            />
          </span>
        )}
        {isDefined(trash.config_list) > 0 && (
          <span>
            <LinkTarget id="policy" />
            <h1>{_('Policies')}</h1>
            <PoliciesTable entities={policies} {...table_props} />
          </span>
        )}
        {isDefined(trash.port_list_list) && (
          <span>
            <LinkTarget id="port_list" />
            <h1>{_('Port Lists')}</h1>
            <PortListsTable entities={trash.port_list_list} {...table_props} />
          </span>
        )}
        {isDefined(trash.report_format_list) && (
          <span>
            <LinkTarget id="report_format" />
            <h1>{_('Report Formats')}</h1>
            <ReportFormatsTable
              entities={trash.report_format_list}
              {...table_props}
            />
          </span>
        )}
        {isDefined(trash.role_list) && (
          <span>
            <LinkTarget id="role" />
            <h1>{_('Roles')}</h1>
            <RolesTable entities={trash.role_list} {...table_props} />
          </span>
        )}
        {isDefined(trash.config_list) && (
          <span>
            <LinkTarget id="config" />
            <h1>{_('Scan Configs')}</h1>
            <ScanConfigsTable entities={configs} {...table_props} />
          </span>
        )}
        {isDefined(trash.scanner_list) && (
          <span>
            <LinkTarget id="scanner" />
            <h1>{_('Scanners')}</h1>
            <ScannersTable entities={trash.scanner_list} {...table_props} />
          </span>
        )}
        {isDefined(trash.schedule_list) && (
          <span>
            <LinkTarget id="schedule" />
            <h1>{_('Schedules')}</h1>
            <SchedulesTable entities={trash.schedule_list} {...table_props} />
          </span>
        )}
        {isDefined(trash.tag_list) && (
          <span>
            <LinkTarget id="tag" />
            <h1>{_('Tags')}</h1>
            <TagsTable entities={trash.tag_list} {...table_props} />
          </span>
        )}
        {isDefined(trash.target_list) && (
          <span>
            <LinkTarget id="target" />
            <h1>{_('Targets')}</h1>
            <TargetsTable entities={trash.target_list} {...table_props} />
          </span>
        )}
        {isDefined(trash.task_list) > 0 && (
          <span>
            <LinkTarget id="task" />
            <h1>{_('Tasks')}</h1>
            <TasksTable entities={tasks} {...table_props} />
          </span>
        )}
        {isDefined(trash.ticket_list) && (
          <span>
            <LinkTarget id="ticket" />
            <h1>{_('Tickets')}</h1>
            <TicketsTable entities={trash.ticket_list} {...table_props} />
          </span>
        )}
      </Layout>
    </React.Fragment>
  );
};

export default Trashcan;

// vim: set ts=2 sw=2 tw=80:
