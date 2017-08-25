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
        sortby={sort ? 'ip' : false}
        onSortChange={onSortChange}>
        {_('IP Address')}
      </TableHead>
      <TableHead
        sortby={sort ? 'hostname' : false}
        onSortChange={onSortChange}>
        {_('Hostname')}
      </TableHead>
      <TableHead
        sortby={sort ? 'os' : false}
        width="5em"
        onSortChange={onSortChange}>
        {_('OS')}
      </TableHead>
      <TableHead
        sortby={sort ? 'high' : false}
        width="10%"
        onSortChange={onSortChange}>
        {_('High')}
      </TableHead>
      <TableHead
        sortby={sort ? 'medium' : false}
        width="10%"
        onSortChange={onSortChange}>
        {_('Medium')}
      </TableHead>
      <TableHead
        sortby={sort ? 'low' : false}
        width="10%"
        onSortChange={onSortChange}>
        {_('Low')}
      </TableHead>
      <TableHead
        sortby={sort ? 'log' : false}
        width="10%"
        onSortChange={onSortChange}>
        {_('Log')}
      </TableHead>
      <TableHead
        sortby={sort ? 'false_positive' : false}
        width="10%"
        onSortChange={onSortChange}>
        {_('False Positive')}
      </TableHead>
      <TableHead
        sortby={sort ? 'total' : false}
        width="10%"
        onSortChange={onSortChange}>
        {_('Total')}
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
  onSortChange: PropTypes.func.isRequired,
};

const Row = ({entity}) => {
  const {details = {}, result_counts = {}, severity} = entity;
  const {best_os_cpe, best_os_txt} = details;
  return (
    <TableRow>
      <TableData>
        {entity.ip}
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
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _('No Tasks available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
