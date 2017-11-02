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

import _, {long_date} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

import InfoTable from '../components/table/infotable.js';
import TableBody from '../components/table/body.js';
import TableData from '../components/table/data.js';
import TableRow from '../components/table/row.js';

const OwnerInfo = ({
  owner,
}) => is_defined(owner) ?
  owner.name :
  <i>{_('(Global Object)')}</i>
;

OwnerInfo.propTypes = {
  owner: PropTypes.object,
};

export const EntityInfoTable = glamorous(InfoTable)(
  'entity-info',
  {
    borderSpacing: 0,

    '& td': {
      padding: 0,
    },
  },
);

const EntityInfo = ({
  entity,
}) => {
  const {
    id,
    owner,
    creation_time,
    modification_time,
  } = entity;
  return (
    <EntityInfoTable>
      <TableBody>
        <TableRow>
          <TableData>
            {_('ID')}
          </TableData>
          <TableData>
            {id}
          </TableData>
        </TableRow>
        <TableRow>
          <TableData>
            {_('Created')}
          </TableData>
          <TableData>
            {long_date(creation_time)}
          </TableData>
        </TableRow>
        <TableRow>
          <TableData>
            {_('Modified')}
          </TableData>
          <TableData>
            {long_date(modification_time)}
          </TableData>
        </TableRow>

        <TableRow>
          <TableData>
            {_('Owner')}
          </TableData>
          <TableData>
            <OwnerInfo owner={owner}/>
          </TableData>
        </TableRow>
      </TableBody>
    </EntityInfoTable>
  );
};

EntityInfo.propTypes = {
  className: PropTypes.string,
  entity: PropTypes.model.isRequired,
};

export default EntityInfo;

// vim: set ts=2 sw=2 tw=80:
