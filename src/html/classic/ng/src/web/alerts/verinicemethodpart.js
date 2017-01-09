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
import {select_save_id, first, is_defined} from '../../utils.js';

import {render_options} from '../render.js';

import CredentialsDialog from '../credentials/dialog.js';

import Select2 from '../form/select2.js';
import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import FormItem from '../form/formitem.js';
import FormPart from '../form/formpart.js';

import Icon from '../icons/icon.js';

function select_report_id(report_formats, report_id) {
  if (is_defined(report_id)) {
    for (let format of report_formats) {
      if (format.id === report_id) {
        return format.id;
      }
    }
  }
  else {
    for (let format of report_formats) {
      if (format.name === 'Verinice ISM') {
        return format.id;
      }
    }
  }
  return first(report_formats).id;
}

export class VeriniceMethodPart extends FormPart {

  constructor(props) {
    super(props, 'method_data');

    this.onAddCredential = this.onAddCredential.bind(this);
  }

  defaultState() {
    let {report_formats = [], data = {}} = this.props;

    report_formats = report_formats.filter(
      format => format.extension === 'vna');

    return {
      credentials: data.credentials,
      report_formats,
      verinice_server_credential: select_save_id(data.credentials,
        data.verinice_server_credential),

      verinice_server_report_format: select_report_id(
        report_formats, data.verinice_server_report_format),
      verinice_server_url: data.verinice_server_url,
    };
  }

  componentWillMount() {
    this.notify();
  }

  componentWillReceiveProps(props) {
    // should not be necessary but add it to be save for possible future changes
    let {data = {}} = props;
    this.setState({credentials: data.credentials});
  }

  onAddCredential(credential) {
    let {credentials = []} = this.state;
    credentials.push(credential);

    this.setState({verinice_server_credential: credential.id, credentials});
    this.notify();
  }

  render() {
    let {verinice_server_url, verinice_server_credential,
      verinice_server_report_format, report_formats, credentials,
    } = this.state;

    let verinice_credential_opts = render_options(credentials);
    let verinice_report_format_opts = render_options(
      report_formats.filter(format => format.extension === 'vna'));
    return (
      <div>
        <FormGroup title={_('verinice.PRO URL')}>
          <TextField
            size="30" maxLength="256"
            name="verinice_server_url"
            value={verinice_server_url}
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Credential')}>
          <FormItem>
            <Select2
              name="verinice_server_credential"
              value={verinice_server_credential}
              onChange={this.onValueChange}>
              {verinice_credential_opts}
            </Select2>
          </FormItem>
          <FormItem>
            <Icon img="new.svg"
              title={_('Create a credential')}
              onClick={() => { this.credentials_dialog.show(['up']); }}/>
          </FormItem>
        </FormGroup>

        <FormGroup title={_('verinice.PRO Report')}>
          <Select2
            name="verinice_server_report_format"
            value={verinice_server_report_format}
            onChange={this.onValueChange}>
            {verinice_report_format_opts}
          </Select2>
        </FormGroup>

        <CredentialsDialog onSave={this.onAddCredential}
          ref={ref => this.credentials_dialog = ref}/>
      </div>
    );
  }
}

VeriniceMethodPart.propTypes = {
  credentials: React.PropTypes.array,
};

export default VeriniceMethodPart;

// vim: set ts=2 sw=2 tw=80:
