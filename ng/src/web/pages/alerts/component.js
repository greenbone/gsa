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

import _ from 'gmp/locale.js';
import {is_defined, select_save_id, first, shorten} from 'gmp/utils.js';
import {parse_yesno, NO_VALUE} from 'gmp/parser.js';

import PropTypes from '../../utils/proptypes.js';
import withGmp from '../../utils/withGmp.js';

import EntityComponent from '../../entity/component.js';

import FootNote from '../../components/footnote/footnote.js';

import Layout from '../../components/layout/layout.js';

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

const select_verinice_report_id = (report_formats, report_id) => {
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
};

const value = (data = {}, def = undefined) => {
  const {value: val = def} = data;
  return val;
};

const filter_results_filter = filter => filter.filter_type = 'Results';
const filter_secinfo_filter = filter => filter.filter_type = 'SecInfo';

class AlertComponent extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleCreateCredential = this.handleCreateCredential.bind(this);
    this.handleTestAlert = this.handleTestAlert.bind(this);

    this.openAlertDialog = this.openAlertDialog.bind(this);
    this.openScpCredentialDialog = this.openScpCredentialDialog.bind(this);
    this.openSmbCredentialDialog = this.openSmbCredentialDialog.bind(this);
    this.openVeriniceCredentialDialog = this.openVeriniceCredentialDialog.bind(
      this);
    this.openTippingPointCredentialDialog =
      this.openTippingPointCredentialDialog.bind(this);

  }

  handleCreateCredential(data) {
    const {gmp} = this.props;
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
      else if (data.type === 'tippingpoint') {
        this.alert_dialog.setValue('method_data_tp_sms_credential',
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

  openTippingPointCredentialDialog(types) {
    this.openCredentialDialog({type: 'verinice', types});
  }

  openAlertDialog(alert) {
    const {gmp} = this.props;

    if (is_defined(alert)) {
      gmp.alert.editAlertSettings(alert).then(response => {
        const settings = response.data;
        const {
          credentials = [],
          filters = [],
          report_formats = [],
          tasks = [],
          alert: lalert,
        } = settings;

        const {method, condition, event} = lalert;

        this.credentials = credentials;

        const result_filters = filters.filter(filter_results_filter);
        const secinfo_filters = filters.filter(filter_secinfo_filter);

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

        const tp_sms_credential_id = is_defined(method.data.tp_sms_credential) ?
          method.data.method_data_tp_sms_credential.credential.id : undefined;

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

          method_data_tp_sms_credential: select_save_id(credentials,
            tp_sms_credential_id),
          method_data_tp_sms_hostname: value(method.data.tp_sms_hostname, ''),
          method_data_tp_sms_tls_workaround: parse_yesno(
            value(method.data.tp_sms_hostname, NO_VALUE)),

          method_data_verinice_server_report_format: select_verinice_report_id(
            report_formats, value(method.data.verinice_server_report_format)),
          method_data_verinice_server_url: value(
            method.data.verinice_server_url),
          method_data_verinice_server_credential: select_save_id(credentials,
            verinice_credential_id),

          method_data_URL: value(method.data.URL, ''),
          tasks,
        }, {
          title: _('Edit Alert {{name}}', {name: shorten(alert.name)}),
        });
      });
    }
    else {
      this.alert_dialog.show();

      gmp.alert.newAlertSettings().then(response => {
        const settings = response.data;
        const {
          credentials = [],
          filters = [],
          report_formats = [],
          tasks = [],
        } = settings;

        this.credentials = credentials;

        const result_filters = filters.filter(filter_results_filter);
        const secinfo_filters = filters.filter(filter_secinfo_filter);

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

  handleTestAlert(alert) {
    const {gmp} = this.props;
    const {onTestSuccess, onTestError} = this.props;

    gmp.alert.test(alert).then(response => {
      const {success, details, message} = response.data;
      if (success) {
        if (is_defined(onTestSuccess)) {
          onTestSuccess(_('Testing the alert {{name}} was successful.', alert));
        }
      }
      else if (is_defined(onTestError)) {
        if (is_defined(details)) {
          onTestError(
            <React.Fragment>
              <p>
                {_('Testing the alert {{name}} failed. {{message}}.', {
                  name: alert.name,
                  message,
                })}
              </p>
              <FootNote>
                {details}
              </FootNote>
            </React.Fragment>
          );
        }
        else {
          onTestError(_('Testing the alert {{name}} failed. {{message}}.',
            {name: alert.name, message}));
        }
      }
    }, () => {
      if (is_defined(onTestError)) {
        onTestError(_('An error occured during Testing the alert {{name}}',
          alert));
      }
    });
  }

  render() {
    const {
      children,
      onError,
      onCloned,
      onCloneError = onError,
      onCreated,
      onCreateError = onError,
      onDeleted,
      onDeleteError = onError,
      onDownloaded,
      onDownloadError = onError,
      onSaved,
      onSaveError = onError,
    } = this.props;

    return (
      <EntityComponent
        name="alert"
        onCreated={onCreated}
        onCreateError={onCreateError}
        onCloned={onCloned}
        onCloneError={onCloneError}
        onDeleted={onDeleted}
        onDeleteError={onDeleteError}
        onDownloaded={onDownloaded}
        onDownloadError={onDownloadError}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({
          save,
          ...other
        }) => (
          <Layout>
            {children({
              ...other,
              create: this.openAlertDialog,
              edit: this.openAlertDialog,
              test: this.handleTestAlert,
            })}
            <AlertDialog
              ref={ref => this.alert_dialog = ref}
              onNewScpCredentialClick={this.openScpCredentialDialog}
              onNewSmbCredentialClick={this.openSmbCredentialDialog}
              onNewVeriniceCredentialClick={this.openVeriniceCredentialDialog}
              onNewTippingPointCredentialClick={
                this.openTippingPointCredentialDialog}
              onSave={save}
            />
            <CredentialsDialog
              ref={ref => this.credentials_dialog = ref}
              onSave={this.handleCreateCredential}
            />
          </Layout>
        )}
      </EntityComponent>
    );
  }
}

AlertComponent.propTypes = {
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onError: PropTypes.func,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onTestError: PropTypes.func,
  onTestSuccess: PropTypes.func,
};

export default withGmp(AlertComponent);

// vim: set ts=2 sw=2 tw=80:
