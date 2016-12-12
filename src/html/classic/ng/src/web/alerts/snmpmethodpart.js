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

import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import FormPart from '../form/formpart.js';

export class SnmpMethodPart extends FormPart {

  constructor(props) {
    super(props, 'method_data');
  }

  defaultState() {
    let {data = {}} = this.props;

    return {
      snmp_community: is_defined(data.snmp_community) ?
        data.snmp_community : 'public',
      snmp_agent: is_defined(data.snmp_agent) ? data.snmp_agent : 'localhost',
      snmp_message: is_defined(data.snmp_message) ? data.snmp_message : '$e',
    };
  }

  componentWillMount() {
    this.notify();
  }

  render() {
    let {snmp_community, snmp_agent, snmp_message} = this.state;

    return (
      <div>
        <FormGroup title={_('Community')}>
          <TextField
            size="30" maxLength="301"
            name="snmp_community"
            value={snmp_community}
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Agent')}>
          <TextField
            size="30" maxLength="301"
            name="snmp_agent"
            value={snmp_agent}
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Message')}>
          <TextField
            size="30" maxLength="301"
            name="snmp_message"
            value={snmp_message}
            onChange={this.onValueChange}/>
        </FormGroup>
      </div>
    );
  }
}

export default SnmpMethodPart;

// vim: set ts=2 sw=2 tw=80:
