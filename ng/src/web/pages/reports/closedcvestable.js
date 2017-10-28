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

import CveLink from '../../components/link/cvelink.js';
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
        sortby={sort ? 'cve' : false}
        onSortChange={onSortChange}>
        {_('CVE')}
      </TableHead>
      <TableHead
        sortby={sort ? 'host' : false}
        onSortChange={onSortChange}>
        {_('Host')}
      </TableHead>
      <TableHead
        sortby={sort ? 'nvt' : false}
        onSortChange={onSortChange}>
        {_('NVT')}
      </TableHead>
      <TableHead
        width="10%"
        sortby={sort ? 'severity' : false}
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

const Row = ({entity}) => {
  const {id, host, source, severity} = entity;
  return (
    <TableRow>
      <TableData>
        <CveLink
          id={id}
        />
      </TableData>
      <TableData>
        <DetailsLink
          type="host"
          id={host.id}
        >
          {host.ip}
        </DetailsLink>
      </TableData>
      <TableData>
        <DetailsLink
          type="nvt"
          id={source.name}
        >
          {source.description}
        </DetailsLink>
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={severity}/>
      </TableData>
    </TableRow>
  );
};

Row.propTypes = {
  entity: PropTypes.object.isRequired,
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _('No Closed CVEs available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
