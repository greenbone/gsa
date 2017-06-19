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

import glamorous from 'glamorous';

import _, {long_date} from '../../locale.js';
import {classes} from '../../utils.js';

import PropTypes from '../proptypes.js';

import InfoTable from '../table/info.js';
import TableBody from '../table/body.js';
import TableData from '../table/data.js';
import TableRow from '../table/row.js';


const Table = glamorous(InfoTable)({
  borderSpacing: 0,

  '& td': {
    padding: 0,
  },
});

const EntityInfo = ({
    className,
    entity,
  }) => {
  className = classes(className, 'entity-info');
  return (
    <Table className={className}>
      <TableBody>
        <TableRow>
          <TableData>
            {_('ID')}
          </TableData>
          <TableData>
            {entity.id}
          </TableData>
        </TableRow>
        <TableRow>
          <TableData>
            {_('Created')}
          </TableData>
          <TableData>
            {long_date(entity.creation_time)}
          </TableData>
        </TableRow>
        <TableRow>
          <TableData>
            {_('Modified')}
          </TableData>
          <TableData>
            {long_date(entity.modification_time)}
          </TableData>
        </TableRow>
        <TableRow>
          <TableData>
            {_('Owner')}
          </TableData>
          <TableData>
            {entity.owner.name}
          </TableData>
        </TableRow>
      </TableBody>
    </Table>
  );
};

EntityInfo.propTypes = {
  className: PropTypes.string,
  entity: PropTypes.model.isRequired,
};

export default EntityInfo;

// vim: set ts=2 sw=2 tw=80:
