/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useEffect, useState} from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import Button from 'web/components/form/button';

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

import PropTypes from 'web/utils/proptypes';

import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

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
import ReportConfigsTable from '../reportconfigs/table';
import ReportFormatsTable from '../reportformats/table';
import RolesTable from '../roles/table';
import ScannersTable from '../scanners/table';
import SchedulesTable from '../schedules/table';
import TagsTable from '../tags/table';
import TargetsTable from '../targets/table';
import TasksTable from '../tasks/table';
import TicketsTable from '../tickets/table';

import TrashActions from './trashactions';
import useGmp from 'web/hooks/useGmp';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import DialogNotification from 'web/components/notification/dialognotification';
import ConfirmationDialog from 'web/components/dialog/confirmationdialog';

const Col = styled.col`
  width: 50%;
`;

const ToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <ManualIcon
      page="web-interface"
      anchor="using-the-trashcan"
      title={_('Help: Trashcan')}
    />
  );
};

const EmptyTrashButton = ({onClick}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  if (!capabilities.mayOp('empty_trashcan')) {
    return null;
  }
  return (
    <Layout align="end">
      <Button onClick={onClick}>{_('Empty Trash')}</Button>
    </Layout>
  );
};

EmptyTrashButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

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

const TrashCanTableRow = ({type, title, count}) => {
  return (
    <TableRow key={type}>
      <TableData>
        <InnerLink to={type}>{title}</InnerLink>
      </TableData>
      <TableData>{count}</TableData>
    </TableRow>
  );
};

TrashCanTableRow.propTypes = {
  count: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

const TrashCanContentsTable = ({trash}) => {
  const [_] = useTranslation();

  const render_alerts = isDefined(trash.alert_list);
  const render_credentials = isDefined(trash.credential_list);
  const render_filters = isDefined(trash.filter_list);
  const render_groups = isDefined(trash.group_list);
  const render_notes = isDefined(trash.note_list);
  const render_overrides = isDefined(trash.override_list);
  const render_permissions = isDefined(trash.permission_list);
  const render_port_lists = isDefined(trash.port_list_list);
  const render_report_configs = isDefined(trash.report_config_list);
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
      {render_alerts && (
        <TrashCanTableRow
          type="alert"
          title={_('Alerts')}
          count={trash.alert_list.length}
        />
      )}
      {renderAudits && (
        <TrashCanTableRow
          type="audit"
          title={_('Audits')}
          count={audits.length}
        />
      )}
      {render_credentials && (
        <TrashCanTableRow
          type="credential"
          title={_('Credentials')}
          count={trash.credential_list.length}
        />
      )}
      {render_filters && (
        <TrashCanTableRow
          type="filter"
          title={_('Filters')}
          count={trash.filter_list.length}
        />
      )}
      {render_groups && (
        <TrashCanTableRow
          type="group"
          title={_('Groups')}
          count={trash.group_list.length}
        />
      )}
      {render_notes && (
        <TrashCanTableRow
          type="note"
          title={_('Notes')}
          count={trash.note_list.length}
        />
      )}
      {render_overrides && (
        <TrashCanTableRow
          type="override"
          title={_('Overrides')}
          count={trash.override_list.length}
        />
      )}
      {render_permissions && (
        <TrashCanTableRow
          type="permission"
          title={_('Permissions')}
          count={trash.permission_list.length}
        />
      )}
      {renderPolicies && (
        <TrashCanTableRow
          type="policy"
          title={_('Policies')}
          count={policies.length}
        />
      )}
      {render_port_lists && (
        <TrashCanTableRow
          type="port_list"
          title={_('Port Lists')}
          count={trash.port_list_list.length}
        />
      )}
      {render_report_configs && (
        <TrashCanTableRow
          type="report_config"
          title={_('Report Configs')}
          count={trash.report_config_list.length}
        />
      )}
      {render_report_formats && (
        <TrashCanTableRow
          type="report_format"
          title={_('Report Formats')}
          count={trash.report_format_list.length}
        />
      )}
      {render_roles && (
        <TrashCanTableRow
          type="role"
          title={_('Roles')}
          count={trash.role_list.length}
        />
      )}
      {renderConfigs && (
        <TrashCanTableRow
          type="config"
          title={_('Scan Configs')}
          count={configs.length}
        />
      )}
      {render_scanners && (
        <TrashCanTableRow
          type="scanner"
          title={_('Scanners')}
          count={trash.scanner_list.length}
        />
      )}
      {render_schedules && (
        <TrashCanTableRow
          type="schedule"
          title={_('Schedules')}
          count={trash.schedule_list.length}
        />
      )}
      {render_tags && (
        <TrashCanTableRow
          type="tag"
          title={_('Tags')}
          count={trash.tag_list.length}
        />
      )}
      {render_targets && (
        <TrashCanTableRow
          type="target"
          title={_('Targets')}
          count={trash.target_list.length}
        />
      )}
      {renderTasks && (
        <TrashCanTableRow type="task" title={_('Tasks')} count={tasks.length} />
      )}
      {render_tickets && (
        <TrashCanTableRow
          type="ticket"
          title={_('Tickets')}
          count={trash.ticket_list.length}
        />
      )}
    </TableBody>
  );
};

TrashCanContentsTable.propTypes = {
  trash: PropTypes.object.isRequired,
};

const TrashCan = () => {
  const gmp = useGmp();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmptyTrashDialogVisible, setIsEmptyTrashDialogVisible] =
    useState(false);
  const [isErrorEmptyingTrash, setIsErrorEmptyingTrash] = useState(false);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);
  let [trash, setTrash] = useState();
  const [_] = useTranslation();
  const [, renewSession] = useUserSessionTimeout();
  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  const handleInteraction = renewSession;

  const loadTrash = useCallback(() => {
    setIsLoading(true);
    gmp.trashcan.get().then(
      response => {
        setTrash(response.data);
        setIsLoading(false);
      },
      // eslint-disable-next-line no-shadow
      error => {
        showError(error);
        setIsLoading(false);
      },
    );
  }, [gmp, showError]);

  const handleRestore = entity => {
    handleInteraction();

    return gmp.trashcan.restore(entity).then(loadTrash).catch(showError);
  };

  const handleDelete = entity => {
    handleInteraction();

    return gmp.trashcan.delete(entity).then(loadTrash).catch(showError);
  };

  const handleEmpty = async () => {
    handleInteraction();

    setIsEmptyingTrash(true);
    let localIsErrorEmptyingTrash = false;

    try {
      await gmp.trashcan.empty();
      loadTrash();
    } catch (error) {
      setIsErrorEmptyingTrash(true);
      localIsErrorEmptyingTrash = true;
    } finally {
      setIsEmptyingTrash(false);

      if (!localIsErrorEmptyingTrash) {
        setTimeout(() => {
          if (!isLoading && !isErrorEmptyingTrash) {
            closeEmptyTrashDialog();
          }
        }, 1000);
      }
    }
  };

  const closeEmptyTrashDialog = () => {
    setIsEmptyTrashDialogVisible(false);
    setIsErrorEmptyingTrash(false);
  };

  const openEmptyTrashDialog = () => {
    setIsEmptyTrashDialogVisible(true);
  };

  // load the data on initial render
  useEffect(() => {
    loadTrash();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const tableProps = {
    links: false,
    onEntityRestore: handleRestore,
    onEntityDelete: handleDelete,
    actionsComponent: TrashActions,
    footnote: false,
    footer: false,
  };

  if (!isDefined(trash) && isLoading) {
    return <Loading />;
  } else if (!isDefined(trash)) {
    trash = {};
  }

  const {scan: tasks, compliance: audits} = separateByUsageType(
    trash.task_list,
  );
  const {scan: configs, compliance: policies} = separateByUsageType(
    trash.config_list,
  );

  return (
    <>
      <PageTitle title={_('Trashcan')} />
      <Layout flex="column">
        <span>
          {' '}
          {/* span prevents Toolbar from growing */}
          <ToolBarIcons />
        </span>
        <DialogNotification
          {...notificationDialogState}
          onCloseClick={closeNotificationDialog}
        />
        <Section img={<TrashcanIcon size="large" />} title={_('Trashcan')} />
        <EmptyTrashButton onClick={openEmptyTrashDialog} />
        {isEmptyTrashDialogVisible && (
          <ConfirmationDialog
            onClose={closeEmptyTrashDialog}
            onResumeClick={handleEmpty}
            content={
              !isErrorEmptyingTrash
                ? _('Are you sure you want to empty the trash?')
                : _(
                    'An error occurred while emptying the trash, please try again.',
                  )
            }
            title={_('Empty Trash')}
            rightButtonTitle={_('Confirm')}
            loading={isEmptyingTrash || isLoading}
            width="500px"
          />
        )}
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
          <TrashCanContentsTable trash={trash} />
        </Table>

        {isDefined(trash.alert_list) && (
          <span>
            <LinkTarget id="alert" />
            <h1>{_('Alerts')}</h1>
            <AlertsTable entities={trash.alert_list} {...tableProps} />
          </span>
        )}
        {isDefined(trash.task_list) && (
          <span>
            <LinkTarget id="audit" />
            <h1>{_('Audits')}</h1>
            <TasksTable entities={audits} {...tableProps} />
          </span>
        )}
        {isDefined(trash.credential_list) && (
          <span>
            <LinkTarget id="credential" />
            <h1>{_('Credentials')}</h1>
            <CredentialsTable
              entities={trash.credential_list}
              {...tableProps}
            />
          </span>
        )}
        {isDefined(trash.filter_list) && (
          <span>
            <LinkTarget id="filter" />
            <h1>{_('Filters')}</h1>
            <FiltersTable entities={trash.filter_list} {...tableProps} />
          </span>
        )}
        {isDefined(trash.group_list) && (
          <span>
            <LinkTarget id="group" />
            <h1>{_('Groups')}</h1>
            <GroupsTable entities={trash.group_list} {...tableProps} />
          </span>
        )}
        {isDefined(trash.note_list) && (
          <span>
            <LinkTarget id="note" />
            <h1>{_('Notes')}</h1>
            <NotesTable entities={trash.note_list} {...tableProps} />
          </span>
        )}
        {isDefined(trash.override_list) && (
          <span>
            <LinkTarget id="override" />
            <h1>{_('Overrides')}</h1>
            <OverridesTable entities={trash.override_list} {...tableProps} />
          </span>
        )}
        {isDefined(trash.permission_list) && (
          <span>
            <LinkTarget id="permission" />
            <h1>{_('Permissions')}</h1>
            <PermissionsTable
              entities={trash.permission_list}
              {...tableProps}
            />
          </span>
        )}
        {isDefined(trash.config_list) > 0 && (
          <span>
            <LinkTarget id="policy" />
            <h1>{_('Policies')}</h1>
            <PoliciesTable entities={policies} {...tableProps} />
          </span>
        )}
        {isDefined(trash.port_list_list) && (
          <span>
            <LinkTarget id="port_list" />
            <h1>{_('Port Lists')}</h1>
            <PortListsTable entities={trash.port_list_list} {...tableProps} />
          </span>
        )}
        {isDefined(trash.report_config_list) && (
          <span>
            <LinkTarget id="report_config" />
            <h1>{_('Report Configs')}</h1>
            <ReportConfigsTable
              entities={trash.report_config_list}
              {...tableProps}
            />
          </span>
        )}
        {isDefined(trash.report_format_list) && (
          <span>
            <LinkTarget id="report_format" />
            <h1>{_('Report Formats')}</h1>
            <ReportFormatsTable
              entities={trash.report_format_list}
              {...tableProps}
            />
          </span>
        )}
        {isDefined(trash.role_list) && (
          <span>
            <LinkTarget id="role" />
            <h1>{_('Roles')}</h1>
            <RolesTable entities={trash.role_list} {...tableProps} />
          </span>
        )}
        {isDefined(trash.config_list) && (
          <span>
            <LinkTarget id="config" />
            <h1>{_('Scan Configs')}</h1>
            <ScanConfigsTable entities={configs} {...tableProps} />
          </span>
        )}
        {isDefined(trash.scanner_list) && (
          <span>
            <LinkTarget id="scanner" />
            <h1>{_('Scanners')}</h1>
            <ScannersTable entities={trash.scanner_list} {...tableProps} />
          </span>
        )}
        {isDefined(trash.schedule_list) && (
          <span>
            <LinkTarget id="schedule" />
            <h1>{_('Schedules')}</h1>
            <SchedulesTable entities={trash.schedule_list} {...tableProps} />
          </span>
        )}
        {isDefined(trash.tag_list) && (
          <span>
            <LinkTarget id="tag" />
            <h1>{_('Tags')}</h1>
            <TagsTable entities={trash.tag_list} {...tableProps} />
          </span>
        )}
        {isDefined(trash.target_list) && (
          <span>
            <LinkTarget id="target" />
            <h1>{_('Targets')}</h1>
            <TargetsTable entities={trash.target_list} {...tableProps} />
          </span>
        )}
        {isDefined(trash.task_list) > 0 && (
          <span>
            <LinkTarget id="task" />
            <h1>{_('Tasks')}</h1>
            <TasksTable entities={tasks} {...tableProps} />
          </span>
        )}
        {isDefined(trash.ticket_list) && (
          <span>
            <LinkTarget id="ticket" />
            <h1>{_('Tickets')}</h1>
            <TicketsTable entities={trash.ticket_list} {...tableProps} />
          </span>
        )}
      </Layout>
    </>
  );
};

export default TrashCan;
