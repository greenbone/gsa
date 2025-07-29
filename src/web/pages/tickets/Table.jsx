/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_l, _} from 'gmp/locale/lang';
import {getTranslatableTicketStatus} from 'gmp/models/ticket';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import DateTime from 'web/components/date/DateTime';
import SolutionType from 'web/components/icon/SolutionTypeIcon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import {createEntitiesHeader} from 'web/entities/Header';
import {createEntitiesTable} from 'web/entities/Table';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import withRowDetails from 'web/entities/withRowDetails';
import EntityCloneIcon from 'web/entity/icon/CloneIcon';
import EntityEditIcon from 'web/entity/icon/EditIcon';
import EntityTrashIcon from 'web/entity/icon/TrashIcon';
import TicketDetails from 'web/pages/tickets/Details';
import PropTypes from 'web/utils/PropTypes';
import {NA_VALUE} from 'web/utils/severity';

export const FIELDS = [
  {
    name: 'name',
    displayName: _l('Vulnerability'),
  },
  {
    name: 'severity',
    displayName: _l('Severity'),
  },
  {
    name: 'host',
    displayName: _l('Host'),
  },
  {
    name: 'solution_type',
    displayName: _l('Solution Type'),
    align: ['center', 'start'],
  },
  {
    name: 'username',
    displayName: _l('Assigned User'),
  },
  {
    name: 'modified',
    displayName: _l('Modification Time'),
  },
  {
    name: 'status',
    displayName: _l('Status'),
  },
];

const TicketActions = withEntitiesActions(
  ({entity, onTicketClone, onTicketDelete, onTicketEdit}) => (
    <Layout align={['center', 'center']}>
      <IconDivider>
        <EntityTrashIcon
          displayName={_('Ticket')}
          entity={entity}
          name="ticket"
          onClick={onTicketDelete}
        />
        <EntityEditIcon
          displayName={_('Ticket')}
          entity={entity}
          name="ticket"
          onClick={onTicketEdit}
        />
        <EntityCloneIcon
          displayName={_('Ticket')}
          entity={entity}
          name="ticket"
          title={_('Clone Ticket')}
          onClick={onTicketClone}
        />
      </IconDivider>
    </Layout>
  ),
);

TicketActions.displayName = 'TicketActions';

TicketActions.propTypes = {
  entity: PropTypes.model.isRequired,
  onTicketClone: PropTypes.func.isRequired,
  onTicketDelete: PropTypes.func.isRequired,
  onTicketEdit: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = TicketActions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const {task = {}} = entity;
  const taskIsInTrash = isDefined(task.isInTrash) ? task.isInTrash() : false;

  const showNa = taskIsInTrash || entity.isOrphan();

  let toolTip;
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
        link={links}
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
        <SolutionType type={entity.solutionType} />
      </TableData>
      <TableData>{entity.assignedTo.name}</TableData>
      <TableData>
        <DateTime date={entity.modificationTime} />
      </TableData>
      <TableData>{getTranslatableTicketStatus(entity.status)}</TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func,
};

const Footer = createEntitiesFooter({
  span: 8,
  trash: true,
  download: 'tickets.xml',
});

export default createEntitiesTable({
  emptyTitle: _l('No tickets available'),
  row: Row,
  rowDetails: withRowDetails('ticket', 8)(TicketDetails),
  header: createEntitiesHeader(FIELDS),
  footer: Footer,
});
