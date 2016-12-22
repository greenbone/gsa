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
import FilterDialog from '../filterdialog.js';

import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';

export class TaskFilterDialog extends FilterDialog {

  renderSortFieldOptions() {
    return [
      <option key="name" value="name">{_('Name')}</option>,
      <option key="status" value="status">{_('Status')}</option>,
      <option key="total" value="total">{_('Reports: Total')}</option>,
      <option key="last" value="last">{_('Reports: Last')}</option>,
      <option key="severity" value="severity">{_('Severity')}</option>,
      <option key="trend" value="trend">{_('Trend')}</option>,
    ];
  }

  renderContent() {
    let {filterstring} = this.state;

    return (
      <Layout flex="column">
        <FormGroup title={_('Name')} flex>
          <TextField name="name"
            value={filterstring} size="30"
            onChange={this.onFilterStringChange}
            maxLength="80"/>
        </FormGroup>
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
