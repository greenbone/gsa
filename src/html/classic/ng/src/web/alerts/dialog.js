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

import PropTypes from '../utils/proptypes.js';
import {render_options} from '../utils/render.js';

import {withDialog} from '../components/dialog/dialog.js';

import Select2 from '../components/form/select2.js';
import FormGroup from '../components/form/formgroup.js';
import TextField from '../components/form/textfield.js';
import Radio from '../components/form/radio.js';
import YesNoRadio from '../components/form/yesnoradio.js';

import Layout from '../components/layout/layout.js';

import HttpMethodPart from './httpmethodpart.js';
import ScpMethodPart from './scpmethodpart.js';
import EmailMethodPart from './emailmethodpart.js';
import SendMethodPart from './sendmethodpart.js';
import StartTaskMethodPart from './starttaskmethodpart.js';
import SnmpMethodPart from './snmpmethodpart.js';
import SourcefireMethodPart from './sourcefiremethodpart.js';
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
export const DEFAULT_METHOD = 'Email';
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

class AlertDialog extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleEventChange = this.handleEventChange.bind(this);
  }

  handleEventChange(value) {
    let {
      method_data_subject,
      method_data_message,
      method_data_message_attach,
      result_filters,
      secinfo_filters,
      onValueChange,
    } = this.props;

    let is_task_event = value === 'Task run status changed';
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

        filter_id = select_save_id(result_filters);

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

        filter_id = select_save_id(secinfo_filters);

        onValueChange('0', 'filter_id'); // reset filter_id
      }

      onValueChange(filter_id, 'condition_data_at_least_filter_id');
    }
  }

  render() {
    let {
      active,
      name,
      comment,
      condition,
      condition_data_at_least_filter_id,
      condition_data_at_least_count,
      condition_data_count,
      condition_data_direction,
      condition_data_filter_id,
      condition_data_filters,
      condition_data_severity,
      credentials,
      event,
      event_data_feed_event,
      event_data_secinfo_type,
      event_data_status,
      filter_id,
      method,
      method_data_details_url,
      method_data_from_address,
      method_data_message,
      method_data_message_attach,
      method_data_notice,
      method_data_notice_attach_format,
      method_data_notice_report_format,
      method_data_subject,
      method_data_to_address,
      method_data_scp_credential,
      method_data_scp_host,
      method_data_scp_known_hosts,
      method_data_scp_path,
      method_data_scp_report_format,
      method_data_send_host,
      method_data_send_port,
      method_data_send_report_format,
      method_data_start_task_task,
      method_data_snmp_agent,
      method_data_snmp_community,
      method_data_snmp_message,
      method_data_defense_center_ip,
      method_data_defense_center_port,
      method_data_verinice_server_url,
      method_data_verinice_server_credential,
      method_data_verinice_server_report_format,
      method_data_URL,
      report_formats,
      result_filters,
      tasks,
      onNewScpCredentialClick,
      onNewVeriniceCredentialClick,
      onValueChange,
    } = this.props;
    let {capabilities} = this.context;
    let is_task_event = event === 'Task run status changed';
    return (
      <Layout flex="column">

        <FormGroup title={_('Name')}>
          <TextField
            name="name"
            grow="1"
            value={name}
            size="30"
            onChange={onValueChange}
            maxLength="80"/>
        </FormGroup>

        <FormGroup title={_('Comment')}>
          <TextField
            name="comment"
            value={comment}
            grow="1"
            size="30"
            maxLength="400"
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Event')} flex="column">
          <TaskEventPart
            prefix="event_data"
            event={event}
            status={event_data_status}
            onEventChange={this.handleEventChange}
            onChange={onValueChange}/>

          <SecInfoEventPart
            prefix="event_data"
            event={event}
            secinfoType={event_data_secinfo_type}
            feedEvent={event_data_feed_event}
            onEventChange={this.handleEventChange}
            onChange={onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Condition')} flex="column">

          <Radio
            title={_('Always')}
            name="condition"
            value="Always"
            checked={condition === 'Always'}
            onChange={onValueChange}/>

          {is_task_event &&
            <SeverityLeastConditionPart
              prefix="condition_data"
              condition={condition}
              severity={condition_data_severity}
              onChange={onValueChange}/>
          }

          {is_task_event &&
            <SeverityChangedConditionPart
              prefix="condition_data"
              condition={condition}
              direction={condition_data_direction}
              onChange={onValueChange}/>
          }

          <FilterCountLeastConditionPart
            prefix="condition_data"
            condition={condition}
            atLeastFilterId={condition_data_at_least_filter_id}
            atLeastCount={condition_data_at_least_count}
            filters={condition_data_filters}
            onChange={onValueChange}/>

          {is_task_event &&
            <FilterCountChangedConditionPart
              prefix="condition_data"
              condition={condition}
              filterId={condition_data_filter_id}
              count={condition_data_count}
              filters={condition_data_filters}
              onChange={onValueChange}/>
          }
        </FormGroup>

        {!is_task_event &&
          <FormGroup title={_('Details URL')}>
            <TextField
              grow="1"
              name="method_data_details_url"
              value={method_data_details_url}
              onChange={onValueChange}/>
          </FormGroup>
        }

        {capabilities.mayOp('get_filters') &&
          is_task_event &&
          <FormGroup title={_('Report Result Filter')}>
            <Select2
              value={filter_id}
              name="filter_id"
              onChange={onValueChange}>
              {render_options(result_filters, 0)}
            </Select2>
          </FormGroup>
        }

        <FormGroup title={_('Method')}>
          <Select2
            name="method"
            value={method}
            onChange={onValueChange}>
            <option value="Email">{_('Email')}</option>
            <option value="HTTP Get" disabled={!is_task_event}>
              {_('HTTP Get')}
            </option>
            <option value="SCP">{_('SCP')}</option>
            <option value="Send">{_('Send to host')}</option>
            <option value="SNMP">{_('SNMP')}</option>
            <option value="Sourcefire Connector" disabled={!is_task_event}>
              {_('Sourcefire Connector')}
            </option>
            <option value="Start Task" disabled={!is_task_event}>
              {_('Start Task')}
            </option>
            <option value="Syslog">{_('System Logger')}</option>
            <option value="verinice Connector">
              {_('verinice.PRO Connector')}
            </option>
          </Select2>
        </FormGroup>

        {method === 'Email' &&
          <EmailMethodPart
            prefix="method_data"
            fromAddress={method_data_from_address}
            message={method_data_message}
            messageAttach={method_data_message_attach}
            notice={method_data_notice}
            noticeAttachFormat={method_data_notice_attach_format}
            noticeReportFormat={method_data_notice_report_format}
            subject={method_data_subject}
            toAddress={method_data_to_address}
            reportFormats={report_formats}
            isTaskEvent={is_task_event}
            onChange={onValueChange}/>
        }

        {method === 'HTTP Get' &&
          <HttpMethodPart
            prefix="method_data"
            URL={method_data_URL}
            onChange={onValueChange}/>
        }

        {method === 'SCP' &&
          <ScpMethodPart
            prefix="method_data"
            credentials={credentials}
            reportFormats={report_formats}
            onChange={onValueChange}
            scpCredential={method_data_scp_credential}
            scpHost={method_data_scp_host}
            scpKnownHosts={method_data_scp_known_hosts}
            scpPath={method_data_scp_path}
            scpReportFormat={method_data_scp_report_format}
            onNewCredentialClick={onNewScpCredentialClick}
            />
        }

        {method === 'Send' &&
          <SendMethodPart
            prefix="method_data"
            sendHost={method_data_send_host}
            sendPort={method_data_send_port}
            sendReportFormat={method_data_send_report_format}
            reportFormats={report_formats}
            onChange={onValueChange}/>
        }

        {method === 'Start Task' &&
          <StartTaskMethodPart
            prefix="method_data"
            tasks={tasks}
            startTaskTask={method_data_start_task_task}
            onChange={onValueChange}/>
        }

        {method === 'SNMP' &&
          <SnmpMethodPart
            prefix="method_data"
            snmpAgent={method_data_snmp_agent}
            snmpCommunity={method_data_snmp_community}
            snmpMessage={method_data_snmp_message}
            onChange={onValueChange}/>
        }

        {method === 'Sourcefire Connector' &&
          <SourcefireMethodPart
            prefix="method_data"
            defenseCenterIp={method_data_defense_center_ip}
            defenseCenterPort={method_data_defense_center_port}
            onChange={onValueChange}/>
        }

        {method === 'verinice Connector' &&
          <VeriniceMethodPart
            prefix="method_data"
            credentials={credentials}
            reportFormats={report_formats}
            veriniceServerUrl={method_data_verinice_server_url}
            veriniceServerCredential={method_data_verinice_server_credential}
            veriniceServerReportFormat={
              method_data_verinice_server_report_format}
            onNewCredentialClick={onNewVeriniceCredentialClick}
            onChange={onValueChange}/>
        }

        <FormGroup title={_('Active')}>
          <YesNoRadio
            name="active"
            value={active}
            onChange={onValueChange}
          />
        </FormGroup>

      </Layout>
    );
  }
}

AlertDialog.propTypes = {
  active: PropTypes.yesno,
  name: PropTypes.string,
  comment: PropTypes.string,
  condition: PropTypes.string,
  condition_data_severity: PropTypes.number,
  condition_data_at_least_filter_id: PropTypes.id,
  condition_data_at_least_count: PropTypes.number,
  condition_data_filter_id: PropTypes.id,
  condition_data_filters: PropTypes.arrayLike,
  condition_data_count: PropTypes.number,
  condition_data_direction: PropTypes.string,
  credentials: PropTypes.arrayLike,
  event_data_feed_event: PropTypes.string.isRequired,
  event_data_secinfo_type: PropTypes.string.isRequired,
  event_data_status: PropTypes.string.isRequired,
  event: PropTypes.string.isRequired,
  filter_id: PropTypes.idOrZero,
  method: PropTypes.string,
  method_data_details_url: PropTypes.string,
  method_data_from_address: PropTypes.string,
  method_data_message_attach: PropTypes.string,
  method_data_message: PropTypes.string,
  method_data_notice_attach_format: PropTypes.id,
  method_data_notice: PropTypes.string,
  method_data_notice_report_format: PropTypes.id,
  method_data_subject: PropTypes.string,
  method_data_to_address: PropTypes.string,
  method_data_scp_credential: PropTypes.id,
  method_data_scp_host: PropTypes.string,
  method_data_scp_known_hosts: PropTypes.string,
  method_data_scp_path: PropTypes.string,
  method_data_scp_report_format: PropTypes.id,
  method_data_URL: PropTypes.string,
  method_data_send_host: PropTypes.string,
  method_data_send_port: PropTypes.string,
  method_data_send_report_format: PropTypes.id,
  method_data_start_task_task: PropTypes.id,
  method_data_snmp_agent: PropTypes.string,
  method_data_snmp_community: PropTypes.string,
  method_data_snmp_message: PropTypes.string,
  method_data_defense_center_ip: PropTypes.string,
  method_data_defense_center_port: PropTypes.string,
  method_data_verinice_server_url: PropTypes.string,
  method_data_verinice_server_credential: PropTypes.id,
  method_data_verinice_server_report_format: PropTypes.id,
  report_formats: PropTypes.arrayLike,
  result_filters: PropTypes.arrayLike,
  secinfo_filters: PropTypes.arrayLike,
  tasks: PropTypes.arrayLike,
  onNewScpCredentialClick: PropTypes.func,
  onNewVeriniceCredentialClick: PropTypes.func,
  onValueChange: PropTypes.func,
};

AlertDialog.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withDialog(AlertDialog, {
  title: _('New Alert'),
  footer: _('Save'),
  defaultState: {
    active: 1,
    comment: '',
    condition: 'Always',
    condition_data_at_least_count: 1,
    condition_data_count: 1,
    condition_data_direction: DEFAULT_DIRECTION,
    condition_data_filters: [],
    condition_data_severity: DEFAULT_SEVERITY,
    event_data_feed_event: 'new',
    event_data_secinfo_type: DEFAULT_SECINFO_TYPE,
    event_data_status: DEFAULT_EVENT_STATUS,
    event: 'Task run status changed',
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
    method_data_snmp_agent: 'localhost',
    method_data_snmp_community: 'public',
    method_data_snmp_message: '$e',
    method_data_status: 'Done',
    method_data_subject: TASK_SUBJECT,
    method_data_submethod: 'syslog',
    method_data_to_address: '',
    method_data_URL: '',
    name: _('Unnamed'),
    report_formats: [],
    result_filters: [],
    secinfo_filters: [],
  },
});

// vim: set ts=2 sw=2 tw=80:
