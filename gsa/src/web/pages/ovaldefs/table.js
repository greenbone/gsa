/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {_, _l} from 'gmp/locale/lang';

import PropTypes from '../../utils/proptypes.js';

import {createEntitiesFooter} from '../../entities/footer.js';
import {withEntitiesHeader} from '../../entities/header.js';
import {createEntitiesTable} from '../../entities/table.js';
import withRowDetails from '../../entities/withRowDetails.js';

import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import OvaldefDetails from './details.js';
import OvaldefRow from './row.js';

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
          width="30%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sorty={sort ? 'name' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
        <TableHead
          width="10%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'version' : false}
          onSortChange={onSortChange}
          title={_('Version')}
        />
        <TableHead
          width="10%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'status' : false}
          onSortChange={onSortChange}
          title={_('Status')}
        />
        <TableHead
          width="10%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'class' : false}
          onSortChange={onSortChange}
          title={_('Class')}
        />
        <TableHead
          width="15%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'created' : false}
          onSortChange={onSortChange}
          title={_('Created')}
        />
        <TableHead
          width="15%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'modified' : false}
          onSortChange={onSortChange}
          title={_('Modified')}
        />
        <TableHead
          width="2%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'cves' : false}
          onSortChange={onSortChange}
          title={_('CVEs')}
        />
        <TableHead
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
          title={_('Severity')}
        />
        {actionsColumn}
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

const OvaldefsHeader = withEntitiesHeader(true)(Header);

const OvaldefsFooter = createEntitiesFooter({
  span: 10,
  download: 'ovaldefs.xml',
});

export const OvaldefsTable = createEntitiesTable({
  body: false,
  doubleRow: true,
  emptyTitle: _l('No OVAL Definitions available'),
  row: OvaldefRow,
  rowDetails: withRowDetails('ovaldef', 10)(OvaldefDetails),
  header: OvaldefsHeader,
  footer: OvaldefsFooter,
});

export default OvaldefsTable;

// vim: set ts=2 sw=2 tw=80:
