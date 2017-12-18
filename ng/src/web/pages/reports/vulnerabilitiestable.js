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
        {entity.qod.value} %
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
  currentSortDir,
  currentSortBy,
  links = true,
  sort = true,
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          width="10em"
          onSortChange={onSortChange}>
          {_('Severity')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'qod' : false}
          width="6em"
          onSortChange={onSortChange}>
          {_('QoD')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'results' : false}
          width="6em"
          onSortChange={onSortChange}>
          {_('Results')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hosts' : false}
          width="6em"
          onSortChange={onSortChange}>
          {_('Hosts')}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actions: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
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
