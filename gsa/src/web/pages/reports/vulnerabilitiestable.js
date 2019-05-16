/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {_, _l} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';

import {createEntitiesTable} from 'web/entities/table';

import SeverityBar from 'web/components/bar/severitybar';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

const Row = ({entity, links = true, ...other}) => {
  return (
    <TableRow>
      <TableData>
        <span>
          <DetailsLink type="nvt" id={entity.id} textOnly={!links}>
            {entity.name}
          </DetailsLink>
        </span>
      </TableData>
      <TableData align="center">
        <SeverityBar severity={entity.severity} />
      </TableData>
      <TableData align="center">{entity.qod.value} %</TableData>
      <TableData align="center">
        <Link to="results" filter={'nvt=' + entity.id} textOnly={!links}>
          {entity.results.count}
        </Link>
      </TableData>
      <TableData align="center">{entity.hosts.count}</TableData>
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
          onSortChange={onSortChange}
          title={_('Name')}
        />
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          width="10em"
          onSortChange={onSortChange}
          title={_('Severity')}
        />
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'qod' : false}
          width="6em"
          onSortChange={onSortChange}
          title={_('QoD')}
        />
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'results' : false}
          width="6em"
          onSortChange={onSortChange}
          title={_('Results')}
        />
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hosts' : false}
          width="6em"
          onSortChange={onSortChange}
          title={_('Hosts')}
        />
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
  emptyTitle: _l('No Vulnerabilites available'),
  header: Header,
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
