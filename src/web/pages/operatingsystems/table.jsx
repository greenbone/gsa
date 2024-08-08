/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import {createEntitiesFooter} from 'web/entities/footer';
import {createEntitiesTable} from 'web/entities/table';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import OsRow from './row';

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
          width="24%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
        <TableHead
          width="19%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'title' : false}
          onSortChange={onSortChange}
          title={_('Title')}
        />
        <TableHead width="24%" colSpan="3">
          {_('Severity')}
        </TableHead>
        <TableHead width="10%" colSpan="2">
          {_('Hosts')}
        </TableHead>
        <TableHead
          width="15%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'modified' : false}
          onSortChange={onSortChange}
          title={_('Modified')}
        />
        {isDefined(actionsColumn) ? (
          actionsColumn
        ) : (
          <TableHead rowSpan="2" width="5em" align="center">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>
      <TableRow>
        <TableHead
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'latest_severity' : false}
          onSortChange={onSortChange}
          title={_('Latest')}
        />
        <TableHead
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'highest_severity' : false}
          onSortChange={onSortChange}
          title={_('Highest')}
        />
        <TableHead
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'average_severity' : false}
          onSortChange={onSortChange}
          title={_('Average')}
        />
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'all_hosts' : false}
          onSortChange={onSortChange}
          title={_('All')}
        />
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'hosts' : false}
          onSortChange={onSortChange}
          title={_('Best OS')}
        />
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

// vim: set ts=2 sw=2 tw=80:
