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

import {datetime} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import {withEntityRow, RowDetailsToggle} from '../../entities/row.js';

import SeverityBar from '../../components/bar/severitybar.js';

import SolutionTypeIcon from '../../components/icon/solutiontypeicon.js';

import DetailsLink from '../../components/link/detailslink.js';

import TableRow from '../../components/table/row.js';
import TableData from '../../components/table/data.js';

import ResultDelta from './delta.js';

const Row = ({
  actions,
  delta = false,
  entity,
  links = true,
  onToggleDetailsClick,
  ...other
}) => {
  const {host} = entity;
  const shown_name = is_defined(entity.name) ? entity.name : entity.nvt.oid;
  const has_tags = is_defined(entity.nvt) && is_defined(entity.nvt.tags);
  return (
    <TableRow>
      {delta &&
        <TableData align={['center', 'center']}>
          {entity.hasDelta() &&
            <ResultDelta
              delta={entity.delta}
            />
          }
        </TableData>
      }
      <TableData>
        <RowDetailsToggle
          name={entity.id}
          onClick={onToggleDetailsClick}>
          {shown_name}
        </RowDetailsToggle>
      </TableData>
      <TableData flex align="center">
        {has_tags &&
          <SolutionTypeIcon type={entity.nvt.tags.solution_type}/>
        }
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={entity.severity}/>
      </TableData>
      <TableData flex align="center">
        {entity.qod.value} %
      </TableData>
      <TableData flex align="center">
        <DetailsLink
          type="host"
          id={host.id}
          textOnly={!links}
        >
          {host.name}
        </DetailsLink>
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
  delta: PropTypes.bool,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func,
};

export default withEntityRow()(Row);

// vim: set ts=2 sw=2 tw=80:
