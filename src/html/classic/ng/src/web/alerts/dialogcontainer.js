/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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
import {is_defined, select_save_id, first} from '../../utils.js';

import Layout from '../layout.js';

import CredentialsDialog from '../credentials/dialog2.js';

import AlertDialog, {DEFAULT_NOTICE_REPORT_FORMAT, DEFAULT_NOTICE_ATTACH_FROMAT,
} from './dialog.js';

export function select_verinice_report_id(report_formats, report_id) {
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


export class AlertDialogContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleCreateAlert = this.handleCreateAlert.bind(this);
    this.handleCreateCredential = this.handleCreateCredential.bind(this);

    this.openScpCredentialDialog = this.openScpCredentialDialog.bind(this);
    this.openVeriniceCredentialDialog = this.openVeriniceCredentialDialog.bind(
      this);

  }

  handleCreateAlert(data) {
    let {gmp} = this.context;
    let {onSave} = this.props;
    let promise = gmp.alert.create(data);

    return promise.then(response => {
      let alert = response.data;
      if (onSave) {
        return onSave(alert);
      }
      return undefined;
    });
  }

  handleCreateCredential(data) {
    let {gmp} = this.context;
    let promise = gmp.credential.create(data);

    let {credentials} = this;

    promise.then(response => {
      let credential = response.data;

      credentials.push(credential);

      this.alert_dialog.setValue('credentials', credentials);

      if (data.type === 'scp') {
        this.alert_dialog.setValue('method_data_scp_credential', credential.id);
      }
      else if (data.type === 'verinice') {
        this.alert_dialog.setValue('method_data_verinice_server_credential',
          credential.id);
      }
    });
  }

  openCredentialDialog(data) {
    this.credentials_dialog.show(data, {
      title: _('Create new Credential'),
    });
  }

  openScpCredentialDialog(types) {
    this.openCredentialDialog({type: 'scp', types});
  }

  openVeriniceCredentialDialog(types) {
    this.openCredentialDialog({type: 'verinice', types});
  }

  show(state, options) {
    let {gmp} = this.context;

    this.credentials = is_defined(state) && is_defined(state.credentials) ?
      state.credentials : [];

    this.alert_dialog.show(state, options);

    gmp.alert.newAlertSettings().then(response => {
      let settings = response.data;
      let {
        credentials = [],
        filters = [],
        report_formats = [],
        tasks = [],
      } = settings;

      this.credentials = credentials;

      let result_filters = filters.filter(filter => filter.type === 'Result');
      let secinfo_filters = filters.filter(filter => filter.type === 'SecInfo');

      let result_filter_id = select_save_id(result_filters);
      let report_format_id = select_save_id(report_formats);

      this.alert_dialog.setValues({
        filters,
        credentials,
        result_filters,
        secinfo_filters,
        condition_data_filters: result_filters,
        condition_data_filter_id: result_filter_id,
        condition_data_at_least_filter_id: result_filter_id,
        method_data_notice_report_format: select_save_id(report_formats,
          DEFAULT_NOTICE_REPORT_FORMAT),
        method_data_notice_attach_format: select_save_id(report_formats,
          DEFAULT_NOTICE_ATTACH_FROMAT),
        method_data_start_task_task: select_save_id(tasks),
        report_formats,
        method_data_scp_credential: select_save_id(credentials),
        method_data_scp_report_format: report_format_id,
        method_data_send_report_format: report_format_id,
        method_data_verinice_server_report_format: select_verinice_report_id(
          report_formats),
        tasks,
      });
    });
  }

  render() {
    return (
      <Layout>
        <AlertDialog
          ref={ref => this.alert_dialog = ref}
          onNewScpCredentialClick={this.openScpCredentialDialog}
          onNewVeriniceCredentialClick={this.openVeriniceCredentialDialog}
          onSave={this.handleCreateAlert}
        />
        <CredentialsDialog
          ref={ref => this.credentials_dialog = ref}
          onSave={this.handleCreateCredential}
        />
      </Layout>
    );
  }
};

AlertDialogContainer.propTypes = {
  onSave: React.PropTypes.func,
};

AlertDialogContainer.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
};

export default AlertDialogContainer;

// vim: set ts=2 sw=2 tw=80:
