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

import Row from './row.js';

const Header = ({onSortChange, links = true, sort = true, actions}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          sortby={sort ? 'text' : false}
          onSortChange={onSortChange}>
          {_('Text')}
        </TableHead>
        <TableHead
          sortby={sort ? 'nvt' : false}
          onSortChange={onSortChange}>
          {_('NVT')}
        </TableHead>
        <TableHead
          sortby={sort ? 'hosts' : false}
          onSortChange={onSortChange}>
          {_('Hosts')}
        </TableHead>
        <TableHead
          sortby={sort ? 'port' : false}
          onSortChange={onSortChange}>
          {_('Location')}
        </TableHead>
        <TableHead
          sortby={sort ? 'active' : false}
          onSortChange={onSortChange}>
          {_('Active')}
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

export default createEntitiesTable({
  emptyTitle: _('No Notes available'),
  row: Row,
  header: withEntitiesHeader(Header),
  footer: createEntitiesFooter({
    span: 10,
    trash: true,
    download: 'hosts.xml',
  }),
});

// vim: set ts=2 sw=2 tw=80:
