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

import SeverityClassLabel from 'web/components/label/severityclass';

import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import ReportRow from './row';

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
          width="39%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'task' : false}
          onSortChange={onSortChange}
          title={_('Task')}
        />
        <TableHead
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}
          title={_('Severity')}
        />
        <TableHead
          width="3%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'high' : false}
          onSortChange={onSortChange}
          title={_('High')}
        >
          <SeverityClassLabel.High />
        </TableHead>
        <TableHead
          width="3%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'medium' : false}
          onSortChange={onSortChange}
          title={_('Medium')}
        >
          <SeverityClassLabel.Medium />
        </TableHead>
        <TableHead
          width="3%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'low' : false}
          onSortChange={onSortChange}
          title={_('Low')}
        >
          <SeverityClassLabel.Low />
        </TableHead>
        <TableHead
          width="3%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'log' : false}
          onSortChange={onSortChange}
          title={_('Log')}
        >
          <SeverityClassLabel.Log />
        </TableHead>
        <TableHead
          width="3%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'false_positive' : false}
          onSortChange={onSortChange}
          title={_('False Positive')}
        >
          <SeverityClassLabel.FalsePositive />
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
  links: PropTypes.bool,
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

// vim: set ts=2 sw=2 tw=80:
