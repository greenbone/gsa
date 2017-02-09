/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from '../../locale.js';

import PropTypes from '../proptypes.js';
import {LabelHigh, LabelMedium, LabelLow, LabelLog, LabelFalsePositive
} from '../severityclasslabels.js';

import EntitiesFooter from '../entities/footer.js';
import {createEntitiesTable} from '../entities/table.js';

import TableHead from '../table/head.js';
import TableHeader from '../table/header.js';
import TableRow from '../table/row.js';

import ReportRow from './row.js';

const Header = ({onSortChange, links = true, sort = true, actions = true}) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead rowSpan="2"
          sortby={sort ? 'date' : false}
          onSortChange={onSortChange}>
          {_('Date')}
        </TableHead>
        <TableHead rowSpan="2" width="10em"
          sortby={sort ? 'status' : false}
          onSortChange={onSortChange}>
          {_('Status')}
        </TableHead>
        <TableHead rowSpan="2"
          sortby={sort ? 'task' : false}
          onSortChange={onSortChange}>
          {_('Task')}
        </TableHead>
        <TableHead rowSpan="2" width="10em"
          sortby={sort ? 'severity' : false}
          onSortChange={onSortChange}>
          {_('Severity')}
        </TableHead>
        <TableHead colSpan="5">{_('Scan Results')}</TableHead>
        {actions &&
          <TableHead rowSpan="2" width="5em">{_('Actions')}</TableHead>
        }
      </TableRow>
      <TableRow>
        <TableHead width="5em"
          sortby={sort ? 'high' : false}
          onSortChange={onSortChange}>
          <LabelHigh/>
        </TableHead>
        <TableHead width="5em"
          sortby={sort ? 'medium' : false}
          onSortChange={onSortChange}>
          <LabelMedium/>
        </TableHead>
        <TableHead width="5em"
          sortby={sort ? 'low' : false}
          onSortChange={onSortChange}>
          <LabelLow/>
        </TableHead>
        <TableHead width="5em"
          sortby={sort ? 'log' : false}
          onSortChange={onSortChange}>
          <LabelLog/>
        </TableHead>
        <TableHead width="5em"
          sortby={sort ? 'false_positive' : false}
          onSortChange={onSortChange}>
          <LabelFalsePositive/>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

Header.propTypes = {
  actions: PropTypes.componentOrFalse,
  links: React.PropTypes.bool,
  sort: React.PropTypes.bool,
  onSortChange: React.PropTypes.func,
};

const Footer = ({onDeleteBulk, ...props}) => {
  return (
    <EntitiesFooter
      {...props}
      span={10}
      delete
      onDeleteClick={onDeleteBulk}
      />
  );
};

Footer.propTypes = {
  onDeleteBulk: React.PropTypes.func,
};

export const ReportsTable = createEntitiesTable({
  emptyTitle: _('No reports available'),
  header: Header,
  footer: Footer,
  row: ReportRow,
});

export default ReportsTable;

// vim: set ts=2 sw=2 tw=80:
