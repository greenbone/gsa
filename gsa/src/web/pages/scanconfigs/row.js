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
import {render_component, na} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import Trend from './trend.js';

const Actions = ({
  entity,
  onScanConfigDeleteClick,
  onScanConfigDownloadClick,
  onScanConfigCloneClick,
  onScanConfigEditClick,
}) => (
  <IconDivider grow align={['center', 'center']}>
    <TrashIcon
      displayName={_('Scan Config')}
      name="alert"
      entity={entity}
      onClick={onScanConfigDeleteClick}
    />
    <EditIcon
      displayName={_('Scan Config')}
      name="alert"
      entity={entity}
      onClick={onScanConfigEditClick}
    />
    <CloneIcon
      displayName={_('Scan Config')}
      name="alert"
      entity={entity}
      title={_('Clone Scan Config')}
      value={entity}
      onClick={onScanConfigCloneClick}
    />
    <ExportIcon
      value={entity}
      title={_('Export Scan Config')}
      onClick={onScanConfigDownloadClick}
    />
  </IconDivider>
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onScanConfigCloneClick: PropTypes.func.isRequired,
  onScanConfigDeleteClick: PropTypes.func.isRequired,
  onScanConfigDownloadClick: PropTypes.func.isRequired,
  onScanConfigEditClick: PropTypes.func.isRequired,
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
        type="scanconfig"
        displayName={_('Scan Config')}
        onToggleDetailsClick={onToggleDetailsClick}
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
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow(withEntityActions(Actions))(Row);

// vim: set ts=2 sw=2 tw=80:
