/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import  _ from '../../locale.js';

import Layout from '../layout.js';

import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';

import FilterDialog from '../powerfilter/dialog.js';

const SORT_FIELDS = [
  ['name', _('Name')],
  ['status', _('Status')],
  ['total', _('Reports: Total')],
  ['last', _('Reports: Last')],
  ['severity', _('Severity')],
  ['trend', _('Trend')],
];

export class TaskFilterDialog extends FilterDialog {

  getSortFields() {
    return SORT_FIELDS;
  }

  renderFilter() {
    let {filterstring} = this.state;
    return (
      <FormGroup title={_('Name')} flex>
        <TextField
          grow="1"
          value={filterstring} size="30"
          onChange={this.onFilterStringChange}
          maxLength="80"/>
      </FormGroup>
    );
  }

  renderContent() {
    return (
      <Layout flex="column">
        {this.renderFilter()}
        {this.renderApplyOverrides()}
        {this.renderQoD()}
        {this.renderFirstResult()}
        {this.renderResultsPerPage()}
        {this.renderSortBy()}
      </Layout>
    );
  }
}

export default TaskFilterDialog;

// vim: set ts=2 sw=2 tw=80:
