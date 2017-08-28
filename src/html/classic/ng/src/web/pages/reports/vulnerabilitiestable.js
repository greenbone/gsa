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

import {createEntitiesTable} from '../../entities/table.js';

import SeverityBar from '../../components/bar/severitybar.js';

import DetailsLink from '../../components/link/detailslink.js';
import Link from '../../components/link/link.js';

import TableData from '../../components/table/data.js';
import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

const Row = ({
  entity,
  links = true,
  ...other
}) => {
  return (
    <TableRow>
      <TableData>
        <DetailsLink
          type="nvt"
          id={entity.id}
          textOnly={!links}>
          {entity.name}
        </DetailsLink>
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={entity.severity}/>
      </TableData>
      <TableData flex align="center">
        {entity.qod} %
      </TableData>
      <TableData flex align="center">
        <Link
          to="results"
          filter={'nvt=' + entity.id}
          textOnly={!links}>
          {entity.results.count}
        </Link>
      </TableData>
      <TableData flex align="center">
        {entity.hosts.count}
      </TableData>
    </TableRow>
  );
};

Row.propTypes = {
  entity: PropTypes.object.isRequired,
  links: PropTypes.bool,
};

const Header = ({
  links = true,
  sort = true,
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          sortby={sort ? 'name' : false}
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead
          width="10em"
          sortby={sort ? 'severity' : false}
          onSortChange={onSortChange}>
          {_('Severity')}
        </TableHead>
        <TableHead
          width="6em"
          sortby={sort ? 'qod' : false}
          onSortChange={onSortChange}>
          {_('QoD')}
        </TableHead>
        <TableHead
          width="6em"
          sortby={sort ? 'results' : false}
          onSortChange={onSortChange}>
          {_('Results')}
        </TableHead>
        <TableHead
          width="6em"
          sortby={sort ? 'hosts' : false}
          onSortChange={onSortChange}>
          {_('Hosts')}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actions: PropTypes.element,
  hideColumns: PropTypes.object,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};
export default createEntitiesTable({
  emptyTitle: _('No Vulnerabilites available'),
  header: Header,
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
