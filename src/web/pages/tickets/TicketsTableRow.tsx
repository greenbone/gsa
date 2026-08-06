/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ComponentType} from 'react';
import {
  type default as Ticket,
  getTranslatableTicketStatus,
} from 'gmp/models/ticket';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import DateTime from 'web/components/date/DateTime';
import SolutionTypeIcon from 'web/components/icon/SolutionTypeIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesActions from 'web/entities/EntitiesActions';
import {type RowComponentProps} from 'web/entities/EntitiesTable';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import CloneIcon from 'web/entity/icon/CloneIcon';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import useTranslation from 'web/hooks/useTranslation';
import {type SelectionTypeType} from 'web/utils/selection-type';
import {NA_VALUE} from 'web/utils/severity';

interface TicketsRowActionHandlers {
  onTicketCloneClick?: (ticket: Ticket) => void | Promise<void>;
  onTicketDeleteClick?: (ticket: Ticket) => void | Promise<void>;
  onTicketEditClick?: (ticket: Ticket) => void | Promise<void>;
}

interface TicketsActionsProps extends TicketsRowActionHandlers {
  entity: Ticket;
  onEntityDeselected?: (entity: Ticket) => void;
  onEntitySelected?: (entity: Ticket) => void;
  selectionType?: SelectionTypeType;
}

export interface TicketsTableRowProps
  extends RowComponentProps<Ticket>, TicketsRowActionHandlers {
  actionsComponent?: ComponentType<TicketsActionsProps>;
  links?: boolean;
  onEntityDeselected?: (entity: Ticket) => void;
  onEntitySelected?: (entity: Ticket) => void;
  selectionType?: SelectionTypeType;
}

const Actions = ({
  entity,
  onEntityDeselected,
  onEntitySelected,
  selectionType,
  onTicketCloneClick,
  onTicketEditClick,
  onTicketDeleteClick,
}: TicketsActionsProps) => {
  const [_] = useTranslation();

  return (
    <EntitiesActions
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <IconDivider grow align="center">
        <DeleteIcon
          displayName={_('Ticket')}
          entity={entity}
          name="ticket"
          onClick={onTicketDeleteClick}
        />
        <EditIcon
          displayName={_('Ticket')}
          entity={entity}
          name="ticket"
          onClick={onTicketEditClick}
        />
        <CloneIcon
          displayName={_('Ticket')}
          entity={entity}
          name="ticket"
          title={_('Clone Ticket')}
          onClick={onTicketCloneClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

const TicketsTableRow = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onEntityDeselected,
  onEntitySelected,
  onToggleDetailsClick,
  onTicketCloneClick,
  onTicketDeleteClick,
  onTicketEditClick,
  selectionType,
}: TicketsTableRowProps) => {
  const [_] = useTranslation();
  const {task} = entity;
  const taskIsInTrash =
    isDefined(task) &&
    isDefined((task as {isInTrash?: () => boolean}).isInTrash)
      ? (task as {isInTrash: () => boolean}).isInTrash()
      : false;
  const showNa = taskIsInTrash || entity.isOrphan();

  let toolTip: string | undefined;
  if (taskIsInTrash) {
    toolTip = _('Corresponding task is in trashcan');
  } else if (entity.isOrphan()) {
    toolTip = _('No severity available, the ticket is orphaned');
  }

  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('Ticket')}
        entity={entity}
        links={links}
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>
        <SeverityBar
          severity={showNa ? NA_VALUE : entity.severity}
          toolTip={toolTip}
        />
      </TableData>
      <TableData>{entity.host}</TableData>
      <TableData align={['center', 'center']}>
        <SolutionTypeIcon type={entity.solutionType as never} />
      </TableData>
      <TableData>{entity.assignedTo?.name}</TableData>
      <TableData>
        <DateTime date={entity.modificationTime} />
      </TableData>
      <TableData>
        {isDefined(entity.status) && getTranslatableTicketStatus(entity.status)}
      </TableData>
      <ActionsComponent
        entity={entity}
        selectionType={selectionType}
        onEntityDeselected={onEntityDeselected}
        onEntitySelected={onEntitySelected}
        onTicketCloneClick={onTicketCloneClick}
        onTicketDeleteClick={onTicketDeleteClick}
        onTicketEditClick={onTicketEditClick}
      />
    </TableRow>
  );
};

export default TicketsTableRow;
