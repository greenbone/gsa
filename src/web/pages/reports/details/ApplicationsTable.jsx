/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import SeverityBar from 'web/components/bar/SeverityBar';
import CpeIcon from 'web/components/icon/CpeIcon';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import PropTypes from 'web/utils/PropTypes';

const Header = ({currentSortBy, currentSortDir, sort = true, onSortChange}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'name' : false}
          title={_('Application CPE')}
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'hosts' : false}
          title={_('Hosts')}
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'occurrences' : false}
          title={_('Occurrences')}
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'severity' : false}
          title={_('Severity')}
          width="10%"
          onSortChange={onSortChange}
        />
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const Row = ({entity, links = true}) => {
  const {name, hosts, occurrences, severity} = entity;
  return (
    <TableRow>
      <TableData>
        <span>
          <DetailsLink id={name} textOnly={!links} type="cpe">
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
};

export default createEntitiesTable({
  emptyTitle: _l('No Applications available'),
  row: Row,
  header: Header,
});
