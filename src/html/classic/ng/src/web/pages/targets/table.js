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

import {createEntitiesFooter} from '../../entities/footer.js';
import {withEntitiesHeader} from '../../entities/header.js';
import {createEntitiesTable} from '../../entities/table.js';
import withRowDetails from '../../entities/withRowDetails.js';

import Select2 from '../../components/form/select2.js';
import Text from '../../components/form/text.js';

import Sort from '../../components/sortby/sortby.js';

import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import TargetDetails from './details.js';
import TargetRow from './row.js';

const Header = ({
    actions,
    filter,
    links = true,
    sort = true,
    onSortChange,
  }) => {

  let select_sort = 'ssh_credential';
  let sort_by = filter ? filter.getSortBy() : undefined;

  if (sort_by === 'smb_credential' ||
    sort_by === 'esxi_credential' ||
    sort_by === 'snmp_credential') {
    select_sort = sort_by;
  }
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
        <TableHead flex>
          <Text>
            <Sort by={sort ? select_sort : false} onClick={onSortChange}>
              {_('Credentials')}
            </Sort>
          </Text>
          {sort !== false &&
            <Select2
              value={select_sort}
              onChange={onSortChange}>
              <option value="ssh_credential">{_('SSH')}</option>
              <option value="smb_credential">{_('SMB')}</option>
              <option value="esxi_credential">{_('ESXi')}</option>
              <option value="snmp_credential">{_('SNMP')}</option>
            </Select2>
          }
        </TableHead>
        {actions}
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actions: PropTypes.element,
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
  emptyTitle: _('No targets available'),
  row: TargetRow,
  header: TargetsHeader,
  footer: Footer,
  rowDetails: withRowDetails('target', 10)(TargetDetails),
});

// vim: set ts=2 sw=2 tw=80:
