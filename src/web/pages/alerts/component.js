/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {connect} from 'react-redux';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';
import {first} from 'gmp/utils/array';
import {capitalizeFirstLetter, shorten} from 'gmp/utils/string';

import {parseInt, parseSeverity, parseYesNo, NO_VALUE} from 'gmp/parser';

import {
  email_credential_filter,
  password_only_credential_filter,
  smb_credential_filter,
  vFire_credential_filter,
} from 'gmp/models/credential';

import EntityComponent from 'web/entity/component';

import FootNote from 'web/components/footnote/footnote';

import Layout from 'web/components/layout/layout';

import {
  loadReportComposerDefaults,
  saveReportComposerDefaults,
} from 'web/store/usersettings/actions';
import {getReportComposerDefaults} from 'web/store/usersettings/selectors';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {UNSET_VALUE} from 'web/utils/render';
import withGmp from 'web/utils/withGmp';

import CredentialsDialog from '../credentials/dialog';

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
} from './dialog';

import ContentComposerDialog from './contentcomposerdialog';

const select_verinice_report_id = (report_formats, report_id) => {
  if (isDefined(report_id)) {
    for (const format of report_formats) {
      if (format.id === report_id) {
        return format.id;
      }
    }
  } else {
    for (const format of report_formats) {
      if (format.name === 'Verinice ISM') {
        return format.id;
      }
    }
  }
  return first(report_formats).id;
};

const getValue = (data = {}, def = undefined) => {
  const {value: val = def} = data;
  return val;
};

const filter_results_filter = filter => filter.filter_type === 'result';
const filter_secinfo_filter = filter => filter.filter_type === 'info';

class AlertComponent extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      alertDialogVisible: false,
      credentialDialogVisible: false,
    };

    this.handleCreateCredential = this.handleCreateCredential.bind(this);
    this.handleEmailCredentialChange = this.handleEmailCredentialChange.bind(
      this,
    );
    this.handleFilterIdChange = this.handleFilterIdChange.bind(this);
    this.handleTestAlert = this.handleTestAlert.bind(this);
    this.handlePasswordOnlyCredentialChange = this.handlePasswordOnlyCredentialChange.bind(
      this,
    );
    this.handleScpCredentialChange = this.handleScpCredentialChange.bind(this);
    this.handleSaveComposerContent = this.handleSaveComposerContent.bind(this);
    this.handleSmbCredentialChange = this.handleSmbCredentialChange.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
    this.handleVeriniceCredentialChange = this.handleVeriniceCredentialChange.bind(
      this,
    );
    this.handleTippingPointCredentialChange = this.handleTippingPointCredentialChange.bind(
      this,
    );
    this.handleVfireCredentialChange = this.handleVfireCredentialChange.bind(
      this,
    );
    this.handleReportFormatsChange = this.handleReportFormatsChange.bind(this);

    this.openAlertDialog = this.openAlertDialog.bind(this);
    this.handleCloseAlertDialog = this.handleCloseAlertDialog.bind(this);
    this.handleOpenContentComposerDialog = this.handleOpenContentComposerDialog.bind(
      this,
    );
    this.closeContentComposerDialog = this.closeContentComposerDialog.bind(
      this,
    );
    this.openPasswordOnlyCredentialDialog = this.openPasswordOnlyCredentialDialog.bind(
      this,
    );
    this.openScpCredentialDialog = this.openScpCredentialDialog.bind(this);
    this.openSmbCredentialDialog = this.openSmbCredentialDialog.bind(this);
    this.openVeriniceCredentialDialog = this.openVeriniceCredentialDialog.bind(
      this,
    );
    this.openVfireCredentialDialog = this.openVfireCredentialDialog.bind(this);
    this.openTippingPointCredentialDialog = this.openTippingPointCredentialDialog.bind(
      this,
    );
    this.openEmailCredentialDialog = this.openEmailCredentialDialog.bind(this);
    this.handleCloseCredentialDialog = this.handleCloseCredentialDialog.bind(
      this,
    );
  }

  handleCreateCredential(credentialdata) {
    const {gmp} = this.props;

    this.handleInteraction();

    let credential_id;
    gmp.credential
      .create(credentialdata)
      .then(response => {
        credential_id = response.data.id;
        this.closeCredentialDialog();
      })
      .then(() => gmp.credentials.getAll())
      .then(response => {
        const {data: credentials} = response;
        if (this.credentialType === 'scp') {
          this.setState({
            method_data_scp_credential: credential_id,
            credentials,
          });
        } else if (this.credentialType === 'smb') {
          this.setState({
            method_data_smb_credential: credential_id,
            credentials,
          });
        } else if (this.credentialType === 'verinice') {
          this.setState({
            method_data_verinice_server_credential: credential_id,
            credentials,
          });
        } else if (this.credentialType === 'vfire') {
          this.setState({
            method_data_vfire_credential: credential_id,
            credentials,
          });
        } else if (this.credentialType === 'tippingpoint') {
          this.setState({
            method_data_tp_sms_credential: credential_id,
            credentials,
          });
        } else if (this.credentialType === 'email') {
          this.setState({
            method_data_recipient_credential: credential_id,
            credentials,
          });
        } else if (this.credentialType === 'pw') {
          this.setState({
            method_data_pkcs12_credential: credential_id,
            credentials,
          });
        }
      })
      .catch(error => {
        this.setState({credentialError: error.message});
      });
  }

  openCredentialDialog({type, types}) {
    this.credentialType = type;

    this.setState({
      credentialDialogVisible: true,
      credentialDialogTitle: _('New Credential'),
      credentialTypes: types,
    });

    this.handleInteraction();
  }

  closeCredentialDialog() {
    this.setState({credentialDialogVisible: false});
  }

  handleCloseCredentialDialog() {
    this.closeCredentialDialog();
    this.handleInteraction();
  }

  openContentComposerDialog() {
    this.setState({contentComposerDialogVisible: true});
  }

  handleOpenContentComposerDialog() {
    this.openContentComposerDialog();

    this.handleInteraction();
  }

  closeContentComposerDialog() {
    const {
      method_data_composer_include_notes,
      method_data_composer_include_overrides,
      filter_id,
    } = this.state;
    this.setState({
      composerIncludeNotes: method_data_composer_include_notes,
      composerIncludeOverrides: method_data_composer_include_overrides,
      composerFilterId: filter_id,
      composerStoreAsDefault: NO_VALUE,
      contentComposerDialogVisible: false,
    });
  }

  handleSaveComposerContent({
    includeNotes,
    includeOverrides,
    filterId,
    storeAsDefault,
  }) {
    if (storeAsDefault) {
      const {reportComposerDefaults} = this.props;
      const defaults = {
        ...reportComposerDefaults,
        reportResultFilterId: filterId === UNSET_VALUE ? undefined : filterId,
        includeNotes,
        includeOverrides,
      };
      this.props.saveReportComposerDefaults(defaults);
    }
    this.setState({
      filter_id: filterId,
      method_data_composer_include_notes: includeNotes,
      method_data_composer_include_overrides: includeOverrides,
      composerStoreAsDefault: NO_VALUE,
      contentComposerDialogVisible: false,
    });
    this.handleInteraction();
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

  openPasswordOnlyCredentialDialog(types) {
    this.openCredentialDialog({type: 'pw', types});
  }

  openVfireCredentialDialog(types) {
    this.openCredentialDialog({type: 'vfire', types});
  }

  openTippingPointCredentialDialog(types) {
    this.openCredentialDialog({type: 'tippingpoint', types});
  }

  openEmailCredentialDialog(types) {
    this.openCredentialDialog({type: 'email', types});
  }

  openAlertDialog(alert) {
    const {gmp} = this.props;

    this.handleInteraction();

    const credentialPromise = gmp.credentials.getAll().then(r => r.data);

    this.props.loadReportComposerDefaults();

    if (isDefined(alert)) {
      const alertPromise = gmp.alert.editAlertSettings(alert).then(r => r.data);
      Promise.all([credentialPromise, alertPromise]).then(
        ([credentials, settings]) => {
          const {
            filters = [],
            report_formats = [],
            tasks = [],
            alert: lalert,
          } = settings;

          const {method, condition, event} = lalert;

          const emailCredentials = credentials.filter(email_credential_filter);
          const vFireCredentials = credentials.filter(vFire_credential_filter);
          const passwordOnlyCredentials = credentials.filter(
            password_only_credential_filter,
          );

          const result_filters = filters.filter(filter_results_filter);
          const secinfo_filters = filters.filter(filter_secinfo_filter);

          let condition_data_filters;
          const condition_data_filter_id = getValue(condition.data.filter_id);

          let method_data_message;
          let method_data_message_attach;
          const method_data_notice = getValue(
            method.data.notice,
            DEFAULT_NOTICE,
          );

          let method_data_subject;
          let feed_event;
          let event_type = event.type;

          if (event_type === 'Task run status changed') {
            condition_data_filters = result_filters;
            method_data_subject = getValue(method.data.subject, TASK_SUBJECT);

            if (method_data_notice === NOTICE_ATTACH) {
              method_data_message_attach = getValue(
                method.data.message,
                ATTACH_MESSAGE_DEFAULT,
              );
              method_data_message = INCLUDE_MESSAGE_DEFAULT;
            } else {
              method_data_message = getValue(
                method.data.message,
                INCLUDE_MESSAGE_DEFAULT,
              );
              method_data_message_attach = ATTACH_MESSAGE_DEFAULT;
            }
          } else {
            condition_data_filters = secinfo_filters;
            method_data_subject = getValue(
              method.data.subject,
              SECINFO_SUBJECT,
            );

            if (method_data_notice === NOTICE_ATTACH) {
              method_data_message_attach = getValue(
                method.data.message,
                ATTACH_MESSAGE_SECINFO,
              );
              method_data_message = INCLUDE_MESSAGE_SECINFO;
            } else {
              method_data_message = getValue(
                method.data.message,
                INCLUDE_MESSAGE_SECINFO,
              );
              method_data_message_attach = ATTACH_MESSAGE_SECINFO;
            }
          }

          if (event.type === 'Updated SecInfo arrived') {
            event_type = 'New SecInfo arrived';
            feed_event = 'updated';
          } else {
            feed_event = 'new';
          }

          const scp_credential_id = isDefined(method.data.scp_credential)
            ? method.data.scp_credential.credential.id
            : undefined;

          const verinice_credential_id = isDefined(
            method.data.verinice_server_credential,
          )
            ? method.data.verinice_server_credential.credential.id
            : undefined;

          const tp_sms_credential_id = isDefined(method.data.tp_sms_credential)
            ? getValue(method.data.tp_sms_credential.credential)
            : undefined;

          const recipient_credential_id = isDefined(
            method.data.recipient_credential,
          )
            ? getValue(method.data.recipient_credential)
            : undefined;

          const pkcs12_credential_id = isDefined(method.data.pkcs12_credential)
            ? getValue(method.data.pkcs12_credential)
            : undefined;

          const vfire_credential_id = isDefined(method.data.vfire_credential)
            ? getValue(method.data.vfire_credential)
            : undefined;

          this.setState({
            alertDialogVisible: true,
            id: alert.id,
            alert,
            active: alert.active,
            name: alert.name,
            comment: alert.comment,
            filters,
            filter_id: isDefined(alert.filter) ? alert.filter.id : undefined,
            composerFilterId: isDefined(alert.filter)
              ? alert.filter.id
              : undefined,
            composerIncludeNotes: getValue(method.data.composer_include_notes),
            composerIncludeOverrides: getValue(
              method.data.composer_include_overrides,
            ),
            composerStoreAsDefault: NO_VALUE,
            credentials,
            result_filters,
            secinfo_filters,
            report_formats,
            report_format_ids: method.data.report_formats,

            condition: condition.type,
            condition_data_count: parseInt(getValue(condition.data.count, 1)),
            condition_data_direction: getValue(
              condition.data.direction,
              DEFAULT_DIRECTION,
            ),
            condition_data_filters,
            condition_data_filter_id,
            condition_data_at_least_filter_id: condition_data_filter_id,
            condition_data_at_least_count: parseInt(
              getValue(condition.data.count, 1),
            ),
            condition_data_severity: parseSeverity(
              getValue(condition.data.severity, DEFAULT_SEVERITY),
            ),

            event: event_type,
            event_data_status: getValue(
              event.data.status,
              DEFAULT_EVENT_STATUS,
            ),
            event_data_feed_event: feed_event,
            event_data_secinfo_type: getValue(
              event.data.secinfo_type,
              DEFAULT_SECINFO_TYPE,
            ),

            method: alert.method.type,

            method_data_composer_include_notes: getValue(
              method.data.composer_include_notes,
            ),
            method_data_composer_include_overrides: getValue(
              method.data.composer_include_overrides,
            ),

            method_data_defense_center_ip: getValue(
              method.data.defense_center_ip,
              '',
            ),
            method_data_defense_center_port: parseInt(
              getValue(
                method.data.defense_center_port,
                DEFAULT_DEFENSE_CENTER_PORT,
              ),
            ),

            method_data_details_url: getValue(
              method.data.details_url,
              DEFAULT_DETAILS_URL,
            ),
            method_data_recipient_credential: selectSaveId(
              emailCredentials,
              recipient_credential_id,
              UNSET_VALUE,
            ),
            method_data_to_address: getValue(alert.method.data.to_address, ''),
            method_data_from_address: getValue(
              alert.method.data.from_address,
              '',
            ),
            method_data_subject,
            method_data_message,
            method_data_message_attach,
            method_data_notice,
            method_data_notice_report_format: selectSaveId(
              report_formats,
              getValue(
                method.data.notice_report_format,
                DEFAULT_NOTICE_REPORT_FORMAT,
              ),
            ),
            method_data_notice_attach_format: selectSaveId(
              report_formats,
              getValue(
                method.data.notice_attach_format,
                DEFAULT_NOTICE_ATTACH_FORMAT,
              ),
            ),

            method_data_scp_credential: selectSaveId(
              credentials,
              scp_credential_id,
            ),
            method_data_scp_report_format: selectSaveId(
              report_formats,
              getValue(method.data.scp_report_format),
            ),
            method_data_scp_path: getValue(
              method.data.scp_path,
              DEFAULT_SCP_PATH,
            ),
            method_data_scp_host: getValue(method.data.scp_host, ''),
            method_data_scp_known_hosts: getValue(
              method.data.scp_known_hosts,
              '',
            ),

            method_data_send_port: getValue(method.data.send_port, ''),
            method_data_send_host: getValue(method.data.send_host, ''),
            method_data_send_report_format: selectSaveId(
              report_formats,
              getValue(method.data.send_report_format),
            ),

            method_data_smb_credential: getValue(
              method.data.smb_credential,
              '',
            ),
            method_data_smb_file_path: getValue(method.data.smb_file_path, ''),
            method_data_smb_file_path_type: getValue(
              method.data.smb_file_path_type,
              '',
            ),
            method_data_smb_report_format: getValue(
              method.data.smb_report_format,
              '',
            ),
            method_data_smb_share_path: getValue(
              method.data.smb_share_path,
              '',
            ),

            method_data_snmp_agent: getValue(method.data.snmp_agent, ''),
            method_data_snmp_community: getValue(
              method.data.snmp_community,
              '',
            ),
            method_data_snmp_message: getValue(method.data.snmp_message, ''),

            method_data_start_task_task: selectSaveId(
              tasks,
              getValue(method.data.start_task_task),
            ),

            method_data_tp_sms_credential: selectSaveId(
              credentials,
              tp_sms_credential_id,
            ),
            method_data_tp_sms_hostname: getValue(
              method.data.tp_sms_hostname,
              '',
            ),
            method_data_tp_sms_tls_workaround: parseYesNo(
              getValue(method.data.tp_sms_hostname, NO_VALUE),
            ),

            method_data_verinice_server_report_format: select_verinice_report_id(
              report_formats,
              getValue(method.data.verinice_server_report_format),
            ),
            method_data_verinice_server_url: getValue(
              method.data.verinice_server_url,
            ),
            method_data_verinice_server_credential: selectSaveId(
              credentials,
              verinice_credential_id,
            ),

            method_data_pkcs12_credential: selectSaveId(
              passwordOnlyCredentials,
              pkcs12_credential_id,
              '0',
            ),
            method_data_vfire_credential: selectSaveId(
              vFireCredentials,
              vfire_credential_id,
            ),
            method_data_vfire_base_url: getValue(method.data.vfire_base_url),
            method_data_vfire_call_description: getValue(
              method.data.vfire_call_description,
            ),
            method_data_vfire_call_impact_name: getValue(
              method.data.vfire_call_impact_name,
            ),
            method_data_vfire_call_partition_name: getValue(
              method.data.vfire_call_partition_name,
            ),
            method_data_vfire_call_template_name: getValue(
              method.data.vfire_call_template_name,
            ),
            method_data_vfire_call_type_name: getValue(
              method.data.vfire_call_type_name,
            ),
            method_data_vfire_call_urgency_name: getValue(
              method.data.vfire_call_urgency_name,
            ),
            method_data_vfire_client_id: getValue(method.data.vfire_client_id),
            method_data_vfire_session_type: getValue(
              method.data.vfire_session_type,
            ),

            method_data_URL: getValue(method.data.URL, ''),
            method_data_delta_type: getValue(alert.method.data.delta_type, ''),
            method_data_delta_report_id: getValue(
              alert.method.data.delta_report_id,
              '',
            ),
            tasks,
            title: _('Edit Alert {{name}}', {name: shorten(alert.name)}),
          });
        },
      );
    } else {
      const alertPromise = gmp.alert.newAlertSettings().then(r => r.data);
      Promise.all([credentialPromise, alertPromise]).then(
        ([credentials, settings]) => {
          const {filters = [], report_formats = [], tasks = []} = settings;
          const {reportComposerDefaults} = this.props;

          const result_filters = filters.filter(filter_results_filter);
          const secinfo_filters = filters.filter(filter_secinfo_filter);
          const smbCredentials = credentials.filter(smb_credential_filter);

          const result_filter_id = selectSaveId(result_filters);
          const report_format_id = selectSaveId(report_formats);

          const filterId = isDefined(
            reportComposerDefaults.reportResultFilterId,
          )
            ? reportComposerDefaults.reportResultFilterId
            : undefined;

          this.setState({
            active: undefined,
            alert: undefined,
            alertDialogVisible: true,
            name: undefined,
            comment: undefined,
            condition: undefined,
            condition_data_at_least_count: undefined,
            condition_data_at_least_filter_id: result_filter_id,
            condition_data_count: undefined,
            condition_data_direction: undefined,
            condition_data_filters: result_filters,
            condition_data_filt_id: result_filter_id,
            condition_data_severity: undefined,
            credentials,
            event: undefined,
            event_data_status: DEFAULT_EVENT_STATUS,
            event_data_feed_event: undefined,
            event_data_secinfo_type: undefined,
            filter_id: filterId,
            filters,
            composerFilterId: reportComposerDefaults.reportResultFilterId,
            composerIncludeNotes: reportComposerDefaults.includeNotes,
            composerIncludeOverrides: reportComposerDefaults.includeOverrides,
            composerStoreAsDefault: NO_VALUE,
            id: undefined,
            method: undefined,
            method_data_composer_include_notes: undefined,
            method_data_composer_include_overrides: undefined,
            method_data_defense_center_ip: undefined,
            method_data_defense_center_port: undefined,
            method_data_details_url: undefined,
            method_data_to_address: undefined,
            method_data_from_address: undefined,
            method_data_subject: undefined,
            method_data_message: undefined,
            method_data_message_attach: undefined,
            method_data_notice: undefined,
            method_data_notice_report_format: selectSaveId(
              report_formats,
              DEFAULT_NOTICE_REPORT_FORMAT,
            ),
            method_data_notice_attach_format: selectSaveId(
              report_formats,
              DEFAULT_NOTICE_ATTACH_FORMAT,
            ),
            method_data_scp_credential: undefined,
            method_data_scp_path: DEFAULT_SCP_PATH,
            method_data_scp_report_format: report_format_id,
            method_data_scp_host: undefined,
            method_data_scp_known_hosts: undefined,
            method_data_send_port: undefined,
            method_data_send_host: undefined,
            method_data_snmp_agent: undefined,
            method_data_snmp_community: undefined,
            method_data_snmp_message: undefined,
            method_data_tp_sms_credential: undefined,
            method_data_tp_sms_hostname: undefined,
            method_data_tp_sms_tls_workaround: undefined,
            method_data_verinice_server_url: undefined,
            method_data_verinice_server_credential: undefined,
            method_data_URL: undefined,
            method_data_delta_type: undefined,
            method_data_delta_report_id: undefined,
            method_data_recipient_credential: UNSET_VALUE,
            method_data_send_report_format: report_format_id,
            method_data_start_task_task: selectSaveId(tasks),
            method_data_smb_credential: selectSaveId(smbCredentials),
            method_data_smb_share_path: undefined,
            method_data_smb_file_path: undefined,
            method_data_smb_file_path_type: undefined,
            method_data_verinice_server_report_format: select_verinice_report_id(
              report_formats,
            ),
            method_data_pkcs12_credential: UNSET_VALUE,
            method_data_vfire_credential: undefined,
            method_data_vfire_base_url: undefined,
            method_data_vfire_call_description: undefined,
            method_data_vfire_call_impact_name: undefined,
            method_data_vfire_call_partition_name: undefined,
            method_data_vfire_call_template_name: undefined,
            method_data_vfire_call_type_name: undefined,
            method_data_vfire_call_urgency_name: undefined,
            method_data_vfire_client_id: undefined,
            method_data_vfire_session_type: undefined,
            result_filters,
            secinfo_filters,
            report_formats,
            report_format_ids: [],
            tasks,
            title: _('New Alert'),
          });
        },
      );
    }
  }

  closeAlertDialog() {
    this.setState({alertDialogVisible: false});
  }

  handleCloseAlertDialog() {
    this.setState({
      composerIncludeNotes: undefined,
      composerIncludeOverrides: undefined,
      composerFilterId: undefined,
      composerFilterString: undefined,
      composerStoreAsDefault: NO_VALUE,
    });
    this.closeAlertDialog();
    this.handleInteraction();
  }

  handleTestAlert(alert) {
    const {gmp} = this.props;
    const {onTestSuccess, onTestError} = this.props;

    this.handleInteraction();

    return gmp.alert
      .test(alert)
      .then(response => {
        if (isDefined(onTestSuccess)) {
          onTestSuccess(_('Testing the alert {{name}} was successful.', alert));
        }
      })
      .catch(
        response => {
          const {details, message} = response;
          if (isDefined(onTestError)) {
            if (isDefined(details)) {
              onTestError(
                <React.Fragment>
                  <p>
                    {_('Testing the alert {{name}} failed. {{message}}.', {
                      name: alert.name,
                      message,
                    })}
                  </p>
                  <FootNote>{details}</FootNote>
                </React.Fragment>,
              );
            } else {
              onTestError(
                _('Testing the alert {{name}} failed. {{message}}.', {
                  name: alert.name,
                  message,
                }),
              );
            }
          }
        },
        () => {
          if (isDefined(onTestError)) {
            onTestError(
              _('An error occurred during Testing the alert {{name}}', alert),
            );
          }
        },
      );
  }

  handlePasswordOnlyCredentialChange(credential) {
    this.setState({method_data_pkcs12_credential: credential});
  }

  handleScpCredentialChange(credential) {
    this.setState({method_data_scp_credential: credential});
  }

  handleSmbCredentialChange(credential) {
    this.setState({method_data_smb_credential: credential});
  }

  handleTippingPointCredentialChange(credential) {
    this.setState({method_data_tp_sms_credential: credential});
  }

  handleVeriniceCredentialChange(credential) {
    this.setState({method_data_verinice_server_credential: credential});
  }

  handleEmailCredentialChange(credential) {
    this.setState({method_data_recipient_credential: credential});
  }

  handleVfireCredentialChange(credential) {
    this.setState({method_data_vfire_credential: credential});
  }

  handleReportFormatsChange(report_format_ids) {
    this.setState({report_format_ids});
  }

  handleInteraction() {
    const {onInteraction} = this.props;
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  }

  handleValueChange(value, name) {
    this.handleInteraction();
    name = capitalizeFirstLetter(name);
    this.setState({[`composer${name}`]: value});
  }

  handleFilterIdChange(value) {
    this.setState({
      composerFilterId: value === UNSET_VALUE ? undefined : value,
    });

    this.handleInteraction();
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
      onInteraction,
      onSaved,
      onSaveError = onError,
    } = this.props;

    const {
      alertDialogVisible,
      contentComposerDialogVisible,
      credentialDialogVisible,
      credentialDialogTitle,
      credentialTypes,
      title,
      id,
      alert,
      active,
      name,
      comment,
      filters,
      filter_id,
      composerFilterId,
      composerIncludeNotes,
      composerIncludeOverrides,
      credentials,
      result_filters,
      secinfo_filters,
      condition,
      condition_data_count,
      condition_data_direction,
      condition_data_filters,
      condition_data_filter_id,
      condition_data_at_least_filter_id,
      condition_data_at_least_count,
      condition_data_severity,
      event,
      event_data_status,
      event_data_feed_event,
      event_data_secinfo_type,
      method,
      method_data_composer_include_notes,
      method_data_composer_include_overrides,
      method_data_defense_center_ip,
      method_data_defense_center_port,
      method_data_details_url,
      method_data_to_address,
      method_data_from_address,
      method_data_subject,
      method_data_message,
      method_data_message_attach,
      method_data_notice,
      method_data_notice_report_format,
      method_data_notice_attach_format,
      method_data_recipient_credential,
      method_data_scp_credential,
      method_data_scp_report_format,
      method_data_scp_path,
      method_data_scp_host,
      method_data_scp_known_hosts,
      method_data_send_port,
      method_data_send_host,
      method_data_send_report_format,
      method_data_smb_credential,
      method_data_smb_file_path,
      method_data_smb_file_path_type,
      method_data_smb_report_format,
      method_data_smb_share_path,
      method_data_snmp_agent,
      method_data_snmp_community,
      method_data_snmp_message,
      method_data_start_task_task,
      method_data_tp_sms_credential,
      method_data_tp_sms_hostname,
      method_data_tp_sms_tls_workaround,
      method_data_verinice_server_report_format,
      method_data_verinice_server_url,
      method_data_verinice_server_credential,
      method_data_pkcs12_credential,
      method_data_vfire_credential,
      method_data_vfire_base_url,
      method_data_vfire_call_description,
      method_data_vfire_call_impact_name,
      method_data_vfire_call_partition_name,
      method_data_vfire_call_template_name,
      method_data_vfire_call_type_name,
      method_data_vfire_call_urgency_name,
      method_data_vfire_client_id,
      method_data_vfire_session_type,
      method_data_URL,
      method_data_delta_type,
      method_data_delta_report_id,
      report_formats,
      report_format_ids,
      composerStoreAsDefault,
      tasks,
    } = this.state;
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
        onInteraction={onInteraction}
        onSaved={onSaved}
        onSaveError={onSaveError}
      >
        {({save, ...other}) => (
          <Layout>
            {children({
              ...other,
              create: this.openAlertDialog,
              edit: this.openAlertDialog,
              test: this.handleTestAlert,
            })}
            {alertDialogVisible && (
              <AlertDialog
                title={title}
                id={id}
                alert={alert}
                active={active}
                name={name}
                comment={comment}
                filters={filters}
                filter_id={filter_id}
                credentials={credentials}
                result_filters={result_filters}
                secinfo_filters={secinfo_filters}
                condition={condition}
                condition_data_count={condition_data_count}
                condition_data_direction={condition_data_direction}
                condition_data_filters={condition_data_filters}
                condition_data_filter_id={condition_data_filter_id}
                condition_data_at_least_filter_id={
                  condition_data_at_least_filter_id
                }
                condition_data_at_least_count={condition_data_at_least_count}
                condition_data_severity={condition_data_severity}
                event={event}
                event_data_status={event_data_status}
                event_data_feed_event={event_data_feed_event}
                event_data_secinfo_type={event_data_secinfo_type}
                method={method}
                method_data_composer_include_notes={
                  method_data_composer_include_notes
                }
                method_data_composer_include_overrides={
                  method_data_composer_include_overrides
                }
                method_data_defense_center_ip={method_data_defense_center_ip}
                method_data_defense_center_port={
                  method_data_defense_center_port
                }
                method_data_details_url={method_data_details_url}
                report_formats={report_formats}
                method_data_to_address={method_data_to_address}
                method_data_from_address={method_data_from_address}
                method_data_subject={method_data_subject}
                method_data_message={method_data_message}
                method_data_message_attach={method_data_message_attach}
                method_data_notice={method_data_notice}
                method_data_notice_report_format={
                  method_data_notice_report_format
                }
                method_data_notice_attach_format={
                  method_data_notice_attach_format
                }
                method_data_recipient_credential={
                  method_data_recipient_credential
                }
                method_data_scp_credential={method_data_scp_credential}
                method_data_scp_report_format={method_data_scp_report_format}
                method_data_scp_path={method_data_scp_path}
                method_data_scp_host={method_data_scp_host}
                method_data_scp_known_hosts={method_data_scp_known_hosts}
                method_data_send_port={method_data_send_port}
                method_data_send_host={method_data_send_host}
                method_data_send_report_format={method_data_send_report_format}
                method_data_smb_credential={method_data_smb_credential}
                method_data_smb_file_path={method_data_smb_file_path}
                method_data_smb_file_path_type={method_data_smb_file_path_type}
                method_data_smb_report_format={method_data_smb_report_format}
                method_data_smb_share_path={method_data_smb_share_path}
                method_data_snmp_agent={method_data_snmp_agent}
                method_data_snmp_community={method_data_snmp_community}
                method_data_snmp_message={method_data_snmp_message}
                method_data_start_task_task={method_data_start_task_task}
                method_data_tp_sms_credential={method_data_tp_sms_credential}
                method_data_tp_sms_hostname={method_data_tp_sms_hostname}
                method_data_tp_sms_tls_workaround={
                  method_data_tp_sms_tls_workaround
                }
                method_data_verinice_server_report_format={
                  method_data_verinice_server_report_format
                }
                method_data_verinice_server_url={
                  method_data_verinice_server_url
                }
                method_data_verinice_server_credential={
                  method_data_verinice_server_credential
                }
                method_data_pkcs12_credential={method_data_pkcs12_credential}
                method_data_vfire_credential={method_data_vfire_credential}
                method_data_vfire_base_url={method_data_vfire_base_url}
                method_data_vfire_call_description={
                  method_data_vfire_call_description
                }
                method_data_vfire_call_impact_name={
                  method_data_vfire_call_impact_name
                }
                method_data_vfire_call_partition_name={
                  method_data_vfire_call_partition_name
                }
                method_data_vfire_call_template_name={
                  method_data_vfire_call_template_name
                }
                method_data_vfire_call_type_name={
                  method_data_vfire_call_type_name
                }
                method_data_vfire_call_urgency_name={
                  method_data_vfire_call_urgency_name
                }
                method_data_vfire_client_id={method_data_vfire_client_id}
                method_data_vfire_session_type={method_data_vfire_session_type}
                method_data_URL={method_data_URL}
                method_data_delta_type={method_data_delta_type}
                method_data_delta_report_id={method_data_delta_report_id}
                report_format_ids={report_format_ids}
                tasks={tasks}
                onClose={this.handleCloseAlertDialog}
                onOpenContentComposerDialogClick={
                  this.handleOpenContentComposerDialog
                }
                onNewEmailCredentialClick={this.openEmailCredentialDialog}
                onNewPasswordOnlyCredentialClick={
                  this.openPasswordOnlyCredentialDialog
                }
                onNewScpCredentialClick={this.openScpCredentialDialog}
                onNewSmbCredentialClick={this.openSmbCredentialDialog}
                onNewVeriniceCredentialClick={this.openVeriniceCredentialDialog}
                onNewVfireCredentialClick={this.openVfireCredentialDialog}
                onNewTippingPointCredentialClick={
                  this.openTippingPointCredentialDialog
                }
                onSave={d => {
                  this.handleInteraction();
                  return save(d).then(() => this.closeAlertDialog());
                }}
                onReportFormatsChange={this.handleReportFormatsChange}
                onEmailCredentialChange={this.handleEmailCredentialChange}
                onPasswordOnlyCredentialChange={
                  this.handlePasswordOnlyCredentialChange
                }
                onScpCredentialChange={this.handleScpCredentialChange}
                onSmbCredentialChange={this.handleSmbCredentialChange}
                onVerinceCredentialChange={this.handleVeriniceCredentialChange}
                onVfireCredentialChange={this.handleVfireCredentialChange}
                onTippingPointCredentialChange={
                  this.handleTippingPointCredentialChange
                }
              />
            )}
            {credentialDialogVisible && (
              <CredentialsDialog
                error={this.state.credentialError}
                title={credentialDialogTitle}
                types={credentialTypes}
                onClose={this.handleCloseCredentialDialog}
                onErrorClose={() => this.setState({credentialError: undefined})}
                onSave={this.handleCreateCredential}
              />
            )}
            {contentComposerDialogVisible && (
              <ContentComposerDialog
                includeNotes={parseYesNo(composerIncludeNotes)}
                includeOverrides={parseYesNo(composerIncludeOverrides)}
                filterId={composerFilterId}
                filters={result_filters}
                storeAsDefault={parseYesNo(composerStoreAsDefault)}
                title={_('Compose Content for Scan Report')}
                onChange={this.handleValueChange}
                onClose={this.closeContentComposerDialog}
                onFilterIdChange={this.handleFilterIdChange}
                onSave={this.handleSaveComposerContent}
              />
            )}
          </Layout>
        )}
      </EntityComponent>
    );
  }
}

AlertComponent.propTypes = {
  children: PropTypes.func.isRequired,
  gmp: PropTypes.gmp.isRequired,
  loadReportComposerDefaults: PropTypes.func.isRequired,
  reportComposerDefaults: PropTypes.object,
  saveReportComposerDefaults: PropTypes.func.isRequired,
  onCloneError: PropTypes.func,
  onCloned: PropTypes.func,
  onCreateError: PropTypes.func,
  onCreated: PropTypes.func,
  onDeleteError: PropTypes.func,
  onDeleted: PropTypes.func,
  onDownloadError: PropTypes.func,
  onDownloaded: PropTypes.func,
  onError: PropTypes.func,
  onInteraction: PropTypes.func.isRequired,
  onSaveError: PropTypes.func,
  onSaved: PropTypes.func,
  onTestError: PropTypes.func,
  onTestSuccess: PropTypes.func,
};

const mapDispatchToProps = (dispatch, {gmp}) => {
  return {
    loadReportComposerDefaults: () =>
      dispatch(loadReportComposerDefaults(gmp)()),
    saveReportComposerDefaults: reportComposerDefaults =>
      dispatch(saveReportComposerDefaults(gmp)(reportComposerDefaults)),
  };
};

const mapStateToProps = rootState => {
  return {
    reportComposerDefaults: getReportComposerDefaults(rootState),
  };
};

export default compose(
  withGmp,
  connect(mapStateToProps, mapDispatchToProps),
)(AlertComponent);

// vim: set ts=2 sw=2 tw=80:
