/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import SeverityClassLabel from 'web/components/label/SeverityClass';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import {createEntitiesFooter} from 'web/entities/Footer';
import {createEntitiesTable} from 'web/entities/Table';
import ReportRow from 'web/pages/reports/Row';
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
          sortBy={sort ? 'date' : false}
          title={_('Date')}
          width="25%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'status' : false}
          title={_('Status')}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'task' : false}
          title={_('Task')}
          width="39%"
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
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'high' : false}
          title={_('High')}
          width="3%"
          onSortChange={onSortChange}
        >
          <SeverityClassLabel.High />
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'medium' : false}
          title={_('Medium')}
          width="3%"
          onSortChange={onSortChange}
        >
          <SeverityClassLabel.Medium />
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'low' : false}
          title={_('Low')}
          width="3%"
          onSortChange={onSortChange}
        >
          <SeverityClassLabel.Low />
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'log' : false}
          title={_('Log')}
          width="3%"
          onSortChange={onSortChange}
        >
          <SeverityClassLabel.Log />
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'false_positive' : false}
          title={_('False Positive')}
          width="3%"
          onSortChange={onSortChange}
        >
          <SeverityClassLabel.FalsePositive />
        </TableHead>
        {isDefined(actionsColumn) ? (
          actionsColumn
        ) : (
          <TableHead align="center" width="8%">
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
  row: ReportRow,
  toggleDetailsIcon: false,
});
