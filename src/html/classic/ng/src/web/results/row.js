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

import {datetime} from '../../locale.js';

import LegacyLink from '../legacylink.js';
import PropTypes from '../proptypes.js';
import SeverityBar from '../severitybar.js';
import SolutionType from '../solutiontype.js';
import {render_component} from '../render.js';

import {withEntityRow} from '../entities/row.js';

import TableRow from '../table/row.js';
import TableData from '../table/data.js';

const Row = ({entity, links = true, actions, ...other}) => {
  let shown_name = entity.name ? entity.name : entity.nvt.oid;
  return (
    <TableRow>
      <TableData>
        {links ?
          <LegacyLink
            cmd="get_result"
            result_id={entity.id}>
            {shown_name}
          </LegacyLink> :
          shown_name
        }
      </TableData>
      <TableData flex align="center">
        {entity && entity.nvt && entity.nvt.tags &&
          <SolutionType type={entity.nvt.tags.solution_type}/>
        }
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={entity.severity}/>
      </TableData>
      <TableData flex align="center">
        {entity.qod.value} %
      </TableData>
      <TableData flex align="center">
        {links ?
          <LegacyLink
            cmd="get_asset"
            type="host"
            asset_id={entity.host.id}>
            {entity.host.name}
          </LegacyLink> :
          entity.host.name
        }
      </TableData>
      <TableData>
        {entity.port}
      </TableData>
      <TableData>
        {datetime(entity.modification_time)}
      </TableData>
      {render_component(actions, {...other, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default withEntityRow(Row);

// vim: set ts=2 sw=2 tw=80:
