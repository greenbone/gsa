/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
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

import _, {datetime} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import EditIcon from '../../entity/icon/editicon.js';
import DeleteIcon from '../../entity/icon/deleteicon.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow, RowDetailsToggle} from '../../entities/row.js';

import SeverityBar from '../../components/bar/severitybar.js';

import Comment from '../../components/comment/comment.js';

import ExportIcon from '../../components/icon/exporticon.js';
import NewIcon from '../../components/icon/newicon.js';
import OsIcon from '../../components/icon/osicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

/*
const Actions = ({
    entity,
    onAppEditClick,
    onAppDeleteClick,
    onAppDownloadClick,
  }, {capabilities}) => {

  return (
    <IconDivider>
      <DeleteIcon
        entity={entity}
        name="asset"
        displayName={_('App')}
        onClick={onAppDeleteClick}/>
      <EditIcon
        entity={entity}
        name="asset"
        displayName={_('App')}
        onClick={onAppEditClick}/>
      <ExportIcon
        value={entity}
        title={_('Export App')}
        onClick={onAppDownloadClick}
      />
    </IconDivider>
  );
};

Actions.propTypes = {
  entity: PropTypes.model,
  onAppDeleteClick: PropTypes.func,
  onAppDownloadClick: PropTypes.func,
  onAppEditClick: PropTypes.func,
};

Actions.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};
*/

const Row = ({
  entity,
  links = true,
  actions,
  onToggleDetailsClick,
  ...props,
}) => {
  return (
    <TableRow>
      <TableData>
        {entity.name}
      </TableData>
      <TableData>
        {entity.hosts.count}
      </TableData>
      <TableData>
        {entity.occurrences.total}
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={entity.severity}/>
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

// FIXME
// export default withEntityRow(withEntityActions(Actions))(Row);

export default withEntityRow()(Row);

// vim: set ts=2 sw=2 tw=80:
