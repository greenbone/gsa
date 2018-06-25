/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';

import {createEntitiesFooter} from '../../entities/footer.js';
import {createEntitiesTable} from '../../entities/table.js';

import SeverityClassLabel from '../../components/label/severityclass.js';

import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import ReportRow from './row.js';

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
          rowSpan="2"
          width="25%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'date' : false}
          onSortChange={onSortChange}>
          {_('Date')}
        </TableHead>
        <TableHead
          rowSpan="2"
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'status' : false}
          onSortChange={onSortChange}>
          {_('Status')}
        </TableHead>
        <TableHead
          width="39%"
          rowSpan="2"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'task' : false}
          onSortChange={onSortChange}>
          {_('Task')}
        </TableHead>
        <TableHead
          rowSpan="2"
          width="8%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'severity' : false}
          onSortChange={onSortChange}>
          {_('Severity')}
        </TableHead>
        <TableHead
          width="25%"
          colSpan="5"
        >
          {_('Scan Results')}
        </TableHead>
        {is_defined(actionsColumn) ?
          actionsColumn :
          <TableHead rowSpan="2" width="5em">{_('Actions')}</TableHead>
        }
      </TableRow>
      <TableRow>
        <TableHead
          width="4%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'high' : false}
          onSortChange={onSortChange}>
          <SeverityClassLabel.High/>
        </TableHead>
        <TableHead
          width="4%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'medium' : false}
          onSortChange={onSortChange}>
          <SeverityClassLabel.Medium/>
        </TableHead>
        <TableHead
          width="4%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'low' : false}
          onSortChange={onSortChange}>
          <SeverityClassLabel.Low/>
        </TableHead>
        <TableHead
          width="4%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'log' : false}
          onSortChange={onSortChange}>
          <SeverityClassLabel.Log/>
        </TableHead>
        <TableHead
          width="4%"
          currentSortDir={currentSortDir}
          currentSortBy={currentSortBy}
          sortBy={sort ? 'false_positive' : false}
          onSortChange={onSortChange}>
          <SeverityClassLabel.FalsePositive/>
        </TableHead>
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
  emptyTitle: _('No reports available'),
  header: Header,
  footer: Footer,
  row: ReportRow,
  toggleDetailsIcon: false,
});

// vim: set ts=2 sw=2 tw=80:
