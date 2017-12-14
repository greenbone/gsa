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

import SelectionType from '../../utils/selectiontype.js';

import EntitiesFooter, {withEntitiesFooter} from '../../entities/footer.js';
import {withEntitiesHeader} from '../../entities/header.js';
import {createEntitiesTable} from '../../entities/table.js';
import withRowDetails from '../../entities/withRowDetails.js';

import NewIcon from '../../components/icon/newicon.js';

import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import HostDetails from './details.js';
import HostRow from './row.js';

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
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hostname' : false}
          onSortChange={onSortChange}>
          {_('Hostname')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'ip' : false}
          onSortChange={onSortChange}>
          {_('IP Address')}
        </TableHead>
        <TableHead
          width="5em"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'os' : false}
          onSortChange={onSortChange}>
          {_('OS')}
        </TableHead>
        <TableHead
          width="10em"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}>
          {_('Severity')}
        </TableHead>
        <TableHead
          width="20em"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'modified' : false}
          onSortChange={onSortChange}>
          {_('Modified')}
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
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const HostsHeader = withEntitiesHeader()(Header);

const Footer = ({
  entities,
  entitiesSelected,
  filter,
  selectionType,
  onTargetCreateFromSelection,
  ...props
}) => {
  let title;
  let has_selected;
  let value;
  if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
    title = _('Create Target from page contents');
    has_selected = entities.length > 0;
    value = {
      entities,
      filter,
      selectionType,
    };
  }
  else if (selectionType === SelectionType.SELECTION_USER) {
    title = _('Create Target from selection');
    has_selected = is_defined(entitiesSelected) && entitiesSelected.size > 0;
    value = {
      entitiesSelected,
      selectionType,
    };
  }
  else {
    title = _('Create Target form all filtered');
    value = {
      entities,
      filter,
      selectionType,
    };
    has_selected = true;
  }
  return (
    <EntitiesFooter {...props} selectionType={selectionType}>
      <NewIcon
        active={has_selected}
        title={title}
        value={value}
        onClick={onTargetCreateFromSelection}/>
    </EntitiesFooter>
  );
};

Footer.propTypes = {
  entities: PropTypes.array.isRequired,
  entitiesSelected: PropTypes.set,
  filter: PropTypes.filter.isRequired,
  selectionType: PropTypes.string,
  onTargetCreateFromSelection: PropTypes.func.isRequired,
};

const HostsFooter = withEntitiesFooter({
  span: 7,
  delete: true,
  download: 'hosts.xml',
})(Footer);

export const HostsTable = createEntitiesTable({
  emptyTitle: _('No hosts available'),
  row: HostRow,
  rowDetails: withRowDetails('host', 10)(HostDetails),
  header: HostsHeader,
  footer: HostsFooter,
});

export default HostsTable;

// vim: set ts=2 sw=2 tw=80:
