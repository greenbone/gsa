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
import {select_save_id, is_defined} from '../../utils.js';

import Layout from '../layout.js';
import {render_options} from '../render.js';

import CredentialsDialog from '../credentials/dialog.js';

import Select2 from '../form/select2.js';
import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import TextArea from '../form/textarea.js';
import FormPart from '../form/formpart.js';

import NewIcon from '../icons/newicon.js';

export class ScpMethodPart extends FormPart {

  constructor(props) {
    super(props, 'method_data');

    this.onAddCredential = this.onAddCredential.bind(this);
  }

  defaultState() {
    let {report_formats = [], data = {}} = this.props;

    return {
      credentials: data.credentials,
      scp_path: is_defined(data.scp_path) ? data.scp_path : 'report.xml',
      scp_credential: select_save_id(data.credentials, data.scp_credential),
      scp_report_format: select_save_id(report_formats, data.scp_report_format),
      scp_host: data.scp_host,
      scp_known_hosts: data.scp_known_hosts,
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
    this.setState({scp_credential: credential.id, credentials});
    this.notify();
  }

  render() {
    let {scp_credential, scp_host, scp_known_hosts, scp_path, scp_report_format,
    credentials = []} = this.state;
    let {report_formats = []} = this.props;

    let scp_credential_opts = render_options(credentials);
    let scp_report_format_opts = render_options(report_formats);
    return (
      <Layout flex="column" box grow="1">
        <FormGroup title={_('Credential')}>
          <Select2
            name="scp_credential"
            value={scp_credential}
            onChange={this.onValueChange}>
            {scp_credential_opts}
          </Select2>
          <Layout flex box>
            <NewIcon
              title={_('Create a credential')}
              onClick={() => { this.credentials_dialog.show(['up']); }}/>
          </Layout>
        </FormGroup>

        <FormGroup title={_('Host')}>
          <TextField
            grow="1"
            name="scp_host"
            value={scp_host}
            onChange={this.onValueChange}
            maxLength="256"/>
        </FormGroup>

        <FormGroup title={_('Known Hosts')}>
          <TextArea
            rows="3" cols="50"
            name="scp_known_hosts"
            value={scp_known_hosts}
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Path')}>
          <TextField
            name="scp_path"
            value={scp_path}
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Report')}>
          <Select2
            name="scp_report_format"
            value={scp_report_format}
            onChange={this.onValueChange}>
            {scp_report_format_opts}
          </Select2>
        </FormGroup>

        <CredentialsDialog onSave={this.props.onAddCredential}
          ref={ref => this.credentials_dialog = ref}/>
      </Layout>
    );
  }
}

ScpMethodPart.propTypes = {
  credentials: React.PropTypes.array,
};

export default ScpMethodPart;

// vim: set ts=2 sw=2 tw=80:
