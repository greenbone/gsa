/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_l} from 'gmp/locale/lang';
import useTranslation from 'web/hooks/useTranslation';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import {createEntitiesFooter} from 'web/entities/footer';
import {createEntitiesTable} from 'web/entities/table';

import ComplianceState from 'web/components/label/compliancestate';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import AuditReportRow from './auditreportrow';

const Header = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  const [_] = useTranslation();
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          width="25%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'date' : false}
          onSortChange={onSortChange}
          title={_('Date')}
        />
        <TableHead
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'status' : false}
          onSortChange={onSortChange}
          title={_('Status')}
        />
        <TableHead
          width="33%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'task' : false}
          onSortChange={onSortChange}
          title={_('Task')}
        />
        <TableHead
          width="11%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'compliant' : false}
          onSortChange={onSortChange}
          title={_('Compliant')}
        />
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'compliance_yes' : false}
          onSortChange={onSortChange}
          title={_('Compliant')}
        >
          <ComplianceState.Yes />
        </TableHead>
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'compliance_no' : false}
          onSortChange={onSortChange}
          title={_('Not Compliant')}
        >
          <ComplianceState.No />
        </TableHead>
        <TableHead
          width="5%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'compliance_incomplete' : false}
          onSortChange={onSortChange}
          title={_('Incomplete')}
        >
          <ComplianceState.Incomplete />
        </TableHead>
        {isDefined(actionsColumn) ? (
          actionsColumn
        ) : (
          <TableHead width="8%" align="center">
            {_('Actions')}
          </TableHead>
        )}
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
  span: 10,
  delete: true,
});

export default createEntitiesTable({
  emptyTitle: _l('No reports available'),
  header: Header,
  footer: Footer,
  row: AuditReportRow,
  toggleDetailsIcon: false,
});