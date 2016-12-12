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

import Spinner from '../form/spinner.js';
import Select2 from '../form/select2.js';
import FormGroup from '../form/formgroup.js';
import FormItem from '../form/formitem.js';
import TextField from '../form/textfield.js';
import YesNoRadio from '../form/yesnoradio.js';
import {RadioInline} from '../form/radio.js';

export class TaskFilterDialog extends FilterDialog {

  renderContent() {
    let {filter, filterstring, sort_field, sort_order} = this.state;
    let apply_overrides = filter.get('apply_overrides');
    let first = filter.get('first');
    let rows = filter.get('rows');
    let min_qod = filter.get('min_qod');

    let sort_field_opts = [
      <option key="name" value="name">{_('Name')}</option>,
      <option key="status" value="status">{_('Status')}</option>,
      <option key="total" value="total">{_('Reports: Total')}</option>,
      <option key="last" value="last">{_('Reports: Last')}</option>,
      <option key="severity" value="severity">{_('Severity')}</option>,
      <option key="trend" value="trend">{_('Trend')}</option>,
    ];

    return (
      <Layout flex="column">
        <FormGroup title={_('Name')} flex>
          <TextField name="name"
            value={filterstring} size="30"
            onChange={this.onFilterStringChange}
            maxLength="80"/>
        </FormGroup>
        <FormGroup title={_('Apply Overrides')} flex>
          <YesNoRadio
            value={apply_overrides}
            name="apply_overrides"
            onChange={this.onFilterValueChange}/>
        </FormGroup>
        <FormGroup title={_('QoD')} flex>
          <FormItem>
            {_('must be at least')}
          </FormItem>
          <FormItem>
            <Spinner
              type="int"
              name="min_qod"
              min="0" max="100"
              step="1"
              value={min_qod}
              size="1"
              onChange={this.onFilterValueChange}/>
          </FormItem>
        </FormGroup>
        <FormGroup title={_('First result')} flex>
          <Spinner type="int" name="first"
            value={first}
            size="5"
            onChange={this.onFilterValueChange}/>
        </FormGroup>
        <FormGroup title={_('Results per page')} flex>
          <Spinner type="int" name="rows"
            value={rows}
            size="5"
            onChange={this.onFilterValueChange}/>
        </FormGroup>
        <FormGroup title={_('Sort by')} flex>
          <FormItem>
            <Select2
              name="sort_field"
              value={sort_field}
              onChange={this.onSortFieldChange}>
              {sort_field_opts}
            </Select2>
          </FormItem>
          <FormItem>
            <RadioInline
              name="sort_order"
              value="sort"
              checked={sort_order === 'sort'}
              title={_('Ascending')}
              onChange={this.onSortOrderChange}/>
            <RadioInline
              name="sort_order"
              value="sort-reverse"
              checked={sort_order === 'sort-reverse'}
              title={_('Descending')}
              onChange={this.onSortOrderChange}/>
          </FormItem>
        </FormGroup>
      </Layout>
    );
  }
}

export default TaskFilterDialog;

// vim: set ts=2 sw=2 tw=80:
