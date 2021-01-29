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
import React, {useReducer} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import _ from 'gmp/locale';

import {
  event_data_fields,
  condition_data_fields,
  method_data_fields,
} from 'gmp/commands/alerts';

import {
  convertCredentialTypeEnum,
  convertAuthAlgorithmEnum,
  convertPrivacyAlgorithmEnum,
  email_credential_filter,
  password_only_credential_filter,
  smb_credential_filter,
  vFire_credential_filter,
} from 'gmp/models/credential';

import {parseInt, parseSeverity, parseYesNo, NO_VALUE} from 'gmp/parser';

import {hasValue, isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';
import {first} from 'gmp/utils/array';
import {capitalizeFirstLetter, shorten} from 'gmp/utils/string';

import FootNote from 'web/components/footnote/footnote';

import Layout from 'web/components/layout/layout';

import EntityComponent from 'web/entity/component';

import {useCreateAlert, useModifyAlert} from 'web/graphql/alerts';

import {useCreateCredential} from 'web/graphql/credentials';

import CredentialsDialog from 'web/pages/credentials/dialog';

import {
  loadReportComposerDefaults as loadDefaults,
  saveReportComposerDefaults as saveDefaults,
} from 'web/store/usersettings/actions';
import {getReportComposerDefaults} from 'web/store/usersettings/selectors';

import reducer, {updateState} from 'web/utils/stateReducer';
import PropTypes from 'web/utils/proptypes';
import {UNSET_VALUE} from 'web/utils/render';
import useGmp from 'web/utils/useGmp';
import readFileToText from 'web/utils/readFileToText';

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

import {
  convertConditionEnum,
  convertDict,
  convertMethodEnum,
  convertEventEnum,
} from './parser';

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

const initialState = {
  alertDialogVisible: false,
  credentialDialogVisible: false,
  credentialType: '',
};

const AlertComponent = ({
  children,
  onCloneError,
  onCloned,
  onCreateError,
  onCreated,
  onDeleteError,
  onDeleted,
  onDownloadError,
  onDownloaded,
  onError,
  onInteraction,
  onSaveError,
  onSaved,
  onTestError,
  onTestSuccess,
}) => {
  const gmp = useGmp();

  const dispatch = useDispatch();

  const [state, dispatchState] = useReducer(reducer, initialState);

  const reportComposerDefaults = useSelector(getReportComposerDefaults);

  const loadReportComposerDefaults = () => dispatch(loadDefaults(gmp)());
  const saveReportComposerDefaults = defaults =>
    dispatch(saveDefaults(gmp)(defaults));

  const [createAlert] = useCreateAlert();
  const [modifyAlert] = useModifyAlert();
  const [createCredential] = useCreateCredential();

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleCreateCredential = data => {
    handleInteraction();

    let credential_id;
    const readCertificate = readFileToText(data.certificate);
    const readPrivateKey = readFileToText(data.private_key);

    return Promise.all([readCertificate, readPrivateKey])
      .then(([certificate, privateKey]) => {
        return createCredential({
          allowInsecure: data.allow_insecure,
          authAlgorithm: convertAuthAlgorithmEnum(data.auth_algorithm),
          certificate: certificate,
          comment: data.comment,
          community: data.community,
          login: data.credential_login,
          name: data.name,
          keyPhrase: data.passphrase,
          password: data.password,
          privacyAlgorithm: convertPrivacyAlgorithmEnum(data.privacy_algorithm),
          privacyPassword: data.privacy_password,
          privateKey: privateKey,
          publicKey: data.public_key,
          type: convertCredentialTypeEnum(data.credential_type),
        });
      })
      .then(createdId => {
        credential_id = createdId;
        closeCredentialDialog();
      })
      .then(() => gmp.credentials.getAll())
      .then(response => {
        const {data: credentials} = response;
        if (state.credentialType === 'scp') {
          dispatchState(
            updateState({
              method_data_scp_credential: credential_id,
              credentials,
            }),
          );
        } else if (state.credentialType === 'smb') {
          dispatchState(
            updateState({
              method_data_smb_credential: credential_id,
              credentials,
            }),
          );
        } else if (state.credentialType === 'verinice') {
          dispatchState(
            updateState({
              method_data_verinice_server_credential: credential_id,
              credentials,
            }),
          );
        } else if (state.credentialType === 'vfire') {
          dispatchState(
            updateState({
              method_data_vfire_credential: credential_id,
              credentials,
            }),
          );
        } else if (state.credentialType === 'tippingpoint') {
          dispatchState(
            updateState({
              method_data_tp_sms_credential: credential_id,
              credentials,
            }),
          );
        } else if (state.credentialType === 'email') {
          dispatchState(
            updateState({
              method_data_recipient_credential: credential_id,
              credentials,
            }),
          );
        } else if (state.credentialType === 'pw') {
          dispatchState(
            updateState({
              method_data_pkcs12_credential: credential_id,
              credentials,
            }),
          );
        }
      })
      .catch(error => {
        dispatchState(updateState({credentialError: error.message}));
      });
  };

  const openCredentialDialog = ({type, types}) => {
    state.credentialType = type;
    dispatchState(
      updateState({
        credentialDialogVisible: true,
        credentialDialogTitle: _('New Credential'),
        credentialTypes: types,
        credentialType: type,
      }),
    );

    handleInteraction();
  };

  const closeCredentialDialog = () => {
    dispatchState(updateState({credentialDialogVisible: false}));
  };

  const handleCloseCredentialDialog = () => {
    closeCredentialDialog();
    handleInteraction();
  };

  const openContentComposerDialog = () => {
    dispatchState(updateState({contentComposerDialogVisible: true}));
  };

  const handleOpenContentComposerDialog = () => {
    openContentComposerDialog();

    handleInteraction();
  };

  const closeContentComposerDialog = () => {
    const {
      method_data_composer_include_notes,
      method_data_composer_include_overrides,
      filter_id,
    } = state;
    dispatchState(
      updateState({
        composerIncludeNotes: method_data_composer_include_notes,
        composerIncludeOverrides: method_data_composer_include_overrides,
        composerFilterId: filter_id,
        composerStoreAsDefault: NO_VALUE,
        contentComposerDialogVisible: false,
      }),
    );
  };

  const handleSaveComposerContent = ({
    includeNotes,
    includeOverrides,
    filterId,
    storeAsDefault,
  }) => {
    if (storeAsDefault) {
      const defaults = {
        ...reportComposerDefaults,
        reportResultFilterId: filterId === UNSET_VALUE ? undefined : filterId,
        includeNotes,
        includeOverrides,
      };
      saveReportComposerDefaults(defaults);
    }
    dispatchState(
      updateState({
        filter_id: filterId,
        method_data_composer_include_notes: includeNotes,
        method_data_composer_include_overrides: includeOverrides,
        composerStoreAsDefault: NO_VALUE,
        contentComposerDialogVisible: false,
      }),
    );
    handleInteraction();
  };

  const handleSaveAlert = async ({
    active,
    name,
    comment = '',
    event,
    condition,
    filter_id,
    method,
    report_format_ids,
    ...other
  }) => {
    handleInteraction();

    const {event_data_feed_event} = other;

    if (!isDefined(id)) {
      return createAlert({
        name,
        comment,
        condition: convertConditionEnum(condition),
        conditionData: await convertDict(
          'condition_data',
          other,
          condition_data_fields,
        ),
        filterId: filter_id,
        method: convertMethodEnum(method),
        methodData: await convertDict('method_data', other, method_data_fields),
        event: convertEventEnum(event, event_data_feed_event),
        eventData: await convertDict('event_data', other, event_data_fields),
        reportFormats: report_format_ids,
      })
        .then(onCreated, onCreateError)
        .then(closeAlertDialog);
    }

    return modifyAlert({
      id,
      name,
      comment,
      event: hasValue(event)
        ? convertEventEnum(event, event_data_feed_event) // Added second arg because the dialog ALWAYS sends NEW_SECINFO_ARRIVED if event type is secinfo; the radio can only accept one value.
        : null,
      eventData: await convertDict('event_data', other, event_data_fields),
      condition: hasValue(condition) ? convertConditionEnum(condition) : null,
      conditionData: await convertDict(
        'condition_data',
        other,
        condition_data_fields,
      ),
      filterId: filter_id,
      method: hasValue(method) ? convertMethodEnum(method) : null,
      methodData: await convertDict('method_data', other, method_data_fields),
      reportFormats: report_format_ids,
    })
      .then(onSaved, onSaveError)
      .then(closeAlertDialog);
  };

  const openScpCredentialDialog = types => {
    openCredentialDialog({type: 'scp', types});
  };

  const openSmbCredentialDialog = types => {
    openCredentialDialog({type: 'smb', types});
  };

  const openVeriniceCredentialDialog = types => {
    openCredentialDialog({type: 'verinice', types});
  };

  const openPasswordOnlyCredentialDialog = types => {
    openCredentialDialog({type: 'pw', types});
  };

  const openVfireCredentialDialog = types => {
    openCredentialDialog({type: 'vfire', types});
  };

  const openTippingPointCredentialDialog = types => {
    openCredentialDialog({type: 'tippingpoint', types});
  };

  const openEmailCredentialDialog = types => {
    openCredentialDialog({type: 'email', types});
  };

  const openAlertDialog = alert => {
    handleInteraction();

    const credentialPromise = gmp.credentials.getAll().then(r => r.data);

    loadReportComposerDefaults();

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

          dispatchState(
            updateState({
              alertDialogVisible: true,
              id: alert.id,
              alert,
              active: alert.active,
              name: alert.name,
              comment: alert.comment,
              filters,
              filter_id: hasValue(alert.filter) ? alert.filter.id : undefined,
              composerFilterId: hasValue(alert.filter)
                ? alert.filter.id
                : undefined,
              composerIncludeNotes: getValue(
                method.data.composer_include_notes,
              ),
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
              method_data_to_address: getValue(
                alert.method.data.to_address,
                '',
              ),
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
                UNSET_VALUE, // default value for uuids should always be null from now on, since a UUID type is expected.
              ),
              method_data_smb_file_path: getValue(
                method.data.smb_file_path,
                '',
              ),
              method_data_smb_file_path_type: getValue(
                method.data.smb_file_path_type,
                '',
              ),
              method_data_smb_report_format: getValue(
                method.data.smb_report_format,
                UNSET_VALUE,
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
                UNSET_VALUE, // same here. uuids should never be anything but either a valid uuid or null.
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
              method_data_vfire_client_id: getValue(
                method.data.vfire_client_id,
              ),
              method_data_vfire_session_type: getValue(
                method.data.vfire_session_type,
              ),

              method_data_URL: getValue(method.data.URL, ''),
              method_data_delta_type: getValue(
                alert.method.data.delta_type,
                '',
              ),
              method_data_delta_report_id: getValue(
                alert.method.data.delta_report_id,
                '',
              ),
              tasks,
              title: _('Edit Alert {{name}}', {name: shorten(alert.name)}),
            }),
          );
        },
      );
    } else {
      const alertPromise = gmp.alert.newAlertSettings().then(r => r.data);
      Promise.all([credentialPromise, alertPromise]).then(
        ([credentials, settings]) => {
          const {filters = [], report_formats = [], tasks = []} = settings;

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

          dispatchState(
            updateState({
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
            }),
          );
        },
      );
    }
  };

  const closeAlertDialog = () => {
    dispatchState(
      updateState({
        alertDialogVisible: false,
      }),
    );
  };

  const handleCloseAlertDialog = () => {
    dispatchState(
      updateState({
        composerIncludeNotes: undefined,
        composerIncludeOverrides: undefined,
        composerFilterId: undefined,
        composerFilterString: undefined,
        composerStoreAsDefault: NO_VALUE,
      }),
    );

    closeAlertDialog();
    handleInteraction();
  };

  const handleTestAlert = alert => {
    handleInteraction();

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
  };

  const handlePasswordOnlyCredentialChange = credential => {
    dispatchState(
      updateState({
        method_data_pkcs12_credential: credential,
      }),
    );
  };

  const handleScpCredentialChange = credential => {
    dispatchState(
      updateState({
        method_data_scp_credential: credential,
      }),
    );
  };

  const handleSmbCredentialChange = credential => {
    dispatchState(
      updateState({
        method_data_smb_credential: credential,
      }),
    );
  };

  const handleTippingPointCredentialChange = credential => {
    dispatchState(
      updateState({
        method_data_tp_sms_credential: credential,
      }),
    );
  };

  const handleVeriniceCredentialChange = credential => {
    dispatchState(
      updateState({
        method_data_verinice_server_credential: credential,
      }),
    );
  };

  const handleEmailCredentialChange = credential => {
    dispatchState(
      updateState({
        method_data_recipient_credential: credential,
      }),
    );
  };

  const handleVfireCredentialChange = credential => {
    dispatchState(
      updateState({
        method_data_vfire_credential: credential,
      }),
    );
  };

  const handleReportFormatsChange = report_format_ids => {
    dispatchState(
      updateState({
        report_format_ids,
      }),
    );
  };

  const handleValueChange = (value, name) => {
    handleInteraction();
    name = capitalizeFirstLetter(name);
    dispatchState(
      updateState({
        [`composer${name}`]: value,
      }),
    );
  };

  const handleFilterIdChange = value => {
    dispatchState(
      updateState({
        composerFilterId: value === UNSET_VALUE ? undefined : value,
      }),
    );

    handleInteraction();
  };

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
  } = state;
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
      {({...other}) => (
        <Layout>
          {children({
            ...other,
            create: openAlertDialog,
            edit: openAlertDialog,
            test: handleTestAlert,
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
              method_data_defense_center_port={method_data_defense_center_port}
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
              method_data_verinice_server_url={method_data_verinice_server_url}
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
              onClose={handleCloseAlertDialog}
              onOpenContentComposerDialogClick={handleOpenContentComposerDialog}
              onNewEmailCredentialClick={openEmailCredentialDialog}
              onNewPasswordOnlyCredentialClick={
                openPasswordOnlyCredentialDialog
              }
              onNewScpCredentialClick={openScpCredentialDialog}
              onNewSmbCredentialClick={openSmbCredentialDialog}
              onNewVeriniceCredentialClick={openVeriniceCredentialDialog}
              onNewVfireCredentialClick={openVfireCredentialDialog}
              onNewTippingPointCredentialClick={
                openTippingPointCredentialDialog
              }
              onSave={handleSaveAlert}
              onReportFormatsChange={handleReportFormatsChange}
              onEmailCredentialChange={handleEmailCredentialChange}
              onPasswordOnlyCredentialChange={
                handlePasswordOnlyCredentialChange
              }
              onScpCredentialChange={handleScpCredentialChange}
              onSmbCredentialChange={handleSmbCredentialChange}
              onVerinceCredentialChange={handleVeriniceCredentialChange}
              onVfireCredentialChange={handleVfireCredentialChange}
              onTippingPointCredentialChange={
                handleTippingPointCredentialChange
              }
            />
          )}
          {credentialDialogVisible && (
            <CredentialsDialog
              error={state.credentialError}
              title={credentialDialogTitle}
              types={credentialTypes}
              onClose={handleCloseCredentialDialog}
              onErrorClose={() =>
                dispatchState(updateState({credentialError: undefined}))
              }
              onSave={handleCreateCredential}
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
              onChange={handleValueChange}
              onClose={closeContentComposerDialog}
              onFilterIdChange={handleFilterIdChange}
              onSave={handleSaveComposerContent}
            />
          )}
        </Layout>
      )}
    </EntityComponent>
  );
};

AlertComponent.propTypes = {
  children: PropTypes.func.isRequired,
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

export default AlertComponent;

// vim: set ts=2 sw=2 tw=80:
