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

import PropTypes from '../../utils/proptypes.js';

import SeverityBar from '../../components/bar/severitybar.js';

import OsIcon from '../../components/icon/osicon.js';

import IconDivider from '../../components/layout/icondivider.js';

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
        sortby={sort ? 'name' : false}
        onSortChange={onSortChange}>
        {_('Operating System')}
      </TableHead>
      <TableHead
        sortby={sort ? 'cpe' : false}
        onSortChange={onSortChange}>
        {_('Hostname')}
      </TableHead>
      <TableHead
        sortby={sort ? 'hosts' : false}
        width="10%"
        onSortChange={onSortChange}>
        {_('Hosts')}
      </TableHead>
      <TableHead
        sortby={sort ? 'severity' : false}
        width="10%"
        onSortChange={onSortChange}>
        {_('Severity')}
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
  const {name, cpe, hosts, severity} = entity;
  return (
    <TableRow>
      <TableData>
        <Link
          to="operatingsystems"
          filter={'name=' + cpe}
          textOnly={!links}
        >
          <IconDivider>
            <OsIcon
              osCpe={cpe}
              osTxt={name}
            />
            <span>
              {name}
            </span>
          </IconDivider>
        </Link>
      </TableData>
      <TableData>
        <Link
          to="operatingsystems"
          filter={'name=' + cpe}
          textOnly={!links}
        >
          {cpe}
        </Link>
      </TableData>
      <TableData flex align="center">
        {hosts.count}
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={severity}/>
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
  emptyTitle: _('No Operating Systems available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
