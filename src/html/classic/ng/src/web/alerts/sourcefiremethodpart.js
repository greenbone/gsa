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

import {translate as _} from '../../locale.js';
import {is_defined} from '../../utils.js';

import Spinner from '../form/spinner.js';
import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import FileField from '../form/filefield.js';
import FormPart from '../form/formpart.js';

export class SourcefireMethodPart extends FormPart {

  constructor(props) {
    super(props, 'method_part');
  }

  defaultState() {
    let {data = {}} = this.props;

    return {
      defense_center_port: is_defined(data.defense_center_port) ?
        data.defense_center_port : '8307',
      defense_center_ip: data.defense_center_ip,
      pkcs12: data.pkcs12,
    };
  }

  componentWillMount() {
    this.notify();
  }

  render() {
    let {defense_center_ip, defense_center_port, pkcs12} = this.state;

    return (
      <div>
        <FormGroup title={_('Defense Center IP')}>
          <TextField
            size="30" maxLength="40"
            name="defense_center_ip"
            value={defense_center_ip}
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Defense Center Port')}>
          <Spinner
            name="defense_center_port"
            value={defense_center_port}
            onChange={this.onValueChange}
            type="int"
            max="65535"
            min="0"/>
        </FormGroup>

        <FormGroup title={_('PKCS12 file')}>
          <FileField
            name="pkcs12"
            value={pkcs12}
            onChange={this.onValueChange}/>
        </FormGroup>
      </div>
    );
  }
}

export default SourcefireMethodPart;

// vim: set ts=2 sw=2 tw=80:
