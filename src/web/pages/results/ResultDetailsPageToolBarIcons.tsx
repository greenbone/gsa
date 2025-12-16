/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Result from 'gmp/models/result';
import {isDefined} from 'gmp/utils/identity';
import Badge from 'web/components/badge/Badge';
import {
  NewNoteIcon,
  NewTicketIcon,
  ReportIcon,
  TaskIcon,
  TicketIcon,
  NewOverrideIcon,
} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';

interface ResultDetailsPageToolBarIconsProps {
  entity: Result;
  onNoteCreateClick: (entity: Result) => void;
  onOverrideCreateClick: (entity: Result) => void;
  onResultDownloadClick: (entity: Result) => void;
  onTicketCreateClick: (entity: Result) => void;
}

const ResultDetailsPageToolBarIcons = ({
  entity,
  onNoteCreateClick,
  onOverrideCreateClick,
  onResultDownloadClick,
  onTicketCreateClick,
}: ResultDetailsPageToolBarIconsProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();

  const isMissingPermissions =
    !capabilities.mayCreate('permission') || !capabilities.mayAccess('user');
  const createTicketIconTitle = isMissingPermissions
    ? _(
        'Permissions to create a ticket are insufficient. You need the ' +
          'create_permission and get_users permissions.',
      )
    : _('Create new Ticket');

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="displaying-all-existing-results"
          page="reports"
          title={_('Help: Results')}
        />
        <ListIcon page="results" title={_('Results List')} />
        <ExportIcon
          title={_('Export Result as XML')}
          value={entity}
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
            disabled={isMissingPermissions}
            title={createTicketIconTitle}
            value={entity}
            onClick={onTicketCreateClick}
          />
        )}
      </IconDivider>
      <IconDivider>
        {capabilities.mayAccess('task') && isDefined(entity.task) && (
          <DetailsLink id={entity.task.id as string} type="task">
            <TaskIcon
              title={_('Corresponding Task ({{name}})', {
                name: entity.task.name as string,
              })}
            />
          </DetailsLink>
        )}
        {capabilities.mayAccess('report') && isDefined(entity.report) && (
          <DetailsLink id={entity.report.id as string} type="report">
            <ReportIcon title={_('Corresponding Report')} />
          </DetailsLink>
        )}
        {capabilities.mayAccess('ticket') && entity.tickets.length > 0 && (
          <Link
            filter={'result_id=' + entity.id}
            title={_('Corresponding Tickets')}
            to="tickets"
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

export default ResultDetailsPageToolBarIcons;
