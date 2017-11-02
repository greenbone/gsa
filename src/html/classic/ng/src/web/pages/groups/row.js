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

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';
import EditIcon from '../../entity/icon/editicon.js';

import ExportIcon from '../../components/icon/exporticon.js';

import TableRow from '../../components/table/row.js';

const IconActions = ({
    entity,
    onEditGroup,
    onEntityClone,
    onEntityDelete,
    onEntityDownload,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        displayName={_('Group')}
        name="group"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Group')}
        name="group"
        entity={entity}
        onClick={onEditGroup}/>
      <CloneIcon
        displayName={_('Group')}
        name="user"
        entity={entity}
        title={_('Clone Group')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Group')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

IconActions.propTypes = {
  entity: PropTypes.model.isRequired,
  onEditGroup: PropTypes.func.isRequired,
  onEntityClone: PropTypes.func.isRequired,
  onEntityDelete: PropTypes.func.isRequired,
  onEntityDownload: PropTypes.func.isRequired,
};

const Row = ({
  actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        link={links}
        type="group"
        displayName={_('Group')}
        onToggleDetailsClick={onToggleDetailsClick}
      />
      {render_component(actions, {...props, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow(withEntityActions(IconActions))(Row);

// vim: set ts=2 sw=2 tw=80:
