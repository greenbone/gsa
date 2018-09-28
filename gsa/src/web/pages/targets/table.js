/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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

import {_, _l} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';

import {createEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import Select from 'web/components/form/select';

import Divider from 'web/components/layout/divider';

import Sort from 'web/components/sortby/sortby';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import TargetDetails from './details';
import TargetRow from './row';

const Header = ({
  actionsColumn,
  filter,
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {

  let selectSort = 'ssh_credential';
  const sortBy = filter ? filter.getSortBy() : undefined;

  if (sortBy === 'smb_credential' ||
    sortBy === 'esxi_credential' ||
    sortBy === 'snmp_credential') {
    selectSort = sortBy;
  }
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          width="30%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}
        >
          {_('Name')}
        </TableHead>
        <TableHead
          width="20%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hosts' : false}
          onSortChange={onSortChange}
        >
          {_('Hosts')}
        </TableHead>
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'ips' : false}
          onSortChange={onSortChange}
        >
          {_('IPs')}
        </TableHead>
        <TableHead
          width="15%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'port_list' : false}
          onSortChange={onSortChange}
        >
          {_('Port List')}
        </TableHead>
        <TableHead width="22%">
          <Divider>
            <Sort by={sort ? selectSort : false} onClick={onSortChange}>
              {_('Credentials')}
            </Sort>
            {sort !== false &&
              <Select
                value={selectSort}
                onChange={onSortChange}
              >
                <option value="ssh_credential">{_('SSH')}</option>
                <option value="smb_credential">{_('SMB')}</option>
                <option value="esxi_credential">{_('ESXi')}</option>
                <option value="snmp_credential">{_('SNMP')}</option>
              </Select>
            }
          </Divider>
        </TableHead>
        {actionsColumn}
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actionsColumn: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  filter: PropTypes.filter,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const TargetsHeader = withEntitiesHeader()(Header);

const Footer = createEntitiesFooter({
  span: 6,
  trash: true,
  download: 'targets.xml',
});

export default createEntitiesTable({
  emptyTitle: _l('No targets available'),
  row: TargetRow,
  header: TargetsHeader,
  footer: Footer,
  rowDetails: withRowDetails('target', 10)(TargetDetails),
});

// vim: set ts=2 sw=2 tw=80:
