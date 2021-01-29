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

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import {createEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';

import PropTypes from 'web/utils/proptypes';

import VulnsRow from './row';

const Header = ({
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  actionsColumn,
  hideColumns = {},
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          width="40%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
        {hideColumns.oldest !== true && (
          <TableHead
            width="15%"
            currentSortDir={currentSortDir}
            currentSortBy={currentSortBy}
            sortBy={sort ? 'oldest' : false}
            onSortChange={onSortChange}
            title={_('Oldest Result')}
          />
        )}
        {hideColumns.oldest !== true && (
          <TableHead
            width="15%"
            currentSortDir={currentSortDir}
            currentSortBy={currentSortBy}
            sortBy={sort ? 'newest' : false}
            onSortChange={onSortChange}
            title={_('Newest Result')}
          />
        )}
        <TableHead
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
          title={_('Severity')}
        />
        <TableHead
          width="4%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'qod' : false}
          onSortChange={onSortChange}
          title={_('QoD')}
        />
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'results' : false}
          onSortChange={onSortChange}
          title={_('Results')}
        />
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hosts' : false}
          onSortChange={onSortChange}
          title={_('Hosts')}
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
  hideColumns: PropTypes.object,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const VulnsHeader = withEntitiesHeader(true)(Header);

const Footer = createEntitiesFooter({
  span: 8,
  download: 'vulnerabilities.xml',
});

export const VulnsTable = createEntitiesTable({
  emptyTitle: _l('No Vulnerabilities available'),
  header: VulnsHeader,
  footer: Footer,
  row: VulnsRow,
  toggleDetailsIcon: false,
});

export default VulnsTable;

// vim: set ts=2 sw=2 tw=80:
