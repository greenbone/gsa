/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TrashCanGetData} from 'gmp/commands/trashcan';
import Model from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';
import TableBody from 'web/components/table/TableBody';
import useTranslation from 'web/hooks/useTranslation';
import TrashCanTableRow from 'web/pages/trashcan/TrashCanTableRow';

interface TrashCanContentsTableProps {
  trash?: TrashCanGetData;
}

const hasItems = (items: Model[]): boolean => {
  return isDefined(items) && items.length > 0;
};

const TrashCanTableContents = ({trash}: TrashCanContentsTableProps) => {
  const [_] = useTranslation();

  if (!isDefined(trash)) {
    return null;
  }

  const hasAlerts = hasItems(trash.alerts);
  const hasAudits = hasItems(trash.audits);
  const hasCredentials = hasItems(trash.credentials);
  const hasFilters = hasItems(trash.filters);
  const hasGroups = hasItems(trash.groups);
  const hasNotes = hasItems(trash.notes);
  const hasOverrides = hasItems(trash.overrides);
  const hasPermissions = hasItems(trash.permissions);
  const hasPolicies = hasItems(trash.policies);
  const hasPortLists = hasItems(trash.portLists);
  const hasReportConfigs = hasItems(trash.reportConfigs);
  const hasReportFormats = hasItems(trash.reportFormats);
  const hasRoles = hasItems(trash.roles);
  const hasScanners = hasItems(trash.scanners);
  const hasSchedules = hasItems(trash.schedules);
  const hasTags = hasItems(trash.tags);
  const hasTargets = hasItems(trash.targets);
  const hasTickets = hasItems(trash.tickets);
  const hasTasks = hasItems(trash.tasks);
  const hasScanConfigs = hasItems(trash.scanConfigs);
  const hasAgentGroups = hasItems(trash.agentGroups);

  return (
    <TableBody>
      {hasAlerts && (
        <TrashCanTableRow
          count={trash.alerts.length}
          title={_('Alerts')}
          type="alert"
        />
      )}
      {hasAudits && (
        <TrashCanTableRow
          count={trash.audits.length}
          title={_('Audits')}
          type="audit"
        />
      )}
      {hasCredentials && (
        <TrashCanTableRow
          count={trash.credentials.length}
          title={_('Credentials')}
          type="credential"
        />
      )}
      {hasFilters && (
        <TrashCanTableRow
          count={trash.filters.length}
          title={_('Filters')}
          type="filter"
        />
      )}
      {hasGroups && (
        <TrashCanTableRow
          count={trash.groups.length}
          title={_('Groups')}
          type="group"
        />
      )}
      {hasNotes && (
        <TrashCanTableRow
          count={trash.notes.length}
          title={_('Notes')}
          type="note"
        />
      )}
      {hasOverrides && (
        <TrashCanTableRow
          count={trash.overrides.length}
          title={_('Overrides')}
          type="override"
        />
      )}
      {hasPermissions && (
        <TrashCanTableRow
          count={trash.permissions.length}
          title={_('Permissions')}
          type="permission"
        />
      )}
      {hasPolicies && (
        <TrashCanTableRow
          count={trash.policies.length}
          title={_('Policies')}
          type="policy"
        />
      )}
      {hasPortLists && (
        <TrashCanTableRow
          count={trash.portLists.length}
          title={_('Port Lists')}
          type="port_list"
        />
      )}
      {hasReportConfigs && (
        <TrashCanTableRow
          count={trash.reportConfigs.length}
          title={_('Report Configs')}
          type="report_config"
        />
      )}
      {hasReportFormats && (
        <TrashCanTableRow
          count={trash.reportFormats.length}
          title={_('Report Formats')}
          type="report_format"
        />
      )}
      {hasRoles && (
        <TrashCanTableRow
          count={trash.roles.length}
          title={_('Roles')}
          type="role"
        />
      )}
      {hasScanConfigs && (
        <TrashCanTableRow
          count={trash.scanConfigs.length}
          title={_('Scan Configs')}
          type="config"
        />
      )}
      {hasScanners && (
        <TrashCanTableRow
          count={trash.scanners.length}
          title={_('Scanners')}
          type="scanner"
        />
      )}
      {hasSchedules && (
        <TrashCanTableRow
          count={trash.schedules.length}
          title={_('Schedules')}
          type="schedule"
        />
      )}
      {hasTags && (
        <TrashCanTableRow
          count={trash.tags.length}
          title={_('Tags')}
          type="tag"
        />
      )}
      {hasTargets && (
        <TrashCanTableRow
          count={trash.targets.length}
          title={_('Targets')}
          type="target"
        />
      )}
      {hasTasks && (
        <TrashCanTableRow
          count={trash.tasks.length}
          title={_('Tasks')}
          type="task"
        />
      )}
      {hasTickets && (
        <TrashCanTableRow
          count={trash.tickets.length}
          title={_('Tickets')}
          type="ticket"
        />
      )}
      {hasAgentGroups && (
        <TrashCanTableRow
          count={trash.agentGroups.length}
          title={_('Agent Groups')}
          type="agentgroup"
        />
      )}
    </TableBody>
  );
};

export default TrashCanTableContents;
