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
import {render_component, na} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entities/icons/entitycloneicon.js';
import EditIcon from '../../entities/icons/entityediticon.js';
import TrashIcon from '../../entities/icons/entitytrashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import Trend from './trend.js';

const Actions = ({
    entity,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEntityEdit,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        displayName={_('Scan Config')}
        name="alert"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Scan Config')}
        name="alert"
        entity={entity}
        onClick={onEntityEdit}/>
      <CloneIcon
        displayName={_('Scan Config')}
        name="alert"
        entity={entity}
        title={_('Clone Scan Config')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Scan Config')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onEntityEdit: PropTypes.func,
  onEntityClone: PropTypes.func,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
};

const Row = ({
    actions,
    entity,
    links = true,
    ...props
  }) => {
  return (
    <TableRow>
      <EntityNameTableData
        legacy
        entity={entity}
        link={links}
        type="config"
        displayName={_('Scan Config')}
      />
      <TableData flex align="end">
        {na(entity.families.count)}
      </TableData>
      <TableData flex align="center">
        <Trend
          trend={entity.families.trend}
          titleDynamic={_('The family selection is DYNAMIC. New families ' +
            'will automatically be added and considered.')}
          titleStatic={_('The family selection is STATIC. New families ' +
            'will NOT automatically be added and considered.')}
        />
      </TableData>
      <TableData flex align="end">
        {na(entity.nvts.count)}
      </TableData>
      <TableData flex align="center">
        <Trend
          trend={entity.nvts.trend}
          titleDynamic={_('The NVT selection is DYNAMIC. New NVTs of ' +
            'selected families will automatically be added and considered.')}
          titleStatic={_('The NVT selection is DYNAMIC. New NVTS of ' +
            'selected families will NOT automatically be added and ' +
            'considered.')}
        />
      </TableData>
      {render_component(actions, {...props, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default withEntityRow(Row, withEntityActions(Actions));

// vim: set ts=2 sw=2 tw=80:
