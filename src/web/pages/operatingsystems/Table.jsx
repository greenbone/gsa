/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import TableHeader from 'web/components/table/Header';
import TableHead from 'web/components/table/TableHead';
import TableRow from 'web/components/table/TableRow';
import {createEntitiesFooter} from 'web/entities/Footer';
import {createEntitiesTable} from 'web/entities/Table';
import OsRow from 'web/pages/operatingsystems/Row';
import PropTypes from 'web/utils/PropTypes';

const Header = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'name' : false}
          title={_('Name')}
          width="24%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'title' : false}
          title={_('Title')}
          width="19%"
          onSortChange={onSortChange}
        />
        <TableHead colSpan="3" width="24%">
          {_('Severity')}
        </TableHead>
        <TableHead colSpan="2" width="10%">
          {_('Hosts')}
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan="2"
          sortBy={sort ? 'modified' : false}
          title={_('Modified')}
          width="15%"
          onSortChange={onSortChange}
        />
        {isDefined(actionsColumn) ? (
          actionsColumn
        ) : (
          <TableHead align="center" rowSpan="2" width="5em">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'latest_severity' : false}
          title={_('Latest')}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'highest_severity' : false}
          title={_('Highest')}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'average_severity' : false}
          title={_('Average')}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'all_hosts' : false}
          title={_('All')}
          width="5%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'hosts' : false}
          title={_('Best OS')}
          width="5%"
          onSortChange={onSortChange}
        />
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actionsColumn: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const Footer = createEntitiesFooter({
  span: 9,
  delete: true,
  download: 'os.xml',
});

export const OsTable = createEntitiesTable({
  emptyTitle: _l('No results available'),
  header: Header,
  footer: Footer,
  row: OsRow,
});

export default OsTable;
