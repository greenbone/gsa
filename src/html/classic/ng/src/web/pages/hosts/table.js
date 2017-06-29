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

import SelectionType from '../../utils/selectiontype.js';

import EntitiesFooter, {withEntitiesFooter} from '../../entities/footer.js';
import {withEntitiesHeader} from '../../entities/header.js';
import {createEntitiesTable} from '../../entities/table.js';

import NewIcon from '../../components/icon/newicon.js';

import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import HostRow from './row.js';

const Header = ({onSortChange, links = true, sort = true, actions = true}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          sortby={sort ? 'name' : false}
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead
          sortby={sort ? 'hostname' : false}
          onSortChange={onSortChange}>
          {_('Hostname')}
        </TableHead>
        <TableHead
          sortby={sort ? 'ip' : false}
          onSortChange={onSortChange}>
          {_('IP Address')}
        </TableHead>
        <TableHead
          width="5em"
          sortby={sort ? 'os' : false}
          onSortChange={onSortChange}>
          {_('OS')}
        </TableHead>
        <TableHead
          width="10em"
          sortby={sort ? 'severity' : false}
          onSortChange={onSortChange}>
          {_('Severity')}
        </TableHead>
        <TableHead
          width="20em"
          sortby={sort ? 'modified' : false}
          onSortChange={onSortChange}>
          {_('Modified')}
        </TableHead>
        {actions}
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

const HostsHeader = withEntitiesHeader(Header);

const Footer = ({onCreateTargetSelection, selectionType, ...props}) => {
  let title;
  if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
    title = _('Create Target from page contents');
  }
  else if (selectionType === SelectionType.SELECTION_USER) {
    title = _('Create Target from selection');
  }
  else {
    title = _('Create Target form all filtered');
  }
  return (
    <EntitiesFooter {...props} selectionType={selectionType}>
      <NewIcon
        title={title}
        onClick={onCreateTargetSelection}/>
    </EntitiesFooter>
  );
};

Footer.propTypes = {
  selectionType: PropTypes.string,
  onCreateTargetSelection: PropTypes.func,
};


const HostsFooter = withEntitiesFooter(Footer, {
  span: 7,
  delete: true,
  download: 'hosts.xml',
});

export const HostsTable = createEntitiesTable({
  emptyTitle: _('No hosts available'),
  row: HostRow,
  header: HostsHeader,
  footer: HostsFooter,
});

export default HostsTable;

// vim: set ts=2 sw=2 tw=80:
