/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import SeverityBar from '../../components/bar/severitybar.js';

import OsIcon from '../../components/icon/osicon.js';

import DetailsLink from '../../components/link/detailslink.js';
import Link from '../../components/link/link.js';

import TableData from '../../components/table/data.js';
import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import {createEntitiesTable} from '../../entities/table.js';

const Header = ({
  currentSortBy,
  currentSortDir,
  sort = true,
  onSortChange,
}) => (
  <TableHeader>
    <TableRow>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'ip' : false}
        onSortChange={onSortChange}
      >
        {_('IP Address')}
      </TableHead>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'hostname' : false}
        onSortChange={onSortChange}
      >
        {_('Hostname')}
      </TableHead>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'os' : false}
        width="5em"
        onSortChange={onSortChange}
      >
        {_('OS')}
      </TableHead>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'high' : false}
        width="10%"
        onSortChange={onSortChange}
      >
        {_('High')}
      </TableHead>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'medium' : false}
        width="10%"
        onSortChange={onSortChange}
      >
        {_('Medium')}
      </TableHead>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'low' : false}
        width="10%"
        onSortChange={onSortChange}
      >
        {_('Low')}
      </TableHead>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'log' : false}
        width="10%"
        onSortChange={onSortChange}
      >
        {_('Log')}
      </TableHead>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'false_positive' : false}
        width="10%"
        onSortChange={onSortChange}
      >
        {_('False Positive')}
      </TableHead>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'total' : false}
        width="10%"
        onSortChange={onSortChange}
      >
        {_('Total')}
      </TableHead>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'severity' : false}
        width="10%"
        onSortChange={onSortChange}
      >
        {_('Severity')}
      </TableHead>
    </TableRow>
  </TableHeader>
);

Header.propTypes = {
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const Row = ({
  entity,
  links = true,
}) => {
  const {ip, details = {}, result_counts = {}, severity, asset = {}} = entity;
  const {best_os_cpe, best_os_txt} = details;
  return (
    <TableRow>
      <TableData>
        {isDefined(asset.id) ?
          <DetailsLink
            type="host"
            id={asset.id}
            textOnly={!links}
          >
            {ip}
          </DetailsLink> :
          <Link
            to="hosts"
            filter={'name=' + ip}
            textOnly={!links}
          >
            {ip}
          </Link>
        }
      </TableData>
      <TableData>
        <i>{entity.hostname}</i>
      </TableData>
      <TableData flex align="center">
        <OsIcon
          osCpe={best_os_cpe}
          osTxt={best_os_txt}
        />
      </TableData>
      <TableData flex align="center">
        {result_counts.hole}
      </TableData>
      <TableData flex align="center">
        {result_counts.warning}
      </TableData>
      <TableData flex align="center">
        {result_counts.info}
      </TableData>
      <TableData flex align="center">
        {result_counts.log}
      </TableData>
      <TableData flex align="center">
        {result_counts.false_positive}
      </TableData>
      <TableData flex align="center">
        {result_counts.total}
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
  emptyTitle: _('No Hosts available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
