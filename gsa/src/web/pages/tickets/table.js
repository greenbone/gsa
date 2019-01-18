/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {_l, _} from 'gmp/locale/lang';

import SeverityBar from 'web/components/bar/severitybar';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/components/icon/editicon';
import SolutionType from 'web/components/icon/solutiontypeicon';
import TrashIcon from 'web/entity/icon/trashicon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import {createEntitiesFooter} from 'web/entities/footer';
import {createEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import PropTypes from 'web/utils/proptypes';

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
    name: 'status',
    displayName: _l('Status'),
  },
];

const Actions = withEntitiesActions(({
  entity,
  onTicketClone,
  onTicketClose,
  onTicketSolve,
  onTicketDelete,
}) => (
  <IconDivider>
    <EditIcon
      title={entity.isSolved() ?
        _('Ticket is already solved') :
        _('Mark Ticket as solved')
      }
      active={!entity.isSolved()}
      value={entity}
      onClick={onTicketSolve}
    />
    <EditIcon
      title={entity.isClosed() ?
         _('Ticket is already closed') :
         _('Mark Ticket as closed')
      }
      active={!entity.isClosed()}
      value={entity}
      onClick={onTicketClose}
    />
    <TrashIcon
      displayName={_('Ticket')}
      name="ticket"
      entity={entity}
      onClick={onTicketDelete}
    />
    <CloneIcon
      displayName={_('Ticket')}
      name="ticket"
      entity={entity}
      title={_('Clone Ticket')}
      value={entity}
      onClick={onTicketClone}
    />
  </IconDivider>
));

const Row = ({
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => (
  <TableRow>
    <EntityNameTableData
      entity={entity}
      link={links}
      displayName={_('Ticket')}
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData>
      <SeverityBar
        severity={entity.severity}
      />
    </TableData>
    <TableData>
      {entity.host}
    </TableData>
    <TableData align={['center', 'center']}>
      <SolutionType
        type={entity.solutionType}
      />
    </TableData>
    <TableData>
      {entity.assignedTo.user.name}
    </TableData>
    <TableData>
      {entity.status}
    </TableData>
    <Actions
      {...props}
      entity={entity}
    />
  </TableRow>
);

Row.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Footer = createEntitiesFooter({
  span: 7,
  trash: true,
  download: 'tickets.xml',
});

export default createEntitiesTable({
  emptyTitle: _l('No tickets available'),
  row: Row,
  header: createEntitiesHeader(FIELDS),
  footer: Footer,
});
