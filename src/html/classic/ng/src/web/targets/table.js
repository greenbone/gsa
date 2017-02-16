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

import {createEntitiesFooter} from '../entities/footer.js';
import {withEntitiesHeader} from '../entities/header.js';
import {createEntitiesTable} from '../entities/table.js';

import TableHead from '../table/head.js';
import TableHeader from '../table/header.js';
import TableRow from '../table/row.js';

import TargetRow from './row.js';

const Header = ({onSortChange, links = true, sort = true, actions}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          sortby={sort ? 'name' : false}
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead
          sortby={sort ? 'hosts' : false}
          onSortChange={onSortChange}>
          {_('Hosts')}
        </TableHead>
        <TableHead
          sortby={sort ? 'ips' : false}
          onSortChange={onSortChange}>
          {_('IPs')}
        </TableHead>
        <TableHead
          sortby={sort ? 'port_list' : false}
          onSortChange={onSortChange}>
          {_('Port List')}
        </TableHead>
        <TableHead>
          {_('Credentials')}
        </TableHead>
        {actions}
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actions: React.PropTypes.element,
  links: React.PropTypes.bool,
  sort: React.PropTypes.bool,
  onSortChange: React.PropTypes.func,
};

const TargetsHeader = withEntitiesHeader(Header);

const Footer = createEntitiesFooter({
  span: 6,
  trash: true,
  download: 'targets.xml',
});

export const TargetsTable = createEntitiesTable({
  emptyTitle: _('No targets available'),
  row: TargetRow,
  header: TargetsHeader,
  footer: Footer,
});

export default TargetsTable;

// vim: set ts=2 sw=2 tw=80:
