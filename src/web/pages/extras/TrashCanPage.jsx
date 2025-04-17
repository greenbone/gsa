/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {isDefined} from 'gmp/utils/identity';
import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import {DELETE_ACTION} from 'web/components/dialog/TwoButtonFooter';
import Button from 'web/components/form/Button';
import {TrashcanIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import InnerLink from 'web/components/link/InnerLink';
import LinkTarget from 'web/components/link/Target';
import Loading from 'web/components/loading/Loading';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import Section from 'web/components/section/Section';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import Table from 'web/components/table/StripedTable';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';
import AlertsTable from 'web/pages/alerts/Table';
import CredentialsTable from 'web/pages/credentials/Table';
import TrashActions from 'web/pages/extras/TrashActions';
import FiltersTable from 'web/pages/filters/Table';
import GroupsTable from 'web/pages/groups/Table';
import NotesTable from 'web/pages/notes/Table';
import OverridesTable from 'web/pages/overrides/Table';
import PermissionsTable from 'web/pages/permissions/Table';
import PoliciesTable from 'web/pages/policies/Table';
import PortListsTable from 'web/pages/portlists/Table';
import ReportConfigsTable from 'web/pages/reportconfigs/Table';
import ReportFormatsTable from 'web/pages/reportformats/Table';
import RolesTable from 'web/pages/roles/Table';
import ScanConfigsTable from 'web/pages/scanconfigs/Table';
import ScannersTable from 'web/pages/scanners/Table';
import SchedulesTable from 'web/pages/schedules/Table';
import TagsTable from 'web/pages/tags/Table';
import TargetsTable from 'web/pages/targets/Table';
import TasksTable from 'web/pages/tasks/Table';
import TicketsTable from 'web/pages/tickets/Table';
import PropTypes from 'web/utils/PropTypes';
const Col = styled.col`
  width: 50%;
`;

const ToolBarIcons = () => {
  const [_] = useTranslation();
  return (
    <ManualIcon
      anchor="using-the-trashcan"
      page="web-interface"
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
          count={trash.alert_list.length}
          title={_('Alerts')}
          type="alert"
        />
      )}
      {renderAudits && (
        <TrashCanTableRow
          count={audits.length}
          title={_('Audits')}
          type="audit"
        />
      )}
      {render_credentials && (
        <TrashCanTableRow
          count={trash.credential_list.length}
          title={_('Credentials')}
          type="credential"
        />
      )}
      {render_filters && (
        <TrashCanTableRow
          count={trash.filter_list.length}
          title={_('Filters')}
          type="filter"
        />
      )}
      {render_groups && (
        <TrashCanTableRow
          count={trash.group_list.length}
          title={_('Groups')}
          type="group"
        />
      )}
      {render_notes && (
        <TrashCanTableRow
          count={trash.note_list.length}
          title={_('Notes')}
          type="note"
        />
      )}
      {render_overrides && (
        <TrashCanTableRow
          count={trash.override_list.length}
          title={_('Overrides')}
          type="override"
        />
      )}
      {render_permissions && (
        <TrashCanTableRow
          count={trash.permission_list.length}
          title={_('Permissions')}
          type="permission"
        />
      )}
      {renderPolicies && (
        <TrashCanTableRow
          count={policies.length}
          title={_('Policies')}
          type="policy"
        />
      )}
      {render_port_lists && (
        <TrashCanTableRow
          count={trash.port_list_list.length}
          title={_('Port Lists')}
          type="port_list"
        />
      )}
      {render_report_configs && (
        <TrashCanTableRow
          count={trash.report_config_list.length}
          title={_('Report Configs')}
          type="report_config"
        />
      )}
      {render_report_formats && (
        <TrashCanTableRow
          count={trash.report_format_list.length}
          title={_('Report Formats')}
          type="report_format"
        />
      )}
      {render_roles && (
        <TrashCanTableRow
          count={trash.role_list.length}
          title={_('Roles')}
          type="role"
        />
      )}
      {renderConfigs && (
        <TrashCanTableRow
          count={configs.length}
          title={_('Scan Configs')}
          type="config"
        />
      )}
      {render_scanners && (
        <TrashCanTableRow
          count={trash.scanner_list.length}
          title={_('Scanners')}
          type="scanner"
        />
      )}
      {render_schedules && (
        <TrashCanTableRow
          count={trash.schedule_list.length}
          title={_('Schedules')}
          type="schedule"
        />
      )}
      {render_tags && (
        <TrashCanTableRow
          count={trash.tag_list.length}
          title={_('Tags')}
          type="tag"
        />
      )}
      {render_targets && (
        <TrashCanTableRow
          count={trash.target_list.length}
          title={_('Targets')}
          type="target"
        />
      )}
      {renderTasks && (
        <TrashCanTableRow count={tasks.length} title={_('Tasks')} type="task" />
      )}
      {render_tickets && (
        <TrashCanTableRow
          count={trash.ticket_list.length}
          title={_('Tickets')}
          type="ticket"
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

      error => {
        showError(error);
        setIsLoading(false);
      },
    );
  }, [gmp, showError]);

  const handleRestore = async entity => {
    handleInteraction();

    try {
      await gmp.trashcan.restore(entity);
      loadTrash();
      showSuccessNotification(
        _('{{name}} restored successfully.', {name: entity.name}),
      );
    } catch (error) {
      showError(error);
    }
  };

  const handleDelete = async entity => {
    handleInteraction();

    try {
      await gmp.trashcan.delete(entity);
      loadTrash();
      showSuccessNotification(
        _('{{name}} deleted successfully.', {name: entity.name}),
      );
    } catch (error) {
      showError(error);
    }
  };
  const handleEmpty = async () => {
    handleInteraction();

    setIsEmptyingTrash(true);
    let localIsErrorEmptyingTrash = false;

    try {
      await gmp.trashcan.empty();
      loadTrash();
    } catch {
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
            content={
              !isErrorEmptyingTrash
                ? _('Are you sure you want to empty the trash?')
                : _(
                    'An error occurred while emptying the trash, please try again.',
                  )
            }
            loading={isEmptyingTrash || isLoading}
            rightButtonAction={DELETE_ACTION}
            rightButtonTitle={_('Confirm')}
            title={_('Empty Trash')}
            width="500px"
            onClose={closeEmptyTrashDialog}
            onResumeClick={handleEmpty}
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
