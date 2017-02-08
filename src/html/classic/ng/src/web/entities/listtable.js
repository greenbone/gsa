/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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
import {has_value} from '../../utils.js';

import FootNote from '../footnote.js';
import Pagination from '../pagination.js';
import Layout from '../layout.js';

import StrippedTable from '../table/stripped.js';

export const EntitiesListTable = props => {
  let {filter, header, footer, rows, counts, emptyTitle} = props;

  let filterstring = filter ? filter.toFilterString() : '';

  if (!has_value(rows)) {
    return <div className="entities-table">{_('Loading')}</div>;
  }

  if (rows.length === 0) {
    return <div className="entities-table">{emptyTitle}</div>;
  }

  let pagination = (
    <Pagination
      counts={counts}
      onFirstClick={props.onFirstClick}
      onLastClick={props.onLastClick}
      onNextClick={props.onNextClick}
      onPreviousClick={props.onPreviousClick}/>
  );

  return (
    <div className="entities-table">
      {pagination}
      <StrippedTable header={header} footer={footer}>
        {rows}
      </StrippedTable>
      <Layout flex align="space-between">
        <FootNote>
          {_('(Applied filter: {{filter}})', {filter: filterstring})}
        </FootNote>
        {pagination}
      </Layout>
    </div>
  );
};

EntitiesListTable.propTypes = {
  emptyTitle: React.PropTypes.string,
  filter: React.PropTypes.object,
  header: React.PropTypes.node,
  footer: React.PropTypes.node,
  rows: React.PropTypes.node,
  counts: React.PropTypes.object,
  onFirstClick: React.PropTypes.func,
  onLastClick: React.PropTypes.func,
  onPreviousClick: React.PropTypes.func,
  onNextClick: React.PropTypes.func,
};

export default EntitiesListTable;

// vim: set ts=2 sw=2 tw=80:
