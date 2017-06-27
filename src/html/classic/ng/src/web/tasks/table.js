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

import _ from '../../locale.js';

import PropTypes from '../proptypes.js';

import {createEntitiesFooter} from '../entities/footer.js';
import {withEntitiesHeader} from '../entities/header.js';
import {createEntitiesTable} from '../entities/table.js';

import TableHead from '../components/table/head.js';
import TableHeader from '../components/table/header.js';
import TableRow from '../components/table/row.js';

import Row from './row.js';

const Header = ({onSortChange, links = true, sort = true, actions}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          rowSpan="2"
          sortby={sort ? 'name' : false}
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead
          rowSpan="2"
          width="10em"
          sortby={sort ? 'status' : false}
          onSortChange={onSortChange}>
          {_('Status')}
        </TableHead>
        <TableHead colSpan="2">{_('Reports')}</TableHead>
        <TableHead
          rowSpan="2"
          width="10em"
          sortby={sort ? 'severity' : false}
          onSortChange={onSortChange}>
          {_('Severity')}
        </TableHead>
        <TableHead
          rowSpan="2"
          width="6em"
          sortby={sort ? 'trend' : false}
          onSortChange={onSortChange}>
          {_('Trend')}
        </TableHead>
        {actions &&
          <TableHead rowSpan="2" width="10em">{_('Actions')}</TableHead>
        }
      </TableRow>
      <TableRow>
        <TableHead
          sortby={sort ? 'total' : false}
          onSortChange={onSortChange}>
          {_('Total')}
        </TableHead>
        <TableHead
          sortby={sort ? 'last' : false}
          onSortChange={onSortChange}>
          {_('Last')}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actions: PropTypes.element,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

export default createEntitiesTable({
  emptyTitle: _('No Tasks available'),
  row: Row,
  header: withEntitiesHeader(Header),
  footer: createEntitiesFooter({
    span: 10,
    trash: true,
    download: 'tasks.xml',
  }),
});

// vim: set ts=2 sw=2 tw=80:
