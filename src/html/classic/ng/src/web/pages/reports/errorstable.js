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

import DetailsLink from '../../components/link/detailslink.js';

import TableData from '../../components/table/data.js';
import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import {createEntitiesTable} from '../../entities/table.js';

const Header = ({
  sort = true,
  onSortChange,
}) => (
  <TableHeader>
    <TableRow>
      <TableHead
        sortby={sort ? 'error' : false}
        onSortChange={onSortChange}>
        {_('Error Message')}
      </TableHead>
      <TableHead
        sortby={sort ? 'host' : false}
        onSortChange={onSortChange}>
        {_('Host')}
      </TableHead>
      <TableHead
        sortby={sort ? 'hostname' : false}
        onSortChange={onSortChange}>
        {_('Hostname')}
      </TableHead>
      <TableHead
        sortby={sort ? 'nvt' : false}
        onSortChange={onSortChange}>
        {_('NVT')}
      </TableHead>
      <TableHead
        sortby={sort ? 'port' : false}
        onSortChange={onSortChange}>
        {_('Port')}
      </TableHead>
    </TableRow>
  </TableHeader>
);

Header.propTypes = {
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const Row = ({
  entity,
  links = true,
}) => {
  const {nvt, host, port, description} = entity;
  return (
    <TableRow>
      <TableData>
        {description}
      </TableData>
      <TableData>
        {is_defined(host.id) ?
          <DetailsLink
            type="host"
            id={host.id}
            textOnly={!links}
          >
            {host.ip}
          </DetailsLink> :
          host.ip
        }
      </TableData>
      <TableData>
        <i>{host.name}</i>
      </TableData>
      <TableData>
        <DetailsLink
          type="nvt"
          id={nvt.id}
          textOnly={!links}
        >
          {nvt.name}
        </DetailsLink>
      </TableData>
      <TableData>
        {port}
      </TableData>
    </TableRow>
  );
};

Row.propTypes = {
  entity: PropTypes.object.isRequired,
  links: PropTypes.bool,
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _('No Errors available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
