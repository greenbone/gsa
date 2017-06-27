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
import {createEntitiesTable} from '../entities/table.js';

import TableHead from '../components/table/head.js';
import TableHeader from '../components/table/header.js';
import TableRow from '../components/table/row.js';

import OsRow from './row.js';

const Header = ({onSortChange, links = true, sort = true, actions = true}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead rowSpan="2"
          sortby={sort ? 'name' : false}
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead rowSpan="2"
          sortby={sort ? 'title' : false}
          onSortChange={onSortChange}>
          {_('Title')}
        </TableHead>
        <TableHead colSpan="3">{_('Severity')}</TableHead>
        <TableHead rowSpan="2"
          sortby={sort ? 'hosts' : false}
          onSortChange={onSortChange}>
          {_('Hosts')}
        </TableHead>
        <TableHead rowSpan="2"
          sortby={sort ? 'modified' : false}
          onSortChange={onSortChange}>
          {_('Modified')}
        </TableHead>
        {actions &&
          <TableHead rowSpan="2" width="5em">{_('Actions')}</TableHead>
        }
      </TableRow>
      <TableRow>
        <TableHead
          sortby={sort ? 'latest_severity' : false}
          onSortChange={onSortChange}>
          {_('Latest')}
        </TableHead>
        <TableHead
          sortby={sort ? 'highest_severity' : false}
          onSortChange={onSortChange}>
          {_('Highest')}
        </TableHead>
        <TableHead
          sortby={sort ? 'average_severity' : false}
          onSortChange={onSortChange}>
          {_('Avarage')}
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

const Footer = createEntitiesFooter({
  span: 8,
  delete: true,
  download: 'os.xml',
});

export const OsTable = createEntitiesTable({
  emptyTitle: _('No results available'),
  header: Header,
  footer: Footer,
  row: OsRow,
});

export default OsTable;

// vim: set ts=2 sw=2 tw=80:
