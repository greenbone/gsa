/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
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

import _ from 'gmp/locale.js';

import IconDivider from '../../components/layout/icondivider.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const Actions = ({
    entity,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEntityEdit,
  }) => {
  return (
    <IconDivider align={['center', 'center']}>
      <TrashIcon
        displayName={_('Filter')}
        name="filter"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Filter')}
        name="filter"
        entity={entity}
        onClick={onEntityEdit}/>
      <CloneIcon
        displayName={_('Filter')}
        name="filter"
        entity={entity}
        title={_('Clone Filter')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Filter')}
        onClick={onEntityDownload}
      />
    </IconDivider>
  );
};

Actions.propTypes = {
  entity: PropTypes.model,
  onEntityClone: PropTypes.func,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onEntityEdit: PropTypes.func,
};

const Row = ({
  actions,
  entity,
  links = true,
  ...props
}, {
  capabilities,
}) => (
  <TableRow>
    <EntityNameTableData
      legacy
      entity={entity}
      link={links}
      type="filter"
      displayName={_('Filter')}
    />
    <TableData>
      {entity.toFilterString()}
    </TableData>
    <TableData>
      {entity.filter_type}
    </TableData>
    {render_component(actions, {...props, entity})}
  </TableRow>
);

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

Row.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withEntityRow(withEntityActions(Actions))(Row);

// vim: set ts=2 sw=2 tw=80:
