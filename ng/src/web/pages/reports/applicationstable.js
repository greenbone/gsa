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

import IconDivider from '../../components/layout/icondivider.js';

import DetailsLink from '../../components/link/detailslink.js';

import TableData from '../../components/table/data.js';
import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import {createEntitiesTable} from '../../entities/table.js';
import CpeIcon from '../../components/icon/cpeicon';

const Header = ({
  currentSortBy,
  currentSortDir,
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
        >
          {_('Application CPE')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hosts' : false}
          onSortChange={onSortChange}>
          {_('Hosts')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'occurrences' : false}
          onSortChange={onSortChange}>
          {_('Occurrences')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          width="10%"
          onSortChange={onSortChange}>
          {_('Severity')}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const Row = ({
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const {name, hosts, occurrences, severity} = entity;
  return (
    <TableRow>
      <TableData>
        <DetailsLink
          type="cpe"
          id={name}
          textOnly={!links}
        >
          <IconDivider>
            <CpeIcon name={name}/>
            <span>{name}</span>
          </IconDivider>
        </DetailsLink>
      </TableData>
      <TableData>
        {hosts.count}
      </TableData>
      <TableData>
        {occurrences.total}
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={severity}/>
      </TableData>
    </TableRow>
  );
};

Row.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default createEntitiesTable({
  emptyTitle: _('No Applications available'),
  row: Row,
  header: Header,
});

// vim: set ts=2 sw=2 tw=80:
