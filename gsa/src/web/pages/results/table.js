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

import Icon from '../../components/icon/icon.js';

import Layout from '../../components/layout/layout.js';

import Sort from '../../components/sortby/sortby.js';

import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import ResultsRow from './row.js';
import ResultDetails from './details.js';

const Header = ({
  actionsColumn,
  delta = false,
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        {delta &&
          <TableHead
            width="4%"
            rowSpan="2"
            currentSortDir={currentSortDir}
            currentSortBy={currentSortBy}
            sortBy={sort ? 'delta' : false}
            onSortChange={onSortChange}
          >
            {_('Delta')}
          </TableHead>
        }
        <TableHead
          width="45%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'vulnerability' : false}
          onSortChange={onSortChange}
        >
          {_('Vulnerability')}
        </TableHead>
        <TableHead width="2%" rowSpan="2">
          <Layout align="center">
            {sort ?
              <Sort by="solution_type" onClick={onSortChange}>
                <Icon title={_('Solution type')} img="solution_type.svg"/>
              </Sort> :
              <Icon title={_('Solution type')} img="solution_type.svg"/>
            }
          </Layout>
        </TableHead>
        <TableHead
          width="8%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
        >
          {_('Severity')}
        </TableHead>
        <TableHead
          width="3%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'qod' : false}
          onSortChange={onSortChange}
        >
          {_('QoD')}
        </TableHead>
        <TableHead
          colSpan="2"
          width="23%"
        >
          {_('Host')}
        </TableHead>
        <TableHead
          width="9%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'location' : false}
          onSortChange={onSortChange}
        >
          {_('Location')}
        </TableHead>
        <TableHead
          width="10%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'created' : false}
          onSortChange={onSortChange}
        >
          {_('Created')}
        </TableHead>
        {actionsColumn}
      </TableRow>
      <TableRow>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'host' : false}
          onSortChange={onSortChange}
        >
          {_('IP')}
        </TableHead>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hostname' : false}
          onSortChange={onSortChange}
        >
          {_('Name')}
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actionsColumn: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  delta: PropTypes.bool,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

export default createEntitiesTable({
  emptyTitle: _l('No results available'),
  footer: createEntitiesFooter({
    span: 8,
    download: 'results.xml',
  }),
  header: withEntitiesHeader(true)(Header),
  row: ResultsRow,
  rowDetails: withRowDetails('result', 7)(ResultDetails),
});

// vim: set ts=2 sw=2 tw=80:
