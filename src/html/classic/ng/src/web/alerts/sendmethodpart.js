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

import _ from '../../locale.js';
import {select_save_id} from '../../utils.js';

import Layout from '../layout.js';
import {render_options} from '../render.js';

import Select2 from '../form/select2.js';
import FormGroup from '../form/formgroup.js';
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
      <Layout flex="column" box grow="1">
        <FormGroup title={_('Send to host')}>
          <TextField
            name="send_host"
            value={send_host}
            size="30"
            maxLength="256"
            onChange={this.onValueChange}/>
          <Layout flex box>
            {_('on port')}
          </Layout>
          <TextField
            name="send_port"
            value={send_port}
            maxLength="6"
            size="6"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Report')}>
          <Select2
            name="send_report_format"
            value={send_report_format}
            onChange={this.onValueChange}>
            {send_report_format_opts}
          </Select2>
        </FormGroup>
      </Layout>
    );
  }
}

export default SendMethodPart;

// vim: set ts=2 sw=2 tw=80:
