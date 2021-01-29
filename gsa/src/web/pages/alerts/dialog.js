/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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
import React, {useEffect, useReducer} from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {parseInt, NO_VALUE, YES_VALUE} from 'gmp/parser';

import {
  CONDITION_TYPE_ALWAYS,
  EVENT_TYPE_TASK_RUN_STATUS_CHANGED,
  METHOD_TYPE_ALEMBA_VFIRE,
  METHOD_TYPE_SCP,
  METHOD_TYPE_SEND,
  METHOD_TYPE_SMB,
  METHOD_TYPE_SNMP,
  METHOD_TYPE_SYSLOG,
  METHOD_TYPE_EMAIL,
  METHOD_TYPE_START_TASK,
  METHOD_TYPE_HTTP_GET,
  METHOD_TYPE_SOURCEFIRE,
  METHOD_TYPE_VERINICE,
  METHOD_TYPE_TIPPING_POINT,
  DELTA_TYPE_NONE,
  DELTA_TYPE_PREVIOUS,
  DELTA_TYPE_REPORT,
  isTaskEvent,
  isTicketEvent,
  isSecinfoEvent,
} from 'gmp/models/alert';

import {isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

import SaveDialog from 'web/components/dialog/savedialog';

import Select from 'web/components/form/select';
import FormGroup from 'web/components/form/formgroup';
import TextField from 'web/components/form/textfield';
import Radio from 'web/components/form/radio';
import YesNoRadio from 'web/components/form/yesnoradio';

import ReportIcon from 'web/components/icon/reporticon';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {UNSET_VALUE} from 'web/utils/render';
import reducer, {updateState} from 'web/utils/stateReducer';
import useCapabilities from 'web/utils/useCapabilities';

import AlembaVfireMethodPart from './alembavfiremethodpart';
import HttpMethodPart from './httpmethodpart';
import ScpMethodPart from './scpmethodpart';
import EmailMethodPart from './emailmethodpart';
import SendMethodPart from './sendmethodpart';
import StartTaskMethodPart from './starttaskmethodpart';
import SmbMethodPart from './smbmethodpart';
import SnmpMethodPart from './snmpmethodpart';
import SourcefireMethodPart from './sourcefiremethodpart';
import TippingPontMethodPart from './tippingpointmethodpart';
import VeriniceMethodPart from './verinicemethodpart';

import TaskEventPart from './taskeventpart';
import TicketEventPart from './ticketeventpart';
import SecInfoEventPart from './secinfoeventpart';

import SeverityLeastConditionPart from './severityleastconditionpart';
import SeverityChangedConditionPart from './severitychangedconditionpart';
import FilterCountLeastConditionPart from './filtercountleastconditionpart';
import FilterCountChangedConditionPart from './filtercountchangedconditionpart';

export const DEFAULT_DEFENSE_CENTER_PORT = '8307';
export const DEFAULT_DIRECTION = 'changed';
export const DEFAULT_EVENT_STATUS = 'Done';
export const DEFAULT_METHOD = METHOD_TYPE_EMAIL;
export const DEFAULT_SCP_PATH = 'report.xml';
export const DEFAULT_SECINFO_TYPE = 'nvt';
export const DEFAULT_SEVERITY = 0.1;

export const DEFAULT_DETAILS_URL =
  'https://secinfo.greenbone.net/omp?' +
  'cmd=get_info&info_type=$t&info_id=$o&details=1&token=guest';

export const DEFAULT_NOTICE = '1';
export const NOTICE_SIMPLE = '1';
export const NOTICE_INCLUDE = '0';
export const NOTICE_ATTACH = '2';

export const DEFAULT_NOTICE_REPORT_FORMAT =
  'a3810a62-1f62-11e1-9219-406186ea4fc5';
export const DEFAULT_NOTICE_ATTACH_FORMAT =
  'a0b5bfb2-1f62-11e1-85db-406186ea4fc5';

export const TASK_SUBJECT = "[GVM] Task '$n': $e";
export const SECINFO_SUBJECT = '[GVM] $T $q $S since $d';

export const INCLUDE_MESSAGE_DEFAULT = `Task '$n': $e'

After the event $e,
the following condition was met: $c

This email escalation is configured to apply report format '$r'.
Full details and other report formats are available on the scan engine.

$t
$i

Note:
This email was sent to you as a configured security scan escalation.
Please contact your local system administrator if you think you
should not have received it.`;

export const INCLUDE_MESSAGE_SECINFO = `After the event $e,
the following condition was met: $c

$t
$i

Note:
This email was sent to you as a configured security information escalation.
Please contact your local system administrator if you think you
should not have received it.`;

export const ATTACH_MESSAGE_DEFAULT = `Task '$n': $e

After the event $e,
the following condition was met: $c

This email escalation is configured to attach report format '$r'.
Full details and other report formats are available on the scan engine.

$t

Note:
This email was sent to you as a configured security scan escalation.
Please contact your local system administrator if you think you
should not have received it.`;

export const ATTACH_MESSAGE_SECINFO = `After the event $e,
the following condition was met: $c

This email escalation is configured to attach the resource list.

$t

Note:
This email was sent to you as a configured security information escalation.
Please contact your local system administrator if you think you
should not have received it.
`;

export const VFIRE_CALL_DESCRIPTION = `After the event $e,
the following condition was met: $c

This ticket includes reports in the following format(s):
$r.

Full details and other report formats are available on the scan engine.
$t

Note:
This ticket was created automatically as a security scan escalation.
Please contact your local system administrator if you think it
was created or assigned erroneously.
`;

const DEFAULTS = {
  active: YES_VALUE,
  comment: '',
  condition: CONDITION_TYPE_ALWAYS,
  condition_data_at_least_count: 1,
  condition_data_count: 1,
  condition_data_direction: DEFAULT_DIRECTION,
  condition_data_filters: [],
  condition_data_severity: DEFAULT_SEVERITY,
  event_data_feed_event: 'new',
  event_data_secinfo_type: DEFAULT_SECINFO_TYPE,
  event_data_status: DEFAULT_EVENT_STATUS,
  event: EVENT_TYPE_TASK_RUN_STATUS_CHANGED,
  filter_id: 0,
  filters: [],
  method: DEFAULT_METHOD,
  method_data_details_url: DEFAULT_DETAILS_URL,
  method_data_defense_center_ip: '',
  method_data_defense_center_port: DEFAULT_DEFENSE_CENTER_PORT,
  method_data_from_address: '',
  method_data_message_attach: ATTACH_MESSAGE_DEFAULT,
  method_data_message: INCLUDE_MESSAGE_DEFAULT,
  method_data_notice: DEFAULT_NOTICE,
  method_data_notice_attach_format: DEFAULT_NOTICE_ATTACH_FORMAT,
  method_data_notice_report_format: DEFAULT_NOTICE_REPORT_FORMAT,
  method_data_scp_path: DEFAULT_SCP_PATH,
  method_data_scp_host: '',
  method_data_scp_known_hosts: '',
  method_data_send_host: '',
  method_data_send_port: '',
  method_data_smb_file_path: 'report.xml',
  method_data_smb_share_path: '\\\\localhost\\gvm-reports',
  method_data_snmp_agent: 'localhost',
  method_data_snmp_community: 'public',
  method_data_snmp_message: '$e',
  method_data_status: 'Done',
  method_data_subject: TASK_SUBJECT,
  method_data_submethod: 'syslog',
  method_data_to_address: '',
  method_data_tp_sms_hostname: '',
  method_data_tp_sms_tls_workaround: NO_VALUE,
  method_data_URL: '',
  method_data_delta_type: DELTA_TYPE_NONE,
  method_data_delta_report_id: '',
  name: _('Unnamed'),
  report_formats: [],
  report_format_ids: [],
  result_filters: [],
  secinfo_filters: [],
};

const StyledDivider = styled(Divider)`
  cursor: pointer;
`;

const AlertDialog = props => {
  const capabilities = useCapabilities();

  const [state, dispatch] = useReducer(reducer, DEFAULTS);

  useEffect(() => {
    dispatch(
      updateState({
        stateEvent: isDefined(props.event)
          ? props.event
          : EVENT_TYPE_TASK_RUN_STATUS_CHANGED,
      }),
    );
  }, [props.event]);

  const handleEventChange = (value, onValueChange) => {
    const {result_filters, secinfo_filters} = props;

    const is_task_event = isTaskEvent(value);
    let filter_id;

    if (onValueChange) {
      onValueChange(CONDITION_TYPE_ALWAYS, 'condition'); // reset condition

      if (is_task_event) {
        onValueChange(TASK_SUBJECT, 'method_data_subject');
        onValueChange(INCLUDE_MESSAGE_DEFAULT, 'method_data_message');
        onValueChange(ATTACH_MESSAGE_DEFAULT, 'method_data_message_attach');
        onValueChange(result_filters, 'condition_data_filters');
        onValueChange(DELTA_TYPE_NONE, 'method_data_delta_type');

        filter_id = selectSaveId(result_filters);
      } else if (isTicketEvent(value)) {
        onValueChange(DEFAULT_METHOD, 'method'); // reset method to avoid having an invalid method for tickets
        onValueChange(UNSET_VALUE, 'filter_id'); // reset filter_id
        onValueChange(undefined, 'method_data_subject');
        onValueChange(undefined, 'method_data_message');
        onValueChange(undefined, 'method_data_message_attach');
        onValueChange(undefined, 'method_data_delta_type');
      } else {
        onValueChange(DEFAULT_METHOD, 'method'); // reset method to avoid having an invalid method for secinfo
        onValueChange(SECINFO_SUBJECT, 'method_data_subject');
        onValueChange(INCLUDE_MESSAGE_SECINFO, 'method_data_message');
        onValueChange(ATTACH_MESSAGE_SECINFO, 'method_data_message_attach');
        onValueChange(secinfo_filters, 'condition_data_filters');

        filter_id = selectSaveId(secinfo_filters);
        onValueChange(UNSET_VALUE, 'filter_id'); // reset filter_id
      }

      onValueChange(filter_id, 'condition_data_at_least_filter_id');
    }
    // in addition to changing the event in the dialog, change it here as well
    // to have it handy in render()
    dispatch(updateState({stateEvent: value}));
  };

  const {
    credentials,
    filter_id,
    title = _('New Alert'),
    report_formats,
    report_format_ids,
    method_data_composer_include_notes,
    method_data_composer_include_overrides,
    method_data_recipient_credential,
    method_data_scp_credential,
    method_data_smb_credential,
    method_data_tp_sms_credential,
    method_data_verinice_server_credential,
    method_data_pkcs12_credential,
    method_data_vfire_base_url,
    method_data_vfire_credential,
    method_data_vfire_session_type,
    method_data_vfire_client_id,
    method_data_vfire_call_partition_name,
    method_data_vfire_call_description,
    method_data_vfire_call_template_name,
    method_data_vfire_call_type_name,
    method_data_vfire_call_impact_name,
    method_data_vfire_call_urgency_name,
    onClose,
    onEmailCredentialChange,
    onNewEmailCredentialClick,
    onNewPasswordOnlyCredentialClick,
    onNewScpCredentialClick,
    onNewSmbCredentialClick,
    onNewVeriniceCredentialClick,
    onNewVfireCredentialClick,
    onNewTippingPointCredentialClick,
    onOpenContentComposerDialogClick,
    onReportFormatsChange,
    onSave,
    onPasswordOnlyCredentialChange,
    onScpCredentialChange,
    onSmbCredentialChange,
    onTippingPointCredentialChange,
    onVerinceCredentialChange,
    onVfireCredentialChange,
  } = props;

  const {stateEvent: event} = state;

  const methodTypes = [];

  const taskEvent = isTaskEvent(event);
  const secinfoEvent = isSecinfoEvent(event);
  const ticketEvent = isTicketEvent(event);

  if (taskEvent) {
    methodTypes.push(
      {
        value: METHOD_TYPE_EMAIL,
        label: _('Email'),
      },
      {
        value: METHOD_TYPE_HTTP_GET,
        label: _('HTTP Get'),
      },
      {
        value: METHOD_TYPE_SCP,
        label: _('SCP'),
      },
      {
        value: METHOD_TYPE_SEND,
        label: _('Send to host'),
      },
      {
        value: METHOD_TYPE_SMB,
        label: _('SMB'),
      },
      {
        value: METHOD_TYPE_SNMP,
        label: _('SNMP'),
      },
      {
        value: METHOD_TYPE_SOURCEFIRE,
        label: _('Sourcefire Connector'),
      },
      {
        value: METHOD_TYPE_START_TASK,
        label: _('Start Task'),
      },
      {
        value: METHOD_TYPE_SYSLOG,
        label: _('System Logger'),
      },
      {
        value: METHOD_TYPE_VERINICE,
        label: _('verinice.PRO Connector'),
      },
      {
        value: METHOD_TYPE_TIPPING_POINT,
        label: _('TippingPoint SMS'),
      },
      {
        value: METHOD_TYPE_ALEMBA_VFIRE,
        label: _('Alemba vFire'),
      },
    );
  } else if (ticketEvent) {
    methodTypes.push(
      {
        value: METHOD_TYPE_EMAIL,
        label: _('Email'),
      },
      {
        value: METHOD_TYPE_SYSLOG,
        label: _('System Logger'),
      },
      {
        value: METHOD_TYPE_START_TASK,
        label: _('Start Task'),
      },
    );
  } else {
    methodTypes.push(
      {
        value: METHOD_TYPE_EMAIL,
        label: _('Email'),
      },
      {
        value: METHOD_TYPE_SCP,
        label: _('SCP'),
      },
      {
        value: METHOD_TYPE_SEND,
        label: _('Send to host'),
      },
      {
        value: METHOD_TYPE_SMB,
        label: _('SMB'),
      },
      {
        value: METHOD_TYPE_SNMP,
        label: _('SNMP'),
      },
      {
        value: METHOD_TYPE_SYSLOG,
        label: _('System Logger'),
      },
      {
        value: METHOD_TYPE_VERINICE,
        label: _('verinice.PRO Connector'),
      },
      {
        value: METHOD_TYPE_TIPPING_POINT,
        label: _('TippingPoint SMS'),
      },
      {
        value: METHOD_TYPE_ALEMBA_VFIRE,
        label: _('Alemba vFire'),
      },
    );
  }

  const data = {
    ...DEFAULTS,
    ...alert,
    method_data_vfire_base_url,
    method_data_vfire_client_id,
    method_data_vfire_call_partition_name,
    method_data_vfire_call_description,
    method_data_vfire_call_template_name,
    method_data_vfire_call_type_name,
    method_data_vfire_call_impact_name,
    method_data_vfire_call_urgency_name,
    method_data_vfire_session_type,
  };

  for (const [key, value] of Object.entries(props)) {
    if (isDefined(value)) {
      data[key] = value;
    }
  }

  const controlledValues = {
    event,
    filter_id,
    method_data_pkcs12_credential,
    method_data_composer_include_notes,
    method_data_composer_include_overrides,
    method_data_recipient_credential,
    method_data_scp_credential,
    method_data_smb_credential,
    method_data_tp_sms_credential,
    method_data_verinice_server_credential,
    method_data_vfire_credential,
    report_format_ids,
  };

  return (
    <SaveDialog
      title={title}
      defaultValues={data}
      values={controlledValues}
      onClose={onClose}
      onSave={onSave}
    >
      {({values, onValueChange}) => {
        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                value={values.name}
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={values.comment}
                grow="1"
                size="30"
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Event')} flex="column">
              <Divider flex="column">
                <TaskEventPart
                  prefix="event_data"
                  event={values.event}
                  status={values.event_data_status}
                  onEventChange={value =>
                    handleEventChange(value, onValueChange)
                  }
                  onChange={onValueChange}
                />

                <SecInfoEventPart
                  prefix="event_data"
                  event={values.event}
                  secinfoType={values.event_data_secinfo_type}
                  feedEvent={values.event_data_feed_event}
                  onEventChange={value =>
                    handleEventChange(value, onValueChange)
                  }
                  onChange={onValueChange}
                />
                <TicketEventPart
                  event={values.event}
                  onEventChange={value =>
                    handleEventChange(value, onValueChange)
                  }
                />
              </Divider>
            </FormGroup>

            <FormGroup title={_('Condition')} flex="column">
              <Divider flex="column">
                <Radio
                  title={_('Always')}
                  name="condition"
                  value={CONDITION_TYPE_ALWAYS}
                  checked={values.condition === CONDITION_TYPE_ALWAYS}
                  onChange={onValueChange}
                />

                {taskEvent && (
                  <SeverityLeastConditionPart
                    prefix="condition_data"
                    condition={values.condition}
                    severity={values.condition_data_severity}
                    onChange={onValueChange}
                  />
                )}

                {taskEvent && (
                  <SeverityChangedConditionPart
                    prefix="condition_data"
                    condition={values.condition}
                    direction={values.condition_data_direction}
                    onChange={onValueChange}
                  />
                )}

                {(secinfoEvent || taskEvent) && (
                  <FilterCountLeastConditionPart
                    prefix="condition_data"
                    condition={values.condition}
                    atLeastFilterId={values.condition_data_at_least_filter_id}
                    atLeastCount={values.condition_data_at_least_count}
                    filters={values.condition_data_filters}
                    onChange={onValueChange}
                  />
                )}

                {taskEvent && (
                  <FilterCountChangedConditionPart
                    prefix="condition_data"
                    condition={values.condition}
                    filterId={values.condition_data_filter_id}
                    count={values.condition_data_count}
                    filters={values.condition_data_filters}
                    onChange={onValueChange}
                  />
                )}
              </Divider>
            </FormGroup>

            {secinfoEvent && (
              <FormGroup title={_('Details URL')}>
                <TextField
                  grow="1"
                  name="method_data_details_url"
                  value={values.method_data_details_url}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            {capabilities.mayOp('get_filters') && taskEvent && (
              <FormGroup title={_('Report Content')}>
                <StyledDivider onClick={onOpenContentComposerDialogClick}>
                  <ReportIcon title={_('Compose Report Content')} />
                  <span>{_('Compose')}</span>
                </StyledDivider>
              </FormGroup>
            )}

            {taskEvent && (
              <FormGroup title={_('Delta Report')} flex="column">
                <Divider flex="column">
                  <Radio
                    title={_('None')}
                    name="method_data_delta_type"
                    value={DELTA_TYPE_NONE}
                    checked={values.method_data_delta_type === DELTA_TYPE_NONE}
                    onChange={onValueChange}
                  />

                  <Radio
                    title={_('Previous completed report of the same task')}
                    name="method_data_delta_type"
                    value={DELTA_TYPE_PREVIOUS}
                    checked={
                      values.method_data_delta_type === DELTA_TYPE_PREVIOUS
                    }
                    onChange={onValueChange}
                  />

                  <Divider>
                    <Radio
                      title={_('Report with ID')}
                      name="method_data_delta_type"
                      value={DELTA_TYPE_REPORT}
                      checked={
                        values.method_data_delta_type === DELTA_TYPE_REPORT
                      }
                      onChange={onValueChange}
                    />
                    <TextField
                      grow="1"
                      name="method_data_delta_report_id"
                      value={values.method_data_delta_report_id}
                      onChange={onValueChange}
                    />
                  </Divider>
                </Divider>
              </FormGroup>
            )}

            <FormGroup title={_('Method')}>
              <Select
                name="method"
                value={values.method}
                items={methodTypes}
                onChange={onValueChange}
              />
            </FormGroup>

            {values.method === METHOD_TYPE_EMAIL && (
              <EmailMethodPart
                prefix="method_data"
                credentials={credentials}
                event={event}
                fromAddress={values.method_data_from_address}
                message={values.method_data_message}
                messageAttach={values.method_data_message_attach}
                notice={values.method_data_notice}
                noticeAttachFormat={values.method_data_notice_attach_format}
                noticeReportFormat={values.method_data_notice_report_format}
                subject={values.method_data_subject}
                toAddress={values.method_data_to_address}
                recipientCredential={values.method_data_recipient_credential}
                reportFormats={report_formats}
                onChange={onValueChange}
                onCredentialChange={onEmailCredentialChange}
                onNewCredentialClick={onNewEmailCredentialClick}
              />
            )}

            {values.method === METHOD_TYPE_HTTP_GET && (
              <HttpMethodPart
                prefix="method_data"
                URL={values.method_data_URL}
                onChange={onValueChange}
              />
            )}

            {values.method === METHOD_TYPE_SCP && (
              <ScpMethodPart
                prefix="method_data"
                credentials={credentials}
                reportFormats={report_formats}
                scpCredential={values.method_data_scp_credential}
                scpHost={values.method_data_scp_host}
                scpKnownHosts={values.method_data_scp_known_hosts}
                scpPath={values.method_data_scp_path}
                scpReportFormat={values.method_data_scp_report_format}
                onNewCredentialClick={onNewScpCredentialClick}
                onCredentialChange={onScpCredentialChange}
                onChange={onValueChange}
              />
            )}

            {values.method === METHOD_TYPE_SEND && (
              <SendMethodPart
                prefix="method_data"
                sendHost={values.method_data_send_host}
                sendPort={values.method_data_send_port}
                sendReportFormat={values.method_data_send_report_format}
                reportFormats={report_formats}
                onChange={onValueChange}
              />
            )}

            {values.method === METHOD_TYPE_START_TASK && (
              <StartTaskMethodPart
                prefix="method_data"
                tasks={values.tasks}
                startTaskTask={values.method_data_start_task_task}
                onChange={onValueChange}
              />
            )}

            {values.method === METHOD_TYPE_SMB && (
              <SmbMethodPart
                prefix="method_data"
                credentials={credentials}
                reportFormats={report_formats}
                smbCredential={values.method_data_smb_credential}
                smbFilePath={values.method_data_smb_file_path}
                smbSharePath={values.method_data_smb_share_path}
                smbReportFormat={values.method_data_smb_report_format}
                onNewCredentialClick={onNewSmbCredentialClick}
                onChange={onValueChange}
                onCredentialChange={onSmbCredentialChange}
              />
            )}

            {values.method === METHOD_TYPE_SNMP && (
              <SnmpMethodPart
                prefix="method_data"
                snmpAgent={values.method_data_snmp_agent}
                snmpCommunity={values.method_data_snmp_community}
                snmpMessage={values.method_data_snmp_message}
                onChange={onValueChange}
              />
            )}

            {values.method === METHOD_TYPE_SOURCEFIRE && (
              <SourcefireMethodPart
                credentials={credentials}
                pkcs12Credential={values.method_data_pkcs12_credential}
                prefix="method_data"
                defenseCenterIp={values.method_data_defense_center_ip}
                defenseCenterPort={parseInt(
                  values.method_data_defense_center_port,
                )}
                onChange={onValueChange}
                onCredentialChange={onPasswordOnlyCredentialChange}
                onNewCredentialClick={onNewPasswordOnlyCredentialClick}
              />
            )}

            {values.method === METHOD_TYPE_VERINICE && (
              <VeriniceMethodPart
                prefix="method_data"
                credentials={credentials}
                reportFormats={report_formats}
                veriniceServerUrl={values.method_data_verinice_server_url}
                veriniceServerCredential={
                  values.method_data_verinice_server_credential
                }
                veriniceServerReportFormat={
                  values.method_data_verinice_server_report_format
                }
                onNewCredentialClick={onNewVeriniceCredentialClick}
                onChange={onValueChange}
                onCredentialChange={onVerinceCredentialChange}
              />
            )}

            {values.method === METHOD_TYPE_TIPPING_POINT && (
              <TippingPontMethodPart
                prefix="method_data"
                credentials={credentials}
                tpSmsCredential={values.method_data_tp_sms_credential}
                tpSmsHostname={values.method_data_tp_sms_hostname}
                tpSmsTlsWorkaround={values.method_data_tp_sms_tls_workaround}
                onNewCredentialClick={onNewTippingPointCredentialClick}
                onChange={onValueChange}
                onCredentialChange={onTippingPointCredentialChange}
              />
            )}

            {values.method === METHOD_TYPE_ALEMBA_VFIRE && (
              <AlembaVfireMethodPart
                prefix="method_data"
                credentials={credentials}
                reportFormats={report_formats}
                reportFormatIds={values.report_format_ids}
                vFireBaseUrl={values.method_data_vfire_base_url}
                vFireCallDescription={values.method_data_vfire_call_description}
                vFireCallImpactName={values.method_data_vfire_call_impact_name}
                vFireCallPartitionName={
                  values.method_data_vfire_call_partition_name
                }
                vFireCallTemplateName={
                  values.method_data_vfire_call_template_name
                }
                vFireCallTypeName={values.method_data_vfire_call_type_name}
                vFireCallUrgencyName={
                  values.method_data_vfire_call_urgency_name
                }
                vFireClientId={values.method_data_vfire_client_id}
                vFireCredential={values.method_data_vfire_credential}
                vFireSessionType={values.method_data_vfire_session_type}
                onChange={onValueChange}
                onCredentialChange={onVfireCredentialChange}
                onReportFormatsChange={onReportFormatsChange}
                onNewVfireCredentialClick={onNewVfireCredentialClick}
              />
            )}

            <FormGroup title={_('Active')}>
              <YesNoRadio
                name="active"
                value={values.active}
                onChange={onValueChange}
              />
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

AlertDialog.propTypes = {
  active: PropTypes.yesno,
  comment: PropTypes.string,
  condition: PropTypes.string,
  condition_data_at_least_count: PropTypes.number,
  condition_data_at_least_filter_id: PropTypes.id,
  condition_data_count: PropTypes.number,
  condition_data_direction: PropTypes.string,
  condition_data_filter_id: PropTypes.id,
  condition_data_filters: PropTypes.array,
  condition_data_severity: PropTypes.number,
  credentials: PropTypes.array,
  event: PropTypes.string,
  event_data_feed_event: PropTypes.string,
  event_data_secinfo_type: PropTypes.string,
  event_data_status: PropTypes.string,
  filter_id: PropTypes.idOrZero,
  method: PropTypes.string,
  method_data_URL: PropTypes.string,
  method_data_composer_include_notes: PropTypes.number,
  method_data_composer_include_overrides: PropTypes.number,
  method_data_defense_center_ip: PropTypes.string,
  method_data_defense_center_port: PropTypes.numberOrNumberString,
  method_data_delta_report_id: PropTypes.string,
  method_data_delta_type: PropTypes.string,
  method_data_details_url: PropTypes.string,
  method_data_from_address: PropTypes.string,
  method_data_message: PropTypes.string,
  method_data_message_attach: PropTypes.string,
  method_data_notice: PropTypes.string,
  method_data_notice_attach_format: PropTypes.id,
  method_data_notice_report_format: PropTypes.id,
  method_data_pkcs12_credential: PropTypes.id,
  method_data_recipient_credential: PropTypes.id,
  method_data_scp_credential: PropTypes.id,
  method_data_scp_host: PropTypes.string,
  method_data_scp_known_hosts: PropTypes.string,
  method_data_scp_path: PropTypes.string,
  method_data_scp_report_format: PropTypes.id,
  method_data_send_host: PropTypes.string,
  method_data_send_port: PropTypes.string,
  method_data_send_report_format: PropTypes.id,
  method_data_smb_credential: PropTypes.id,
  method_data_smb_file_path: PropTypes.string,
  method_data_smb_report_format: PropTypes.id,
  method_data_smb_share_path: PropTypes.string,
  method_data_snmp_agent: PropTypes.string,
  method_data_snmp_community: PropTypes.string,
  method_data_snmp_message: PropTypes.string,
  method_data_start_task_task: PropTypes.id,
  method_data_subject: PropTypes.string,
  method_data_to_address: PropTypes.string,
  method_data_tp_sms_credential: PropTypes.id,
  method_data_tp_sms_hostname: PropTypes.string,
  method_data_tp_sms_tls_workaround: PropTypes.yesno,
  method_data_verinice_server_credential: PropTypes.id,
  method_data_verinice_server_report_format: PropTypes.id,
  method_data_verinice_server_url: PropTypes.string,
  method_data_vfire_base_url: PropTypes.string,
  method_data_vfire_call_description: PropTypes.string,
  method_data_vfire_call_impact_name: PropTypes.string,
  method_data_vfire_call_partition_name: PropTypes.string,
  method_data_vfire_call_template_name: PropTypes.string,
  method_data_vfire_call_type_name: PropTypes.string,
  method_data_vfire_call_urgency_name: PropTypes.string,
  method_data_vfire_client_id: PropTypes.string,
  method_data_vfire_credential: PropTypes.id,
  method_data_vfire_session_type: PropTypes.string,
  name: PropTypes.string,
  report_format_ids: PropTypes.array,
  report_formats: PropTypes.array,
  result_filters: PropTypes.array,
  secinfo_filters: PropTypes.array,
  tasks: PropTypes.array,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onEmailCredentialChange: PropTypes.func.isRequired,
  onNewEmailCredentialClick: PropTypes.func.isRequired,
  onNewPasswordOnlyCredentialClick: PropTypes.func.isRequired,
  onNewScpCredentialClick: PropTypes.func.isRequired,
  onNewSmbCredentialClick: PropTypes.func.isRequired,
  onNewTippingPointCredentialClick: PropTypes.func.isRequired,
  onNewVeriniceCredentialClick: PropTypes.func.isRequired,
  onNewVfireCredentialClick: PropTypes.func.isRequired,
  onOpenContentComposerDialogClick: PropTypes.func.isRequired,
  onPasswordOnlyCredentialChange: PropTypes.func.isRequired,
  onReportFormatsChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onScpCredentialChange: PropTypes.func.isRequired,
  onSmbCredentialChange: PropTypes.func.isRequired,
  onTippingPointCredentialChange: PropTypes.func.isRequired,
  onVerinceCredentialChange: PropTypes.func.isRequired,
  onVfireCredentialChange: PropTypes.func.isRequired,
};

export default AlertDialog;

// vim: set ts=2 sw=2 tw=80:
