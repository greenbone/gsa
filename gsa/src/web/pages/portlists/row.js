/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';
import {renderComponent} from 'web/utils/render';

import EntityNameTableData from 'web/entities/entitynametabledata';
import {withEntityActions} from 'web/entities/actions';
import {withEntityRow} from 'web/entities/row';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

const IconActions = ({
  entity,
  onPortListDeleteClick,
  onPortListDownloadClick,
  onPortListCloneClick,
  onPortListEditClick,
}) => (
  <IconDivider
    align={['center', 'center']}
    grow
  >
    <TrashIcon
      entity={entity}
      displayName={_('Port List')}
      name="portlist"
      onClick={onPortListDeleteClick}
    />
    <EditIcon
      entity={entity}
      displayName={_('Port List')}
      name="port_list"
      onClick={onPortListEditClick}
    />
    <CloneIcon
      entity={entity}
      displayName={_('Port List')}
      name="port_list"
      onClick={onPortListCloneClick}
    />
    <ExportIcon
      value={entity}
      title={_('Export Port List')}
      onClick={onPortListDownloadClick}
    />
  </IconDivider>
);

IconActions.propTypes = {
  entity: PropTypes.model,
  onPortListCloneClick: PropTypes.func.isRequired,
  onPortListDeleteClick: PropTypes.func.isRequired,
  onPortListDownloadClick: PropTypes.func.isRequired,
  onPortListEditClick: PropTypes.func.isRequired,
};

const Row = ({
  entity,
  links = true,
  actions,
  onToggleDetailsClick,
  ...props
}) => (
  <TableRow>
    <EntityNameTableData
      entity={entity}
      link={links}
      type="portlist"
      displayName={_('Port List')}
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData align="start">
      {entity.port_count.all}
    </TableData>
    <TableData align="start">
      {entity.port_count.tcp}
    </TableData>
    <TableData align="start">
      {entity.port_count.udp}
    </TableData>
    {renderComponent(actions, {...props, entity})}
  </TableRow>
);

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow(withEntityActions(IconActions))(Row);

// vim: set ts=2 sw=2 tw=80:
