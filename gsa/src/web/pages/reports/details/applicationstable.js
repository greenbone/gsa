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

import SeverityBar from 'web/components/bar/severitybar';

import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';

import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import CpeIcon from 'web/components/icon/cpeicon';

import {createEntitiesTable} from 'web/entities/table';

import PropTypes from 'web/utils/proptypes';

const Header = ({currentSortBy, currentSortDir, sort = true, onSortChange}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}
          title={_('Application CPE')}
        />
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hosts' : false}
          onSortChange={onSortChange}
          title={_('Hosts')}
        />
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'occurrences' : false}
          onSortChange={onSortChange}
          title={_('Occurrences')}
        />
        <TableHead
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          width="10%"
          onSortChange={onSortChange}
          title={_('Severity')}
        />
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  links: PropTypes.bool,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const Row = ({entity, links = true, onToggleDetailsClick, ...props}) => {
  const {name, hosts, occurrences, severity} = entity;
  return (
    <TableRow>
      <TableData>
        <span>
          <DetailsLink type="cpe" id={name} textOnly={!links}>
            <IconDivider>
              <CpeIcon name={name} />
              <span>{name}</span>
            </IconDivider>
          </DetailsLink>
        </span>
      </TableData>
      <TableData>{hosts.count}</TableData>
      <TableData>{occurrences.total}</TableData>
      <TableData>
        <SeverityBar severity={severity} />
      </TableData>
    </TableRow>
  );
};

Row.propTypes = {
  entity: PropTypes.shape({
    hosts: PropTypes.object.isRequired,
    occurrences: PropTypes.shape({
      total: PropTypes.number,
    }),
    id: PropTypes.string,
    name: PropTypes.string,
    severity: PropTypes.any,
  }).isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default createEntitiesTable({
  emptyTitle: _l('No Applications available'),
  row: Row,
  header: Header,
});

// vim: set ts=2 sw=2 tw=80:
