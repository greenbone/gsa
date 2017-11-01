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

import {shorten} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import {withEntityRow, RowDetailsToggle} from '../../entities/row.js';

import SeverityBar from '../../components/bar/severitybar.js';

import Comment from '../../components/comment/comment.js';

import TableBody from '../../components/table/body.js';
import TableRow from '../../components/table/row.js';
import TableData from '../../components/table/data.js';

import {secinfo_type} from 'gmp/models/secinfo.js';

const Row = ({
  entity,
  links = true,
  actions,
  onToggleDetailsClick,
  ...other
}) => {
  return (
    <TableBody>
      <TableRow>
        <TableData
          rowSpan="2">
          <RowDetailsToggle
            name={entity.id}
            onClick={onToggleDetailsClick}>
            {entity.name}
          </RowDetailsToggle>
          <Comment text={entity.comment}/>
        </TableData>
        <TableData>
          {secinfo_type(entity.info_type)}
        </TableData>
        <TableData>
          {datetime(entity.creation_time)}
        </TableData>
        <TableData>
          {datetime(entity.modification_time)}
        </TableData>
        <TableData flex align="center">
          <SeverityBar severity={entity.severity}/>
        </TableData>
        {render_component(actions, {...other, entity})}
      </TableRow>
      <TableRow>
        <TableData colSpan="5">
          <span title={entity.extra}>
            {shorten(entity.extra, 150)}
          </span>
        </TableData>
      </TableRow>
    </TableBody>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.object.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow()(Row);

// vim: set ts=2 sw=2 tw=80:
