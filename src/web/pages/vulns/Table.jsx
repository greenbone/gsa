/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import {createEntitiesTable} from 'web/entities/Table';
import withEntitiesHeader from 'web/entities/withEntitiesHeader';
import VulnsRow from 'web/pages/vulns/Row';
import PropTypes from 'web/utils/PropTypes';

const Header = ({
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
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'name' : false}
          title={_('Name')}
          width="40%"
          onSortChange={onSortChange}
        />
        {hideColumns.oldest !== true && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'oldest' : false}
            title={_('Oldest Result')}
            width="15%"
            onSortChange={onSortChange}
          />
        )}
        {hideColumns.oldest !== true && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'newest' : false}
            title={_('Newest Result')}
            width="15%"
            onSortChange={onSortChange}
          />
        )}
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'severity' : false}
          title={_('Severity')}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'qod' : false}
          title={_('QoD')}
          width="4%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'results' : false}
          title={_('Results')}
          width="5%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'hosts' : false}
          title={_('Hosts')}
          width="5%"
          onSortChange={onSortChange}
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
