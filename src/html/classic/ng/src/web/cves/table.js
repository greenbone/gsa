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

import PropTypes from '../utils/proptypes.js';

import {createEntitiesFooter} from '../entities/footer.js';
import {withEntitiesHeader} from '../entities/header.js';
import {createEntitiesTable} from '../entities/table.js';

import TableHead from '../components/table/head.js';
import TableHeader from '../components/table/header.js';
import TableRow from '../components/table/row.js';

import CveRow from './row.js';

const Header = ({onSortChange, links = true, sort = true, actions = true}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          width="15em"
          sortby={sort ? 'name' : false}
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead
          sortby={sort ? 'vector' : false}
          onSortChange={onSortChange}>
          {_('Vector')}
        </TableHead>
        <TableHead
          sortby={sort ? 'complexity' : false}
          onSortChange={onSortChange}>
          {_('Complexity')}
        </TableHead>
        <TableHead
          sortby={sort ? 'authentication' : false}
          onSortChange={onSortChange}>
          {_('Authentication')}
        </TableHead>
        <TableHead
          sortby={sort ? 'confidentiality_impact' : false}
          onSortChange={onSortChange}>
          {_('Confidentiality Impact')}
        </TableHead>
        <TableHead
          sortby={sort ? 'integrity_impact' : false}
          onSortChange={onSortChange}>
          {_('Integrity Impact')}
        </TableHead>
        <TableHead
          sortby={sort ? 'availability_impact' : false}
          onSortChange={onSortChange}>
          {_('Availability Impact')}
        </TableHead>
        <TableHead
          width="15em"
          sortby={sort ? 'published' : false}
          onSortChange={onSortChange}>
          {_('Published')}
        </TableHead>
        <TableHead
          width="10em"
          sortby={sort ? 'severity' : false}
          onSortChange={onSortChange}>
          {_('Severity')}
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

const CvesHeader = withEntitiesHeader(Header, true);

const CvesFooter = createEntitiesFooter({
  span: 10,
  download: 'cves.xml',
});

export const CvesTable = createEntitiesTable({
  body: false,
  emptyTitle: _('No CVEs available'),
  row: CveRow,
  header: CvesHeader,
  footer: CvesFooter,
});

export default CvesTable;

// vim: set ts=2 sw=2 tw=80:
