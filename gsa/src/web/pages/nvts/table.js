/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import Layout from 'web/components/layout/layout';

import SolutionTypeSvgIcon from 'web/components/icon/solutiontypesvgicon';

import Sort from 'web/components/sortby/sortby';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import {createEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import PropTypes from 'web/utils/proptypes';

import NvtDetails from './details';
import NvtRow from './row';

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
          width="32%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
        <TableHead
          width="10%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'family' : false}
          onSortChange={onSortChange}
          title={_('Family')}
        />
        <TableHead
          width="10%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'created' : false}
          onSortChange={onSortChange}
          title={_('Created')}
        />
        <TableHead
          width="10%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'modified' : false}
          onSortChange={onSortChange}
          title={_('Modified')}
        />
        <TableHead
          width="18%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'cve' : false}
          onSortChange={onSortChange}
          title={_('CVE')}
        />
        <TableHead width="1%">
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
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
          title={_('Severity')}
        />
        <TableHead
          width="3%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'qod' : false}
          onSortChange={onSortChange}
          title={_('QoD')}
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

const NvtsHeader = withEntitiesHeader(true)(Header);

const NvtsFooter = createEntitiesFooter({
  span: 10,
  download: 'nvts.xml',
});

export const NvtsTable = createEntitiesTable({
  emptyTitle: _l('No NVTs available'),
  row: NvtRow,
  rowDetails: withRowDetails('nvt', 10)(NvtDetails),
  header: NvtsHeader,
  footer: NvtsFooter,
});

export default NvtsTable;

// vim: set ts=2 sw=2 tw=80:
