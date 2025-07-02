/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/TableRow';
import {createEntitiesFooter} from 'web/entities/Footer';
import {withEntitiesHeader} from 'web/entities/Header';
import {createEntitiesTable} from 'web/entities/Table';
import withRowDetails from 'web/entities/withRowDetails';
import DfnCertAdvDetails from 'web/pages/dfncert/Details';
import DfnCertAdvRow from 'web/pages/dfncert/Row';
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
          sortBy={sort ? 'name' : false}
          title={_('Name')}
          width="13%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'title' : false}
          title={_('Title')}
          width="62%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'created' : false}
          title={_('Created')}
          width="15%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'cves' : false}
          title={_('CVEs')}
          width="2%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'severity' : false}
          title={_('Severity')}
          width="8%"
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
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const DfnCertAdvsHeader = withEntitiesHeader(true)(Header);

const DfnCertAdvsFooter = createEntitiesFooter({
  span: 10,
  download: 'dfncerts.xml',
});

export default createEntitiesTable({
  emptyTitle: _l('No DFN-CERT Advisories available'),
  row: DfnCertAdvRow,
  rowDetails: withRowDetails('dfncert')(DfnCertAdvDetails),
  header: DfnCertAdvsHeader,
  footer: DfnCertAdvsFooter,
});
