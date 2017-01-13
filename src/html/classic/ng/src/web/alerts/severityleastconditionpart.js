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

import Spinner from '../form/spinner.js';
import Radio from '../form/radio.js';
import RadioSelectFormPart from '../form/radioselectformpart.js';

const VALUE = 'Severity at least';

export class SeverityLeastConditionPart extends RadioSelectFormPart {

  constructor(props) {
    super(props, 'condition_data');
  }

  defaultState(...args) {
    let {data = {}} = this.props;

    return {
      severity: is_defined(data.severity) ? data.severity : 0.1,
    };
  }

  render() {
    let {severity} = this.state;
    let {value} = this.props;
    return (
      <Layout flex box>
        <Radio title={_('Severity at least')}
          value={VALUE}
          checked={value === VALUE}
          name="condition"
          onChange={this.onCheckedChange}>
        </Radio>
        <Spinner
          value={severity}
          name="severity"
          type="float"
          min="0"
          size="5"
          onChange={this.onValueChange}/>
      </Layout>
    );
  }
}

export default SeverityLeastConditionPart;

// vim: set ts=2 sw=2 tw=80:
