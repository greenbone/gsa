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
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import {createEntitiesFooter} from '../../entities/footer.js';
import {createEntitiesTable} from '../../entities/table.js';
import withRowDetails from '../../entities/withRowDetails.js';

import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import PortListDetails from './details.js';
import Row from './row.js';

const Header = ({
  actionsColumn,
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          rowSpan="2"
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead
          colSpan="3">
          {_('Port Counts')}
        </TableHead>
        {is_defined(actionsColumn) ?
          actionsColumn :
          <TableHead rowSpan="2" width="6em">{_('Actions')}</TableHead>
        }
      </TableRow>
      <TableRow>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'total' : false}
          onSortChange={onSortChange}>
          {_('Total')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'tcp' : false}
          onSortChange={onSortChange}>
          {_('TCP')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'udp' : false}
          onSortChange={onSortChange}>
          {_('UDP')}
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

export default createEntitiesTable({
  emptyTitle: _('No port lists available'),
  row: Row,
  rowDetails: withRowDetails('portlist', 10)(PortListDetails),
  header: Header,
  footer: createEntitiesFooter({
    download: 'portlists.xml',
    span: 6,
    trash: true,
  }),
});

// vim: set ts=2 sw=2 tw=80:
