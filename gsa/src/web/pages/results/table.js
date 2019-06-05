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

import PropTypes from 'web/utils/proptypes';

import {createEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import SolutionTypeSvgIcon from 'web/components/icon/solutiontypesvgicon';

import Layout from 'web/components/layout/layout';

import Sort from 'web/components/sortby/sortby';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import ResultsRow from './row';
import ResultDetails from './details';

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
        {delta && (
          <TableHead
            width="4%"
            rowSpan="2"
            currentSortDir={currentSortDir}
            currentSortBy={currentSortBy}
            sortBy={sort ? 'delta' : false}
            onSortChange={onSortChange}
            title={_('Delta')}
          />
        )}
        <TableHead
          width="45%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'vulnerability' : false}
          onSortChange={onSortChange}
          title={_('Vulnerability')}
        />
        <TableHead width="2%" rowSpan="2">
          <Layout align="center">
            {sort ? (
              <Sort by="solution_type" onClick={onSortChange}>
                <SolutionTypeSvgIcon title={_('Solution type')} />
              </Sort>
            ) : (
              <SolutionTypeSvgIcon title={_('Solution type')} />
            )}
          </Layout>
        </TableHead>
        <TableHead
          width="8%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
          title={_('Severity')}
        />
        <TableHead
          width="3%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'qod' : false}
          onSortChange={onSortChange}
          title={_('QoD')}
        />
        <TableHead colSpan="2" width="23%">
          {_('Host')}
        </TableHead>
        <TableHead
          width="9%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'location' : false}
          onSortChange={onSortChange}
          title={_('Location')}
        />
        <TableHead
          width="10%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'created' : false}
          onSortChange={onSortChange}
          title={_('Created')}
        />
        {actionsColumn}
      </TableRow>
      <TableRow>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'host' : false}
          onSortChange={onSortChange}
          title={_('IP')}
        />
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hostname' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
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
