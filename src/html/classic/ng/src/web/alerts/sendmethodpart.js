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
import {select_save_id} from '../../utils.js';

import {render_options} from '../render.js';

import Select2 from '../form/select2.js';
import FormGroup from '../form/formgroup.js';
import FormItem from '../form/formitem.js';
import TextField from '../form/textfield.js';
import FormPart from '../form/formpart.js';

export class SendMethodPart extends FormPart {

  constructor(props) {
    super(props, 'method_part');
  }

  defaultState() {
    let {report_formats = [], data = {}} = this.props;
    return {
      send_report_format: select_save_id(report_formats,
        data.send_report_format),
      send_port: data.send_port,
      send_host: data.send_host,
    };
  }

  componentWillMount() {
    this.notify();
  }

  render() {
    let {send_report_format, send_port, send_host} = this.state;
    let {report_formats} = this.props;

    let send_report_format_opts = render_options(report_formats);
    return (
      <div>
        <FormGroup title={_('Send to host')}>
          <FormItem>
            <TextField
              name="send_host"
              value={send_host}
              size="30"
              maxLength="256"
              onChange={this.onValueChange}/>
          </FormItem>
          <FormItem>
            {_('on port')}
          </FormItem>
          <FormItem>
            <TextField
              name="send_port"
              value={send_port}
              maxLength="6"
              size="6"
              onChange={this.onValueChange}/>
          </FormItem>
        </FormGroup>

        <FormGroup title={_('Report')}>
          <Select2
            name="send_report_format"
            value={send_report_format}
            onChange={this.onValueChange}>
            {send_report_format_opts}
          </Select2>
        </FormGroup>
      </div>
    );
  }
}

export default SendMethodPart;

// vim: set ts=2 sw=2 tw=80:
