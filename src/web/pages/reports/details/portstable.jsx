/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';

import SeverityBar from 'web/components/bar/severitybar';

import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import {createEntitiesTable} from 'web/entities/table';

const Header = ({currentSortBy, currentSortDir, sort = true, onSortChange}) => (
  <TableHeader>
    <TableRow>
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'name' : false}
        onSortChange={onSortChange}
        title={_('Port')}
      />
      <TableHead
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'hosts' : false}
        onSortChange={onSortChange}
        title={_('Hosts')}
      />
      <TableHead
        width="10%"
        currentSortDir={currentSortDir}
        currentSortBy={currentSortBy}
        sortBy={sort ? 'severity' : false}
        onSortChange={onSortChange}
        title={_('Severity')}
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

const Row = ({entity}) => {
  const {hosts, id, severity} = entity;
  return (
    <TableRow>
      <TableData>{id}</TableData>
      <TableData>{hosts.count}</TableData>
      <TableData>
        <SeverityBar severity={severity} />
      </TableData>
    </TableRow>
  );
};

Row.propTypes = {
  entity: PropTypes.object.isRequired,
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No Ports available'),
  row: Row,
});

// vim: set ts=2 sw=2 tw=80:
