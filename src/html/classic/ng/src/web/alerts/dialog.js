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
import {extend} from '../../utils.js';
import logger from '../../log.js';

import Layout from '../layout.js';

import Dialog from '../dialog/dialog.js';

import Select2 from '../form/select2.js';
import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';
import Radio from '../form/radio.js';

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

const log = logger.getLogger('web.alerts.dialog');

export class AlertDialog extends Dialog {

  constructor(...args) {
    super(...args);

    this.onMethodDataChange = this.onMethodDataChange.bind(this);
    this.onPartDataChange = this.onPartDataChange.bind(this);
  }

  defaultState() {
    return extend(super.defaultState(), {
      width: 800,
      comment: '',
      event: 'Task run status changed',
      filters: [],
      filter_id: 0,
      condition: 'Always',
      condition_data: {
        filter_direction: 'increased', // fixed value
        filters: [],
      },
      method_data: {
        details_url: 'https://secinfo.greenbone.net/omp?' +
        'cmd=get_info&info_type=$t&info_id=$o&details=1&token=guest',
        credentials: [],
      },
      method: 'Email',
      report_formats: [],
    });
  }

  show() {
    this.loadData();
  }

  save() {
    let {gmp} = this.context;

    return gmp.alert.create(this.state).then(alert => {
      this.close();
      return alert;
    }, xhr => {
      this.showErrorMessage(xhr.action_result.message);
      throw new Error('Alert creation failed. Reason: ' +
        xhr.action_result.message);
    });
  }

  onMethodDataChange(value, name) {
    let {method_data} = this.state;
    method_data[name] = value;
    this.setState({method_data});
  }

  onPartDataChange(value, name) {
    let data = this.state[name];
    data = extend({}, data, value);
    log.debug('part data changed', name, value, data);
    this.setState({[name]: data});
  }

  loadData() {
    let {gmp} = this.context;

    gmp.alert.newAlertSettings().then(response => {
      let settings = response.data;
      let {method_data = {}, condition_data = {}} = this.state;

      method_data.credentials = settings.credentials;
      condition_data.filters = settings.filters;

      this.setState({
        visible: true,
        report_formats: settings.report_formats,
        tasks: settings.tasks,
        method_data,
        condition_data,
      });
    });
  }

  renderContent() {
    let {name, comment, event, event_data, filters, filter_id, condition,
      condition_data, method, method_data, report_formats, tasks,
    } = this.state;

    let {capabilities} = this.context;

    let filter_opts = this.renderOptions(filters, 0);

    return (
      <Layout flex="column">

        <FormGroup title={_('Name')}>
          <TextField name="name"
            grow="1"
            value={name} size="30"
            onChange={this.onValueChange}
            maxLength="80"/>
        </FormGroup>

        <FormGroup title={_('Comment')}>
          <TextField name="comment"
            value={comment}
            grow="1"
            size="30" maxLength="400"
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Event')} flex="column">
          <TaskEventPart
            value={event}
            onCheckedChange={this.onValueChange}
            data={event_data}
            onDataChange={this.onPartDataChange}/>

          <SecInfoEventPart
            value={event}
            onCheckedChange={this.onValueChange}
            data={event_data}
            onDataChange={this.onPartDataChange}/>
        </FormGroup>

        <FormGroup title={_('Condition')} flex="column">

          <Radio title={_('Always')}
            name="condition"
            value="Always"
            checked={condition === 'Always'}
            onChange={this.onValueChange}/>

          {event === 'Task run status changed' &&
            <SeverityLeastConditionPart
              value={condition}
              onCheckedChange={this.onValueChange}
              data={condition_data}
              onDataChange={this.onPartDataChange}/>
          }

          {event === 'Task run status changed' &&
            <SeverityChangedConditionPart
              value={condition}
              onCheckedChange={this.onValueChange}
              data={condition_data}
              onDataChange={this.onPartDataChange}/>
          }

          <FilterCountLeastConditionPart
            value={condition}
            onCheckedChange={this.onValueChange}
            data={condition_data}
            onDataChange={this.onPartDataChange}/>

          {event === 'Task run status changed' &&
            <FilterCountChangedConditionPart
              value={condition}
              onCheckedChange={this.onValueChange}
              data={condition_data}
              onDataChange={this.onPartDataChange}/>
          }
        </FormGroup>

        {event === 'New SecInfo arrived' &&
          <FormGroup title={_('Details URL')}>
            <TextField
              name="details_url"
              value={method_data.details_url}
              onChange={this.onMethodDataChange}/>
          </FormGroup>
        }

        {capabilities.mayOp('get_filters') &&
          event === 'Task run status changed' &&
          <FormGroup title={_('Report Result Filter')}>
            <Select2 value={filter_id}
              name="filter_id"
              onChange={this.onValueChange}>
              {filter_opts}
            </Select2>
          </FormGroup>
        }

        <FormGroup title={_('Method')}>
          <Select2
            name="method"
            value={method}
            onChange={this.onValueChange}>
            <option value="Email">{_('Email')}</option>
            <option value="HTTP Get">{_('HTTP Get')}</option>
            <option value="SCP">{_('SCP')}</option>
            <option value="Send">{_('Send to host')}</option>
            <option value="SNMP">{_('SNMP')}</option>
            <option value="Sourcefire Connector">
              {_('Sourcefire Connector')}
            </option>
            <option value="Start Task">{_('Start Task')}</option>
            <option value="Syslog">{_('System Logger')}</option>
            <option value="verinice Connector">
              {_('verinice.PRO Connector')}
            </option>
          </Select2>
        </FormGroup>

        {method === 'Email' &&
          <EmailMethodPart
            data={method_data}
            report_formats={report_formats}
            task={event === 'Task run status changed'}
            onDataChange={this.onPartDataChange}/>
        }

        {method === 'HTTP Get' &&
          <HttpMethodPart
            data={method_data}
            onDataChange={this.onPartDataChange}/>
        }

        {method === 'SCP' &&
          <ScpMethodPart
            data={method_data}
            report_formats={report_formats}
            onDataChange={this.onPartDataChange}/>
        }

        {method === 'Send' &&
          <SendMethodPart
            data={method_data}
            report_formats={report_formats}
            onDataChange={this.onPartDataChange}/>
        }

        {method === 'Start Task' &&
          <StartTaskMethodPart
            data={method_data}
            tasks={tasks}
            onDataChange={this.onPartDataChange}/>
        }

        {method === 'SNMP' &&
          <SnmpMethodPart
            data={method_data}
            onDataChange={this.onPartDataChange}/>
        }

        {method === 'Sourcefire Connector' &&
          <SourcefireMethodPart
            data={method_data}
            onDataChange={this.onPartDataChange}/>
        }

        {method === 'verinice Connector' &&
          <VeriniceMethodPart
            data={method_data}
            report_formats={report_formats}
            onDataChange={this.onPartDataChange}/>
        }
      </Layout>
    );
  }
}

AlertDialog.contextTypes = {
  gmp: React.PropTypes.object.isRequired,
  capabilities: React.PropTypes.object.isRequired,
};

export default AlertDialog;

// vim: set ts=2 sw=2 tw=80:
