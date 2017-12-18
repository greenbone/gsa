/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import {createEntitiesFooter} from '../../entities/footer.js';
import {withEntitiesHeader} from '../../entities/header.js';
import {createEntitiesTable} from '../../entities/table.js';
import withRowDetails from '../../entities/withRowDetails.js';

import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import Row from './row.js';
import TaskDetails from './details.js';

const Header = ({
  actionsColumn,
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  const sortProps = {
    currentSortBy,
    currentSortDir,
    sort,
    onSortChange,
  };
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          {...sortProps}
          rowSpan="2"
          sortBy="name"
        >
          {_('Name')}
        </TableHead>
        <TableHead
          {...sortProps}
          rowSpan="2"
          width="10em"
          sortBy="status"
        >
          {_('Status')}
        </TableHead>
        <TableHead colSpan="2">{_('Reports')}</TableHead>
        <TableHead
          {...sortProps}
          rowSpan="2"
          width="10em"
          sortBy="severity"
        >
          {_('Severity')}
        </TableHead>
        <TableHead
          {...sortProps}
          rowSpan="2"
          width="6em"
          sortBy="trend"
        >
          {_('Trend')}
        </TableHead>
        {actionsColumn}
      </TableRow>
      <TableRow>
        <TableHead
          {...sortProps}
          sortBy="total"
        >
          {_('Total')}
        </TableHead>
        <TableHead
          {...sortProps}
          sortBy="last"
        >
          {_('Last')}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actionsColumn: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const actionsColumn = (
  <TableHead rowSpan="2" width="10em">{_('Actions')}</TableHead>
);

export default createEntitiesTable({
  emptyTitle: _('No Tasks available'),
  row: Row,
  rowDetails: withRowDetails('task', 10)(TaskDetails),
  header: withEntitiesHeader(actionsColumn)(Header),
  footer: createEntitiesFooter({
    span: 10,
    trash: true,
    download: 'tasks.xml',
  }),
});

// vim: set ts=2 sw=2 tw=80:
