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
import {select_save_id, is_defined} from '../../utils.js';

import Layout from '../layout.js';
import {render_options} from '../render.js';

import Select2 from '../form/select2.js';
import FormGroup from '../form/formgroup.js';
import TextArea from '../form/textarea.js';
import TextField from '../form/textfield.js';
import FormPart from '../form/formpart.js';
import Radio from '../form/radio.js';

const TASK_SUBJECT = '[OpenVAS-Manager] Task \'$n\': $e';
const SECINFO_SUBJECT = '[OpenVAS-Manager] $T $q $S since $d';

const INCLUDE_MESSAGE_DEFAULT =
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

const INCLUDE_MESSAGE_SECINFO =
`After the event $e,
the following condition was met: $c

$t
$i

Note:
This email was sent to you as a configured security information escalation.
Please contact your local system administrator if you think you
should not have received it.`;

const ATTACH_MESSAGE_DEFAULT =
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

const ATTACH_MESSAGE_SECINFO =
`After the event $e,
the following condition was met: $c

This email escalation is configured to attach the resource list.

$t

Note:
This email was sent to you as a configured security information escalation.
Please contact your local system administrator if you think you
should not have received it.
`;

export class EmailMethodPart extends FormPart {

  constructor(props) {
    super(props, 'method_data');
  }

  defaultState() {
    let {report_formats = [], data = {}, task} = this.props;
    let default_subject = task ? TASK_SUBJECT : SECINFO_SUBJECT;
    let default_report_id = is_defined(data.notice_report_format) ?
      data.notice_report_format : '19f6f1b3-7128-4433-888c-ccc764fe6ed5';
    let default_attach_id = is_defined(data.notice_attach_format) ?
      data.notice_attach_format : '1a60a67e-97d0-4cbf-bc77-f71b08e7043d';

    return {
      notice: is_defined(data.notice) ? data.notice : '1',
      message: is_defined(data.message) ?
        data.message : INCLUDE_MESSAGE_DEFAULT,
      message_attach: is_defined(data.message_attach) ?
        data.message_attach : ATTACH_MESSAGE_DEFAULT,
      subject: is_defined(data.subject) ? data.subject : default_subject,
      notice_report_format: select_save_id(report_formats, default_report_id),
      notice_attach_format: select_save_id(report_formats, default_attach_id),
      to_address: data.to_address,
      from_address: data.from_address,
    };
  }

  componentWillReceiveProps(next) {
    if (next.task !== this.props.task) {
      if (next.task) {
        if (this.state.subject === SECINFO_SUBJECT) {
          this.setState({subject: TASK_SUBJECT});
        }
        if (this.state.message === INCLUDE_MESSAGE_SECINFO) {
          this.setState({message: INCLUDE_MESSAGE_DEFAULT});
        }
        if (this.state.message_attach === ATTACH_MESSAGE_SECINFO) {
          this.setState({message_attach: ATTACH_MESSAGE_DEFAULT});
        }
      }
      else {
        if (!next.task && this.state.subject === TASK_SUBJECT) {
          this.setState({subject: SECINFO_SUBJECT});
        }
        if (this.state.message === INCLUDE_MESSAGE_DEFAULT) {
          this.setState({message: INCLUDE_MESSAGE_SECINFO});
        }
        if (this.state.message_attach === ATTACH_MESSAGE_DEFAULT) {
          this.setState({message_attach: ATTACH_MESSAGE_SECINFO});
        }
      }
    }
  }

  componentWillMount() {
    this.notify();
  }

  render() {
    let {to_address, from_address, subject, notice, notice_report_format,
      message, message_attach, notice_attach_format} = this.state;
    let {task, report_formats = []} = this.props;

    let {capabilities} = this.context;

    let report_format_opts = render_options(
      report_formats.filter(format => {
        return (task && format.content_type.startsWith('text/')) || !task;
      })
    );

    let attach_format_opts = render_options(report_formats);

    return (
      <Layout flex="column" grow="1">

        <FormGroup title={_('To Address')}>
          <TextField
            grow="1"
            name="to_address"
            value={to_address}
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('From Address')}>
          <TextField
            grow="1"
            name="from_address"
            value={from_address}
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Subject')}>
          <TextField
            grow="1"
            name="subject"
            size="30"
            maxLength="80"
            onChange={this.onValueChange}
            value={subject}/>
        </FormGroup>

        <FormGroup title={_('Content')} flex="column">
          <Radio title={_('Simple Notice')}
            name="notice"
            onChange={this.onValueChange}
            checked={notice === '1'}
            value="1"/>
          {capabilities.mayOp('get_report_formats') &&
            <Layout flex="column" box>
              <Layout flex box>
                <Radio
                  name="notice"
                  title={task ? _('Include report') :
                    _('Include list of resources with message:')}
                  onChange={this.onValueChange}
                  checked={notice === '0'}
                  value="0">
                </Radio>
                <Select2
                  name="notice_report_format"
                  value={notice_report_format}
                  onChange={this.onValueChange}>
                  {report_format_opts}
                </Select2>
              </Layout>
              <TextArea name="message"
                className="form-control"
                rows="8" cols="50"
                onChange={this.onValueChange}
                value={message}/>
            </Layout>
          }

          {capabilities.mayOp('get_report_formats') &&
            <Layout flex="column" box>
              <Layout flex box>
                <Radio
                  name="notice"
                  title={task ? _('Attach report') :
                    _('Attach list of resources with message:')}
                  onChange={this.onValueChange}
                  checked={notice === '2'}
                  value="2">
                </Radio>
                <Select2
                  name="notice_attach_format"
                  value={notice_attach_format}
                  onChange={this.onValueChange}>
                  {attach_format_opts}
                </Select2>
              </Layout>
              <TextArea name="message_attach"
                className="form-control"
                rows="8" cols="50"
                onChange={this.onValueChange}
                value={message_attach}/>
            </Layout>
          }
        </FormGroup>

      </Layout>
    );
  }
};

EmailMethodPart.propTypes = {
  task: React.PropTypes.bool,
  report_formats: React.PropTypes.array,
};

EmailMethodPart.contextTypes = {
  capabilities: React.PropTypes.object.isRequired,
};

export default EmailMethodPart;

// vim: set ts=2 sw=2 tw=80:
