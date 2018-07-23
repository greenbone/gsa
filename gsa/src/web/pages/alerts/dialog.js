/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import 'core-js/fn/object/entries';

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {
  CONDITION_TYPE_ALWAYS,
  EVENT_TYPE_TASK_RUN_STATUS_CHANGED,
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
} from 'gmp/models/alert';

import PropTypes from '../../utils/proptypes.js';
import {renderSelectItems} from '../../utils/render.js';
import withCapabilities from '../../utils/withCapabilities.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import Select from '../../components/form/select.js';
import FormGroup from '../../components/form/formgroup.js';
import TextField from '../../components/form/textfield.js';
import Radio from '../../components/form/radio.js';
import YesNoRadio from '../../components/form/yesnoradio.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import HttpMethodPart from './httpmethodpart.js';
import ScpMethodPart from './scpmethodpart.js';
import EmailMethodPart from './emailmethodpart.js';
import SendMethodPart from './sendmethodpart.js';
import StartTaskMethodPart from './starttaskmethodpart.js';
import SmbMethodPart from './smbmethodpart.js';
import SnmpMethodPart from './snmpmethodpart.js';
import SourcefireMethodPart from './sourcefiremethodpart.js';
import TippingPontMethodPart from './tippingpointmethodpart.js';
import VeriniceMethodPart from './verinicemethodpart.js';

import TaskEventPart from './taskeventpart.js';
import SecInfoEventPart from './secinfoeventpart.js';

import SeverityLeastConditionPart from './severityleastconditionpart.js';
import SeverityChangedConditionPart from './severitychangedconditionpart.js';
import FilterCountLeastConditionPart from './filtercountleastconditionpart.js';
import FilterCountChangedConditionPart from
  './filtercountchangedconditionpart.js';

export const DEFAULT_DEFENSE_CENTER_PORT = '8307';
export const DEFAULT_DIRECTION = 'changed';
export const DEFAULT_EVENT_STATUS = 'Done';
export const DEFAULT_METHOD = METHOD_TYPE_EMAIL;
export const DEFAULT_SCP_PATH = 'report.xml';
export const DEFAULT_SECINFO_TYPE = 'nvt';
export const DEFAULT_SEVERITY = 0.1;

export const DEFAULT_DETAILS_URL = 'https://secinfo.greenbone.net/omp?' +
  'cmd=get_info&info_type=$t&info_id=$o&details=1&token=guest';

export const DEFAULT_NOTICE = '1';
export const NOTICE_SIMPLE = '1';
export const NOTICE_INCLUDE = '0';
export const NOTICE_ATTACH = '2';

export const DEFAULT_NOTICE_REPORT_FORMAT =
  '19f6f1b3-7128-4433-888c-ccc764fe6ed5';
export const DEFAULT_NOTICE_ATTACH_FORMAT =
  '1a60a67e-97d0-4cbf-bc77-f71b08e7043d';

export const TASK_SUBJECT = '[GVM] Task \'$n\': $e';
export const SECINFO_SUBJECT = '[GVM] $T $q $S since $d';

export const INCLUDE_MESSAGE_DEFAULT =
`Task '$n': $e'

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

export const INCLUDE_MESSAGE_SECINFO =
`After the event $e,
the following condition was met: $c

$t
$i

Note:
This email was sent to you as a configured security information escalation.
Please contact your local system administrator if you think you
should not have received it.`;

export const ATTACH_MESSAGE_DEFAULT =
`Task '$n': $e

After the event $e,
the following condition was met: $c

This email escalation is configured to attach report format '$r'.
Full details and other report formats are available on the scan engine.

$t

Note:
This email was sent to you as a configured security scan escalation.
Please contact your local system administrator if you think you
should not have received it.`;

export const ATTACH_MESSAGE_SECINFO =
`After the event $e,
the following condition was met: $c

This email escalation is configured to attach the resource list.

$t

Note:
This email was sent to you as a configured security information escalation.
Please contact your local system administrator if you think you
should not have received it.
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
  result_filters: [],
  secinfo_filters: [],
};

class AlertDialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {stateEvent: EVENT_TYPE_TASK_RUN_STATUS_CHANGED};

    this.handleEventChange = this.handleEventChange.bind(this);
  }

  handleEventChange(value, onValueChange) {
    const {
      method_data_subject,
      method_data_message,
      method_data_message_attach,
      result_filters,
      secinfo_filters,
    } = this.props;

    const is_task_event = value === EVENT_TYPE_TASK_RUN_STATUS_CHANGED;
    let filter_id;

    if (onValueChange) {

      onValueChange(value, 'event');

      if (is_task_event) {
        if (method_data_subject === SECINFO_SUBJECT) {
          onValueChange(TASK_SUBJECT, 'method_data_subject');
        }
        if (method_data_message === INCLUDE_MESSAGE_SECINFO) {
          onValueChange(INCLUDE_MESSAGE_DEFAULT, 'method_data_message');
        }
        if (method_data_message_attach === ATTACH_MESSAGE_SECINFO) {
          onValueChange(ATTACH_MESSAGE_DEFAULT, 'method_data_message_attach');
        }
        onValueChange(result_filters, 'condition_data_filters');

        filter_id = selectSaveId(result_filters);

      }
      else {
        onValueChange(DEFAULT_METHOD, 'method'); // reset method to avoid having an invalid method for secinfo

        if (method_data_subject === TASK_SUBJECT) {
          onValueChange(SECINFO_SUBJECT, 'method_data_subject');
        }
        if (method_data_message === INCLUDE_MESSAGE_DEFAULT) {
          onValueChange(INCLUDE_MESSAGE_SECINFO, 'method_data_message');
        }
        if (method_data_message_attach === ATTACH_MESSAGE_DEFAULT) {
          onValueChange(ATTACH_MESSAGE_SECINFO, 'method_data_message_attach');
        }
        onValueChange(secinfo_filters, 'condition_data_filters');

        filter_id = selectSaveId(secinfo_filters);

        onValueChange('0', 'filter_id'); // reset filter_id
      }

      onValueChange(filter_id, 'condition_data_at_least_filter_id');
    }
    // in addition to changing the event in the dialog, change it here as well
    // to have it handy in render()
    this.setState({stateEvent: value});
  }

  render() {
    const {
      capabilities,
      credentials,
      title = _('New Alert'),
      visible = true,
      report_formats,
      method_data_scp_credential,
      method_data_smb_credential,
      method_data_tp_sms_credential,
      method_data_verinice_server_credential,
      onClose,
      onNewScpCredentialClick,
      onNewSmbCredentialClick,
      onNewVeriniceCredentialClick,
      onNewTippingPointCredentialClick,
      onSave,
      onScpCredentialChange,
      onSmbCredentialChange,
      onTippingPointCredentialChange,
      onVerinceCredentialChange,
      ...props
    } = this.props;

    const {stateEvent: event} = this.state;

    const is_task_event = event === EVENT_TYPE_TASK_RUN_STATUS_CHANGED;

    const method_types = [{
      value: METHOD_TYPE_EMAIL,
      label: _('Email'),
    }];

    if (is_task_event) {
      method_types.push({
        value: METHOD_TYPE_HTTP_GET,
        label: _('HTTP Get'),
      });
    }

    method_types.push({
      value: METHOD_TYPE_SCP,
      label: _('SCP'),
    }, {
      value: METHOD_TYPE_SEND,
      label: _('Send to host'),
    }, {

      value: METHOD_TYPE_SMB,
      label: _('SMB'),
    }, {
      value: METHOD_TYPE_SNMP,
      label: _('SNMP'),
    });

    if (is_task_event) {
      method_types.push({
        value: METHOD_TYPE_SOURCEFIRE,
        label: _('Sourcefire Connector'),
      }, {
          value: METHOD_TYPE_START_TASK,
          label: _('Start Task'),
      });
    }

    method_types.push({
      value: METHOD_TYPE_SYSLOG,
      label: _('System Logger'),
    }, {
      value: METHOD_TYPE_VERINICE,
      label: _('verinice.PRO Connector'),
    }, {
      value: METHOD_TYPE_TIPPING_POINT,
      label: _('TippingPoint SMS'),
    });

    const data = {
      ...DEFAULTS,
      ...alert,
    };

    for (const [key, value] of Object.entries(props)) {
      if (isDefined(value)) {
        data[key] = value;
      }
    }

    const controlledValues = {
      method_data_scp_credential,
      method_data_smb_credential,
      method_data_tp_sms_credential,
      method_data_verinice_server_credential,
    };

    return (
      <SaveDialog
        visible={visible}
        title={title}
        defaultValues={data}
        values={controlledValues}
        onClose={onClose}
        onSave={onSave}
      >
        {({
          values,
          onValueChange,
        }) => {
          return (
            <Layout flex="column">

              <FormGroup title={_('Name')}>
                <TextField
                  name="name"
                  grow="1"
                  value={values.name}
                  size="30"
                  onChange={onValueChange}
                  maxLength="80"
                />
              </FormGroup>

              <FormGroup title={_('Comment')}>
                <TextField
                  name="comment"
                  value={values.comment}
                  grow="1"
                  size="30"
                  maxLength="400"
                  onChange={onValueChange}
                />
              </FormGroup>

              <FormGroup title={_('Event')} flex="column">
                <Divider flex="column">
                  <TaskEventPart
                    prefix="event_data"
                    event={values.event}
                    status={values.event_data_status}
                    onEventChange={
                      value => this.handleEventChange(value, onValueChange)}
                    onChange={onValueChange}
                  />

                  <SecInfoEventPart
                    prefix="event_data"
                    event={values.event}
                    secinfoType={values.event_data_secinfo_type}
                    feedEvent={values.event_data_feed_event}
                    onEventChange={
                      value => this.handleEventChange(value, onValueChange)}
                    onChange={onValueChange}
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

                  {is_task_event &&
                    <SeverityLeastConditionPart
                      prefix="condition_data"
                      condition={values.condition}
                      severity={values.condition_data_severity}
                      onChange={onValueChange}
                    />
                  }

                  {is_task_event &&
                    <SeverityChangedConditionPart
                      prefix="condition_data"
                      condition={values.condition}
                      direction={values.condition_data_direction}
                      onChange={onValueChange}
                    />
                  }

                  <FilterCountLeastConditionPart
                    prefix="condition_data"
                    condition={values.condition}
                    atLeastFilterId={values.condition_data_at_least_filter_id}
                    atLeastCount={values.condition_data_at_least_count}
                    filters={values.condition_data_filters}
                    onChange={onValueChange}
                  />

                  {is_task_event &&
                    <FilterCountChangedConditionPart
                      prefix="condition_data"
                      condition={values.condition}
                      filterId={values.condition_data_filter_id}
                      count={values.condition_data_count}
                      filters={values.condition_data_filters}
                      onChange={onValueChange}
                    />
                  }
                </Divider>
              </FormGroup>

              {!is_task_event &&
                <FormGroup title={_('Details URL')}>
                  <TextField
                    grow="1"
                    name="method_data_details_url"
                    value={values.method_data_details_url}
                    onChange={onValueChange}
                  />
                </FormGroup>
              }

              {capabilities.mayOp('get_filters') &&
                is_task_event &&
                <FormGroup title={_('Report Result Filter')}>
                  <Select
                    value={values.filter_id}
                    name="filter_id"
                    items={renderSelectItems(values.result_filters, 0)}
                    onChange={onValueChange}
                  />
                </FormGroup>
              }

              {is_task_event &&
                <FormGroup title={_('Delta Report')} flex="column">
                  <Divider flex="column">
                    <Radio
                      title={_('None')}
                      name="method_data_delta_type"
                      value={DELTA_TYPE_NONE}
                      checked={
                        values.method_data_delta_type === DELTA_TYPE_NONE}
                      onChange={onValueChange}
                    />

                    <Radio
                      title={_('Previous completed report of the same task')}
                      name="method_data_delta_type"
                      value={DELTA_TYPE_PREVIOUS}
                      checked={
                        values.method_data_delta_type === DELTA_TYPE_PREVIOUS}
                      onChange={onValueChange}
                    />

                    <Divider>
                      <Radio
                        title={_('Report with ID')}
                        name="method_data_delta_type"
                        value={DELTA_TYPE_REPORT}
                        checked={
                          values.method_data_delta_type === DELTA_TYPE_REPORT}
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
              }

              <FormGroup title={_('Method')}>
                <Select
                  name="method"
                  value={values.method}
                  items={method_types}
                  onChange={onValueChange}
                />
              </FormGroup>

              {values.method === METHOD_TYPE_EMAIL &&
                <EmailMethodPart
                  prefix="method_data"
                  fromAddress={values.method_data_from_address}
                  message={values.method_data_message}
                  messageAttach={values.method_data_message_attach}
                  notice={values.method_data_notice}
                  noticeAttachFormat={values.method_data_notice_attach_format}
                  noticeReportFormat={values.method_data_notice_report_format}
                  subject={values.method_data_subject}
                  toAddress={values.method_data_to_address}
                  reportFormats={report_formats}
                  isTaskEvent={is_task_event}
                  onChange={onValueChange}
                />
              }

              {values.method === METHOD_TYPE_HTTP_GET &&
                <HttpMethodPart
                  prefix="method_data"
                  URL={values.method_data_URL}
                  onChange={onValueChange}
                />
              }

              {values.method === METHOD_TYPE_SCP &&
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
              }

              {values.method === METHOD_TYPE_SEND &&
                <SendMethodPart
                  prefix="method_data"
                  sendHost={values.method_data_send_host}
                  sendPort={values.method_data_send_port}
                  sendReportFormat={values.method_data_send_report_format}
                  reportFormats={report_formats}
                  onChange={onValueChange}
                />
              }

              {values.method === METHOD_TYPE_START_TASK &&
                <StartTaskMethodPart
                  prefix="method_data"
                  tasks={values.tasks}
                  startTaskTask={values.method_data_start_task_task}
                  onChange={onValueChange}
                />
              }

              {values.method === METHOD_TYPE_SMB &&
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
              }

              {values.method === METHOD_TYPE_SNMP &&
                <SnmpMethodPart
                  prefix="method_data"
                  snmpAgent={values.method_data_snmp_agent}
                  snmpCommunity={values.method_data_snmp_community}
                  snmpMessage={values.method_data_snmp_message}
                  onChange={onValueChange}
                />
              }

              {values.method === METHOD_TYPE_SOURCEFIRE &&
                <SourcefireMethodPart
                  prefix="method_data"
                  defenseCenterIp={values.method_data_defense_center_ip}
                  defenseCenterPort={values.method_data_defense_center_port}
                  onChange={onValueChange}
                />
              }

              {values.method === METHOD_TYPE_VERINICE &&
                <VeriniceMethodPart
                  prefix="method_data"
                  credentials={credentials}
                  reportFormats={report_formats}
                  veriniceServerUrl={values.method_data_verinice_server_url}
                  veriniceServerCredential=
                    {values.method_data_verinice_server_credential}
                  veriniceServerReportFormat=
                    {values.method_data_verinice_server_report_format}
                  onNewCredentialClick={onNewVeriniceCredentialClick}
                  onChange={onValueChange}
                  onCredentialChange={onVerinceCredentialChange}
                />
              }

              {values.method === METHOD_TYPE_TIPPING_POINT &&
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
              }

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
  }
}

AlertDialog.propTypes = {
  active: PropTypes.yesno,
  capabilities: PropTypes.capabilities.isRequired,
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
  name: PropTypes.string,
  report_formats: PropTypes.array,
  result_filters: PropTypes.array,
  secinfo_filters: PropTypes.array,
  tasks: PropTypes.array,
  title: PropTypes.string,
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onNewScpCredentialClick: PropTypes.func.isRequired,
  onNewSmbCredentialClick: PropTypes.func.isRequired,
  onNewTippingPointCredentialClick: PropTypes.func.isRequired,
  onNewVeriniceCredentialClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onScpCredentialChange: PropTypes.func.isRequired,
  onSmbCredentialChange: PropTypes.func.isRequired,
  onTippingPointCredentialChange: PropTypes.func.isRequired,
  onVerinceCredentialChange: PropTypes.func.isRequired,
};

export default withCapabilities(AlertDialog);

// vim: set ts=2 sw=2 tw=80:
