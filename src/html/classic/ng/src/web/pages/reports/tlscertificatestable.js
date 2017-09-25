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

import _, {short_date} from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';

import Link from '../../components/link/link.js';

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
        sortby={sort ? 'dn' : false}
        onSortChange={onSortChange}>
        {_('DN')}
      </TableHead>
      <TableHead
        sortby={sort ? 'serial' : false}
        onSortChange={onSortChange}>
        {_('Serial')}
      </TableHead>
      <TableHead
        sortby={sort ? 'notvalidbefore' : false}
        onSortChange={onSortChange}>
        {_('Not Valid Before')}
      </TableHead>
      <TableHead
        sortby={sort ? 'notvalidafter' : false}
        onSortChange={onSortChange}>
        {_('Not Valid After')}
      </TableHead>
      <TableHead
        sortby={sort ? 'ip' : false}
        onSortChange={onSortChange}>
        {_('IP')}
      </TableHead>
      <TableHead
        sortby={sort ? 'hostname' : false}
        onSortChange={onSortChange}>
        {_('Hostname')}
      </TableHead>
      <TableHead
        sortby={sort ? 'port' : false}
        onSortChange={onSortChange}>
        {_('Port')}
      </TableHead>
      <TableHead
        width="50px"
        onSortChange={onSortChange}>
        {_('Actions')}
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
  const {issuer, serial, notafter, notbefore, hostname, ip, port} = entity;
  return (
    <TableRow>
      <TableData>
        {issuer}
      </TableData>
      <TableData>
        {serial}
      </TableData>
      <TableData flex align="end">
        {short_date(notbefore)}
      </TableData>
      <TableData flex align="end">
        {short_date(notafter)}
      </TableData>
      <TableData>
        <Link
          to="hosts"
          filter={'name=' + ip}
          textOnly={!links}
          title={_('Show all Hosts with IP {{ip}}', {ip})}
        >
          {ip}
        </Link>
      </TableData>
      <TableData>
        {hostname}
      </TableData>
      <TableData>
        {port}
      </TableData>
      <TableData flex align="center">
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
  emptyTitle: _('No TLS Certificates available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
