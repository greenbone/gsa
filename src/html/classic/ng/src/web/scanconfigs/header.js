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

import  _ from '../../locale.js';

import PropTypes from '../proptypes.js';

import TableHead from '../table/head.js';
import TableHeader from '../table/header.js';
import TableRow from '../table/row.js';

const Header = ({
    actions = true,
    links = true,
    sort = true,
    onSortChange,
  }) => {
  return (
    <TableHeader>

      <TableRow>
        <TableHead rowSpan="2"
          sortby={sort ? 'name' : false}
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead colSpan="2">{_('Familiy')}</TableHead>
        <TableHead colSpan="2">{_('NVTs')}</TableHead>
        {actions &&
          <TableHead rowSpan="2" width="6em">{_('Actions')}</TableHead>
        }
      </TableRow>

      <TableRow>
        <TableHead
          width="6em"
          sortby={sort ? 'families_total' : false}
          onSortChange={onSortChange}>
          {_('Total')}
        </TableHead>
        <TableHead
          width="6em"
          sortby={sort ? 'families_trend' : false}
          onSortChange={onSortChange}>
          {_('Trend')}
        </TableHead>

        <TableHead
          width="6em"
          sortby={sort ? 'nvts_total' : false}
          onSortChange={onSortChange}>
          {_('Total')}
        </TableHead>
        <TableHead
          width="6em"
          sortby={sort ? 'nvts_trend' : false}
          onSortChange={onSortChange}>
          {_('Trend')}
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

export default Header;

// vim: set ts=2 sw=2 tw=80:
