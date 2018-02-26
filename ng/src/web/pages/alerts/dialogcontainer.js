/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_defined, select_save_id, first, shorten} from 'gmp/utils';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';

import CredentialsDialog from '../credentials/dialog.js';

import AlertDialog, {
  ATTACH_MESSAGE_DEFAULT,
  ATTACH_MESSAGE_SECINFO,
  DEFAULT_DEFENSE_CENTER_PORT,
  DEFAULT_DETAILS_URL,
  DEFAULT_DIRECTION,
  DEFAULT_EVENT_STATUS,
  DEFAULT_NOTICE,
  DEFAULT_NOTICE_ATTACH_FORMAT,
  DEFAULT_NOTICE_REPORT_FORMAT,
  DEFAULT_SCP_PATH,
  DEFAULT_SECINFO_TYPE,
  DEFAULT_SEVERITY,
  INCLUDE_MESSAGE_DEFAULT,
  INCLUDE_MESSAGE_SECINFO,
  NOTICE_ATTACH,
  SECINFO_SUBJECT,
  TASK_SUBJECT,
} from './dialog.js';

export function select_verinice_report_id(report_formats, report_id) {
  if (is_defined(report_id)) {
    for (const format of report_formats) {
      if (format.id === report_id) {
        return format.id;
      }
    }
  }
  else {
    for (const format of report_formats) {
      if (format.name === 'Verinice ISM') {
        return format.id;
      }
    }
  }
  return first(report_formats).id;
}

const value = (data, def = undefined) => {
  const val = is_defined(data) ? data.value : def;
  if (is_defined(val)) {
    return val;
  }
  return def;
};

export class AlertDialogContainer extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleSaveAlert = this.handleSaveAlert.bind(this);
    this.handleCreateCredential = this.handleCreateCredential.bind(this);

    this.openScpCredentialDialog = this.openScpCredentialDialog.bind(this);
    this.openSmbCredentialDialog = this.openSmbCredentialDialog.bind(this);
    this.openVeriniceCredentialDialog = this.openVeriniceCredentialDialog.bind(
      this);

  }

  handleSaveAlert(data) {
    const {gmp} = this.context;
    const {onSave} = this.props;
    let promise;

    if (is_defined(data.alert)) {
      promise = gmp.alert.save(data);
    }
    else {
      promise = gmp.alert.create(data);
    }

    return promise.then(response => {
      const alert = response.data;
      if (onSave) {
        return onSave(alert);
      }
      return undefined;
    });
  }

  handleCreateCredential(data) {
    const {gmp} = this.context;
    const promise = gmp.credential.create(data);

    const {credentials} = this;

    promise.then(response => {
      const credential = response.data;

      credentials.push(credential);

      this.alert_dialog.setValue('credentials', credentials);

      if (data.type === 'scp') {
        this.alert_dialog.setValue('method_data_scp_credential', credential.id);
      }
      else if (data.type === 'smb') {
        this.alert_dialog.setValue('method_data_smb_credential', credential.id);
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

  openSmbCredentialDialog(types) {
    this.openCredentialDialog({type: 'smb', types});
  }

  openVeriniceCredentialDialog(types) {
    this.openCredentialDialog({type: 'verinice', types});
  }

  show(state, options) {
    const {gmp} = this.context;

    this.credentials = is_defined(state) && is_defined(state.credentials) ?
      state.credentials : [];

    if (is_defined(state.alert)) {
      gmp.alert.editAlertSettings(state.alert).then(response => {
        const settings = response.data;
        const {
          credentials = [],
          filters = [],
          report_formats = [],
          tasks = [],
          alert,
        } = settings;

        const {method, condition, event} = alert;

        this.credentials = credentials;

        const result_filters =
          filters.filter(filter => filter.type === 'Result');
        const secinfo_filters = filters.filter(
          filter => filter.type === 'SecInfo');

        let condition_data_filters;
        const condition_data_filter_id = value(condition.data.filter_id);

        let method_data_message;
        let method_data_message_attach;
        const method_data_notice = value(method.data.notice,
          DEFAULT_NOTICE);

        let method_data_subject;
        let feed_event;
        let event_type = event.type;

        if (event_type === 'Task run status changed') {
          condition_data_filters = result_filters;
          method_data_subject = value(method.data.subject, TASK_SUBJECT);

          if (method_data_notice === NOTICE_ATTACH) {
            method_data_message_attach = value(method.data.message,
              ATTACH_MESSAGE_DEFAULT);
            method_data_message = INCLUDE_MESSAGE_DEFAULT;
          }
          else {
            method_data_message = value(method.data.message,
              INCLUDE_MESSAGE_DEFAULT);
            method_data_message_attach = ATTACH_MESSAGE_DEFAULT;
          }
        }
        else {
          condition_data_filters = secinfo_filters;
          method_data_subject = value(method.data.subject,
            SECINFO_SUBJECT);

          if (method_data_notice === NOTICE_ATTACH) {
            method_data_message_attach = value(method.data.message,
              ATTACH_MESSAGE_SECINFO);
            method_data_message = INCLUDE_MESSAGE_SECINFO;
          }
          else {
            method_data_message = value(method.data.message,
              INCLUDE_MESSAGE_SECINFO);
            method_data_message_attach = ATTACH_MESSAGE_SECINFO;
          }
        }

        if (event.type === 'Updated SecInfo arrived') {
          event_type = 'New SecInfo arrived';
          feed_event = 'updated';
        }
        else {
          feed_event = 'new';
        }

        const scp_credential_id = is_defined(method.data.scp_credential) ?
          method.data.scp_credential.credential.id : undefined;

        const verinice_credential_id =
          is_defined(method.data.verinice_server_credential) ?
            method.data.verinice_server_credential.credential.id : undefined;

        this.alert_dialog.show({
          id: alert.id,
          alert,
          active: alert.active,
          name: alert.name,
          comment: alert.comment,
          filters,
          filter_id: is_defined(alert.filter) ? alert.filter.id : '0',
          credentials,
          result_filters,
          secinfo_filters,

          condition: condition.type,
          condition_data_count: value(condition.data.count, 1),
          condition_data_direction: value(condition.data.direction,
            DEFAULT_DIRECTION),
          condition_data_filters,
          condition_data_filter_id,
          condition_data_at_least_filter_id: condition_data_filter_id,
          condition_data_at_least_count: value(condition.data.count, 1),
          condition_data_severity: value(condition.data.severity,
            DEFAULT_SEVERITY),

          event: event_type,
          event_data_status: value(event.data.status, DEFAULT_EVENT_STATUS),
          event_data_feed_event: feed_event,
          event_data_secinfo_type: value(event.data.secinfo_type,
            DEFAULT_SECINFO_TYPE),

          method: alert.method.type,

          method_data_defense_center_ip: value(method.data.defense_center_ip,
            ''),
          method_data_defense_center_port: value(
            method.data.defense_center_port, DEFAULT_DEFENSE_CENTER_PORT),

          method_data_details_url: value(method.data.details_url,
            DEFAULT_DETAILS_URL),
          report_formats,
          method_data_to_address: value(alert.method.data.to_address, ''),
          method_data_from_address: value(alert.method.data.from_address, ''),
          method_data_subject,
          method_data_message,
          method_data_message_attach,
          method_data_notice,
          method_data_notice_report_format: select_save_id(report_formats,
            value(method.data.notice_report_format,
              DEFAULT_NOTICE_REPORT_FORMAT)),
          method_data_notice_attach_format: select_save_id(report_formats,
            value(method.data.attach_report_format,
              DEFAULT_NOTICE_ATTACH_FORMAT)),

          method_data_scp_credential: select_save_id(credentials,
            scp_credential_id),
          method_data_scp_report_format: select_save_id(report_formats,
            value(method.data.scp_report_format)),
          method_data_scp_path: value(method.data.scp_path, DEFAULT_SCP_PATH),
          method_data_scp_host: value(method.data.scp_host, ''),
          method_data_scp_known_hosts: value(method.data.scp_known_hosts, ''),

          method_data_send_port: value(method.data.send_port, ''),
          method_data_send_host: value(method.data.send_host, ''),
          method_data_send_report_format: select_save_id(report_formats,
            value(method.data.send_report_format)),

          method_data_smb_credential: value(method.data.smb_credential, ''),
          method_data_smb_file_path: value(method.data.smb_file_path, ''),
          method_data_smb_report_format:
            value(method.data.smb_report_format, ''),
          method_data_smb_share_path: value(method.data.smb_share_path, ''),

          method_data_snmp_agent: value(method.data.snmp_agent, ''),
          method_data_snmp_community: value(method.data.snmp_community,
            ''),
          method_data_snmp_message: value(method.data.snmp_message, ''),

          method_data_start_task_task: select_save_id(tasks, value(
            method.data.start_task_task)),

          method_data_verinice_server_report_format: select_verinice_report_id(
            report_formats, value(method.data.verinice_server_report_format)),
          method_data_verinice_server_url: value(
            method.data.verinice_server_url),
          method_data_verinice_server_credential: verinice_credential_id,

          method_data_URL: value(method.data.URL, ''),
          tasks,
        }, {
          title: _('Edit Alert {{name}}', {name: shorten(alert.name)}),
        });
      });
    }
    else {
      this.alert_dialog.show(state, options);

      gmp.alert.newAlertSettings().then(response => {
        const settings = response.data;
        const {
          credentials = [],
          filters = [],
          report_formats = [],
          tasks = [],
        } = settings;

        this.credentials = credentials;

        const result_filters =
          filters.filter(filter => filter.type === 'Result');
        const secinfo_filters = filters.filter(
          filter => filter.type === 'SecInfo');

        const result_filter_id = select_save_id(result_filters);
        const report_format_id = select_save_id(report_formats);

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
            DEFAULT_NOTICE_ATTACH_FORMAT),
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
  }

  render() {
    return (
      <Layout>
        <AlertDialog
          ref={ref => this.alert_dialog = ref}
          onNewScpCredentialClick={this.openScpCredentialDialog}
          onNewSmbCredentialClick={this.openSmbCredentialDialog}
          onNewVeriniceCredentialClick={this.openVeriniceCredentialDialog}
          onSave={this.handleSaveAlert}
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
  onSave: PropTypes.func,
};

AlertDialogContainer.contextTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default AlertDialogContainer;

// vim: set ts=2 sw=2 tw=80:
