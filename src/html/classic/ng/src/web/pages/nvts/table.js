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

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';

import {createEntitiesFooter} from '../../entities/footer.js';
import {withEntitiesHeader} from '../../entities/header.js';
import {createEntitiesTable} from '../../entities/table.js';

import Icon from '../../components/icon/icon.js';

import Sort from '../../components/sortby/sortby.js';

import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import NvtRow from './row.js';

const Header = ({onSortChange, links = true, sort = true, actions = true}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          width="30em"
          sortby={sort ? 'name' : false}
          onSortChange={onSortChange}>
          {_('Name')}
        </TableHead>
        <TableHead
          width="20em"
          sortby={sort ? 'family' : false}
          onSortChange={onSortChange}>
          {_('Family')}
        </TableHead>
        <TableHead
          width="15em"
          sortby={sort ? 'created' : false}
          onSortChange={onSortChange}>
          {_('Created')}
        </TableHead>
        <TableHead
          width="15em"
          sortby={sort ? 'modified' : false}
          onSortChange={onSortChange}>
          {_('Modified')}
        </TableHead>
        <TableHead
          width="10em"
          sortby={sort ? 'version' : false}
          onSortChange={onSortChange}>
          {_('Version')}
        </TableHead>
        <TableHead
          sortby={sort ? 'cve' : false}
          onSortChange={onSortChange}>
          {_('CVE')}
        </TableHead>
        <TableHead width="5em">
          <Layout flex align="center">
            {sort ?
              <Sort by="solution_type" onClick={onSortChange}>
                <Icon title={_('Solution type')} img="solution_type.svg"/>
              </Sort> :
              <Icon title={_('Solution type')} img="solution_type.svg"/>
            }
          </Layout>
        </TableHead>
        <TableHead
          width="10em"
          sortby={sort ? 'severity' : false}
          onSortChange={onSortChange}>
          {_('Severity')}
        </TableHead>
        <TableHead
          width="6em"
          sortby={sort ? 'qod' : false}
          onSortChange={onSortChange}>
          {_('QoD')}
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

const NvtsHeader = withEntitiesHeader(Header, true);

const NvtsFooter = createEntitiesFooter({
  span: 10,
  download: 'nvts.xml',
});

export const NvtsTable = createEntitiesTable({
  emptyTitle: _('No NVTs available'),
  row: NvtRow,
  header: NvtsHeader,
  footer: NvtsFooter,
});

export default NvtsTable;

// vim: set ts=2 sw=2 tw=80:
