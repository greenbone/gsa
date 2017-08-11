/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
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
// import withRowDetails from '../../entities/withRowDetails.js';

import NewIcon from '../../components/icon/newicon.js';

import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

// import AppDetails from './details.js';
import AppRow from './row.js';

const Header = ({onSortChange, links = true, sort = true, actions = true,
                 hideColumns = {}}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          sortby={sort ? 'name' : false}
          onSortChange={onSortChange}>
          {_('Application CPE')}
        </TableHead>
        <TableHead
          sortby={sort ? 'hosts' : false}
          onSortChange={onSortChange}>
          {_('Hosts')}
        </TableHead>
        <TableHead
          sortby={sort ? 'occurrences' : false}
          onSortChange={onSortChange}>
          {_('Occurrences')}
        </TableHead>
        <TableHead
          width="10em"
          sortby={sort ? 'severity' : false}
          onSortChange={onSortChange}>
          {_('Severity')}
        </TableHead>
        {actions ? actions : null}
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

const AppsHeader = withEntitiesHeader()(Header);

const Footer = ({onTargetCreateFromSelection, selectionType, ...props}) => {
  return (
    <EntitiesFooter {...props} selectionType={selectionType}>
    </EntitiesFooter>
  );
};

Footer.propTypes = {
  selectionType: PropTypes.string,
  onTargetCreateFromSelection: PropTypes.func.isRequired,
};


const AppsFooter = withEntitiesFooter({
  span: 7,
  delete: true,
  download: 'hosts.xml',
})(Footer);

export const AppsTable = createEntitiesTable({
  emptyTitle: _('No apps available'),
  row: AppRow,
/*  rowDetails: withRowDetails('app', 10)(AppDetails), */
  header: AppsHeader,
  footer: AppsFooter,
});

export default AppsTable;

// vim: set ts=2 sw=2 tw=80:
