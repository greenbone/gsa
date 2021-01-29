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

import {createEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import PropTypes from 'web/utils/proptypes';

import OverrideDetails from './details';
import Row from './row';

const Header = ({
  links = true,
  sort = true,
  currentSortBy,
  currentSortDir,
  actionsColumn,
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          width="19%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'text' : false}
          onSortChange={onSortChange}
          title={_('Text')}
        />
        <TableHead
          width="30%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'nvt' : false}
          onSortChange={onSortChange}
          title={_('NVT')}
        />
        <TableHead
          width="12%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hosts' : false}
          onSortChange={onSortChange}
          title={_('Hosts')}
        />
        <TableHead
          width="12%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'port' : false}
          onSortChange={onSortChange}
          title={_('Location')}
        />
        <TableHead
          width="9%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
          title={_('From')}
        />
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          width="8%"
          sortBy={sort ? 'newSeverity' : false}
          onSortChange={onSortChange}
          title={_('To')}
        />
        <TableHead
          width="4%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'active' : false}
          onSortChange={onSortChange}
          title={_('Active')}
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

export default createEntitiesTable({
  emptyTitle: _l('No Overrides available'),
  row: Row,
  rowDetails: withRowDetails('override', 8)(OverrideDetails),
  header: withEntitiesHeader()(Header),
  footer: createEntitiesFooter({
    span: 10,
    trash: true,
    download: 'overrides.xml',
  }),
});

// vim: set ts=2 sw=2 tw=80:
