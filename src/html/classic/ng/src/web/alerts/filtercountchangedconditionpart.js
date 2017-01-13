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

import {translate as _} from '../../locale.js';
import {is_defined} from '../../utils.js';

import Layout from '../layout.js';
import {render_options} from '../render.js';

import Select2 from '../form/select2.js';
import Spinner from '../form/spinner.js';
import Radio from '../form/radio.js';
import RadioSelectFormPart from '../form/radioselectformpart.js';

const VALUE = "Filter count changed";

export class FilterCountChangedConditionPart extends RadioSelectFormPart {

  constructor(...args) {
    super(...args);

    this.data_name = 'condition_data';
  }

  defaultState() {
    let {data = {}} = this.props;

    return {
      count: is_defined(data.count) ? data.count : 1,
      filter_id: data.filter_id,
      filters: data.filters,
    };
  }

  componentWillReceiveProps(props) {
    let {data = {}} = props;
    this.setState({filters: data.filters});
  }

  render() {
    let {filter_id, count, filters = []} = this.state;
    let {value} = this.props;

    let filter_opts = render_options(filters);
    return (
      <Layout flex box>
        <Radio title={_('Filter')}
          value={VALUE}
          checked={value === VALUE}
          name="condition"
          onChange={this.onCheckedChange}/>
        <Select2
          value={filter_id}
          name="filter_id"
          onChange={this.onValueChange}>
          {filter_opts}
        </Select2>
        <Layout flex box>
          {_('matches at least')}
        </Layout>
        <Spinner
          value={count}
          name="count"
          type="int"
          min="0" size="5"
          onChange={this.onValueChange}/>
        <Layout flex box>
          {_('result(s) more then previous scan')}
        </Layout>
      </Layout>
    );
  }
}

export default FilterCountChangedConditionPart;

// vim: set ts=2 sw=2 tw=80:
