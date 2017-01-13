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

import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import FormPart from '../form/formpart.js';

export class HttpMethodPart extends FormPart {

  constructor(props) {
    super(props, 'method_data');
  }

  defaultState() {
    let {data = {}} = this.props;

    return {
      URL: data.URL,
    };
  }

  render() {
    let {URL} = this.state;
    return (
      <FormGroup title={_('HTTP Get URL')}>
        <TextField
          grow="1"
          name="URL"
          maxLength="301"
          value={URL}
          onChange={this.onValueChange}/>
      </FormGroup>
    );
  }
}

export default HttpMethodPart;

// vim: set ts=2 sw=2 tw=80:
