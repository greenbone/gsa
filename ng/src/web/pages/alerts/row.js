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
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component, render_yesno} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';
import Icon from '../../components/icon/icon.js';

import IconDivider from '../../components/layout/icondivider.js';

import DetailsLink from '../../components/link/detailslink.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import Condition from './condition.js';
import Event from './event.js';
import Method from './method.js';

const Actions = ({
  entity,
  onAlertDeleteClick,
  onAlertDownloadClick,
  onAlertCloneClick,
  onAlertEditClick,
  onAlertTestClick,
}) => (
  <IconDivider
    align={['center', 'center']}
    grow
  >
    <TrashIcon
      displayName={_('Alert')}
      name="alert"
      entity={entity}
      onClick={onAlertDeleteClick}/>
    <EditIcon
      displayName={_('Alert')}
      name="alert"
      entity={entity}
      onClick={onAlertEditClick}/>
    <CloneIcon
      displayName={_('Alert')}
      name="alert"
      entity={entity}
      title={_('Clone Alert')}
      value={entity}
      onClick={onAlertCloneClick}/>
    <ExportIcon
      value={entity}
      title={_('Export Alert')}
      onClick={onAlertDownloadClick}
    />
    <Icon
      img="start.svg"
      value={entity}
      title={_('Test Alert')}
      onClick={onAlertTestClick}
    />
  </IconDivider>
);

Actions.propTypes = {
  entity: PropTypes.model,
  onAlertCloneClick: PropTypes.func.isRequired,
  onAlertDeleteClick: PropTypes.func.isRequired,
  onAlertDownloadClick: PropTypes.func.isRequired,
  onAlertEditClick: PropTypes.func.isRequired,
  onAlertTestClick: PropTypes.func.isRequired,
};

const render_filter = (filter, caps, links = true) => {
  if (!is_defined(filter)) {
    return null;
  }

  return (
    <DetailsLink
      textOnly={!caps.mayAccess('filters') || !links}
      type="filter"
      id={filter.id}>
      {filter.name}
    </DetailsLink>
  );
};

const Row = ({
  actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}, {
  capabilities,
}) => {
  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        link={links}
        type="alert"
        displayName={_('Alert')}
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>
        <Event event={entity.event}/>
      </TableData>
      <TableData>
        <Condition
          condition={entity.condition}
          event={entity.event}
        />
      </TableData>
      <TableData>
        <Method method={entity.method}/>
      </TableData>
      <TableData>
        {render_filter(entity.filter, capabilities)}
      </TableData>
      <TableData>
        {render_yesno(entity.active)}
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

Row.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withEntityRow(withEntityActions(Actions))(Row);

// vim: set ts=2 sw=2 tw=80:
