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

import {shorten} from '../../utils.js';

import PropTypes from '../utils/proptypes.js';
import {na, render_component} from '../utils/render.js';

import {withEntityRow} from '../entities/row.js';

import InfoLink from '../components/link/infolink.js';

import SeverityBar from '../components/bar/severitybar.js';

import Comment from '../components/comment/comment.js';

import TableBody from '../components/table/body.js';
import TableRow from '../components/table/row.js';
import TableData from '../components/table/data.js';

const Row = ({entity, links = true, actions, ...other}) => {
  return (
    <TableBody>
      <TableRow>
        <TableData
          rowSpan="2">
          <InfoLink
            legacy
            details
            type="cve"
            id={entity.id}
            textOnly={!links}>
            {entity.name}
          </InfoLink>
          <Comment text={entity.comment}/>
        </TableData>
        <TableData>
          {na(entity.vector)}
        </TableData>
        <TableData>
          {na(entity.complexity)}
        </TableData>
        <TableData>
          {na(entity.authentication)}
        </TableData>
        <TableData>
          {na(entity.confidentiality_impact)}
        </TableData>
        <TableData>
          {na(entity.integrity_impact)}
        </TableData>
        <TableData>
          {na(entity.availability_impact)}
        </TableData>
        <TableData>
          {datetime(entity.creation_time)}
        </TableData>
        <TableData flex align="center">
          <SeverityBar severity={entity.severity}/>
        </TableData>
        {render_component(actions, {...other, entity})}
      </TableRow>
      <TableRow>
        <TableData colSpan="8">
          {shorten(entity.description, 250)}
        </TableData>
      </TableRow>
    </TableBody>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model,
  links: PropTypes.bool,
};

export default withEntityRow(Row);

// vim: set ts=2 sw=2 tw=80:
