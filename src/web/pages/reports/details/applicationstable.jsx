/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {_, _l} from 'gmp/locale/lang';
import React from 'react';
import SeverityBar from 'web/components/bar/severitybar';
import CpeIcon from 'web/components/icon/cpeicon';
import IconDivider from 'web/components/layout/icondivider';
import DetailsLink from 'web/components/link/detailslink';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';
import {createEntitiesTable} from 'web/entities/table';
import PropTypes from 'web/utils/proptypes';

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
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default createEntitiesTable({
  emptyTitle: _l('No Applications available'),
  row: Row,
  header: Header,
});

// vim: set ts=2 sw=2 tw=80:
