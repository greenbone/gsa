/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_, _l} from 'gmp/locale/lang';

import PropTypes from 'web/utils/proptypes';
import {createEntitiesFooter} from 'web/entities/footer';
import {withEntitiesHeader} from 'web/entities/header';
import {createEntitiesTable} from 'web/entities/table';
import withRowDetails from 'web/entities/withRowDetails';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import CpeDetails from './details';
import CpeRow from './row';

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
          width="35%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'name' : false}
          onSortChange={onSortChange}
          title={_('Name')}
        />
        <TableHead
          width="40%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'title' : false}
          onSortChange={onSortChange}
          title={_('Title')}
        />
        <TableHead
          width="15%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'modified' : false}
          onSortChange={onSortChange}
          title={_('Modified')}
        />
        <TableHead
          width="2%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'cves' : false}
          onSortChange={onSortChange}
          title={_('CVEs')}
        />
        <TableHead
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
          title={_('Severity')}
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

const CpesHeader = withEntitiesHeader(true)(Header);

const CpesFooter = createEntitiesFooter({
  span: 10,
  download: 'cpes.xml',
});

export const CpesTable = createEntitiesTable({
  emptyTitle: _l('No CPEs available'),
  row: CpeRow,
  rowDetails: withRowDetails('cpe')(CpeDetails),
  header: CpesHeader,
  footer: CpesFooter,
});

export default CpesTable;

// vim: set ts=2 sw=2 tw=80:
