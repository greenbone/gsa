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

import {isDefined} from 'gmp/utils/identity';

import DetailsLink from 'web/components/link/detailslink';

import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import {createEntitiesTable} from 'web/entities/table';

import PropTypes from 'web/utils/proptypes';

const Header = ({currentSortDir, currentSortBy, sort = true, onSortChange}) => (
  <TableHeader>
    <TableRow>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'error' : false}
        onSortChange={onSortChange}
        title={_('Error Message')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'host' : false}
        onSortChange={onSortChange}
        title={_('Host')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'hostname' : false}
        onSortChange={onSortChange}
        title={_('Hostname')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'nvt' : false}
        onSortChange={onSortChange}
        title={_('NVT')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'port' : false}
        onSortChange={onSortChange}
        title={_('Port')}
      />
    </TableRow>
  </TableHeader>
);

Header.propTypes = {
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const Row = ({entity, links = true}) => {
  const {nvt, host, port, description} = entity;
  return (
    <TableRow>
      <TableData>{description}</TableData>
      <TableData>
        {isDefined(host.id) ? (
          <span>
            <DetailsLink type="host" id={host.id} textOnly={!links}>
              {host.ip}
            </DetailsLink>
          </span>
        ) : (
          host.ip
        )}
      </TableData>
      <TableData>
        <i>{host.name}</i>
      </TableData>
      <TableData>
        <span>
          <DetailsLink type="nvt" id={nvt.id} textOnly={!links}>
            {nvt.name}
          </DetailsLink>
        </span>
      </TableData>
      <TableData>{port}</TableData>
    </TableRow>
  );
};

Row.propTypes = {
  entity: PropTypes.object.isRequired,
  links: PropTypes.bool,
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No Errors available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
