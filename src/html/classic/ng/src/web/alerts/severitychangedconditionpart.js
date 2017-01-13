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

import Select2 from '../form/select2.js';
import Radio from '../form/radio.js';
import RadioSelectFormPart from '../form/radioselectformpart.js';

const VALUE = 'Severity changed';

export class SeverityChangedConditionPart extends RadioSelectFormPart {

  constructor(...args) {
    super(...args);

    this.data_name = 'condition_data';
  }

  defaultState() {
    let {data = {}} = this.props;
    return {
      direction: is_defined(data.direction) ? data.direction : 'changed',
    };
  }

  render() {
    let {direction} = this.state;
    let {value} = this.props;
    return (
      <Layout flex box>
        <Radio title={_('Severity Level')}
          value={VALUE}
          name="condition"
          checked={value === VALUE}
          onChange={this.onCheckedChange}>
        </Radio>
        <Select2
          value={direction}
          name="direction"
          onChange={this.onValueChange}>
          <option value="changed">{_('changed')}</option>
          <option value="increased">{_('increased')}</option>
          <option value="decreased">{_('decreased')}</option>
        </Select2>
      </Layout>
    );
  }
}

export default SeverityChangedConditionPart;

// vim: set ts=2 sw=2 tw=80:
