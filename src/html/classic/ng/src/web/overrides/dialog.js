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

import _, {datetime} from '../../locale.js';
import {is_defined, extend, is_empty, includes} from '../../utils.js';

import Dialog from '../dialog.js';
import Layout from '../layout.js';
import {render_nvt_name, result_cvss_risk_factor, render_options,
} from '../render.js';

import FormGroup from '../form/formgroup.js';
import Radio from '../form/radio.js';
import Spinner from '../form/spinner.js';
import Text from '../form/text.js';
import TextArea from '../form/textarea.js';
import TextField from '../form/textfield.js';
import Select2 from '../form/select2.js';

export class OverrideDialog extends Dialog {

  defaultState() {
    return extend(super.defaultState(), {
      active: '-1',
      days: 30,
      oid: '1.3.6.1.4.1.25623.1.0.',
      override: this.props.override,
      hosts: '',
      hosts_manual: '',
      port: '',
      port_manual: '',
      severity: '',
      custom_severity: '0',
      new_severity: '',
      new_severity_from_list: -1,
      override_result_id: '',
      override_result_uuid: '',
      override_task_id: '',
      override_task_uuid: '',
      tasks: [],
      text: '',
    });
  }

  loadData() {
    let {gmp} = this.context;

    if (this.state.override) {
      // request all override details which haven't been included in
      // get_overrides response
      gmp.override.get(this.state.override).then(override => {
        let active = '0';
        if (override.isActive()) {
          if (is_empty(override.end_time)) {
            active = '-1';
          }
          else {
            active = '-2';
          }
        }

        let custom_severity = '0';
        let new_severity_from_list = '';
        let new_severity = '';

        if (includes([10, 5, 2, 0, -1], override.new_severity)) {
          new_severity_from_list = override.new_severity;
        }
        else {
          custom_severity = '1';
          new_severity = override.new_severity;
        }
        this.setState({
          active,
          hosts: override.hosts,
          port: override.port,
          override,
          override_id: override.id,
          override_task_id: override.task ? override.task.id : undefined,
          override_result_id: override.result ? override.result.id : undefined,
          severity: override.severity,
          custom_severity,
          new_severity,
          new_severity_from_list,
          text: override.text,
          visible: true,
        });
      });
    }

    gmp.tasks.get().then(tasks => this.setState({tasks, visible: true}));
  }

  save() {
    let {override} = this.state;
    let {gmp} = this.context;
    let promise;

    if (override) {
      promise = gmp.override.save(this.state);
    }
    else {
      promise = gmp.override.create(this.state);
    }

    return promise.then(() => {
      this.close();
    }, root => {
      this.showErrorMessage(root.action_result.message);
      throw new Error('Saving override failed. Reason: ' +
        root.action_result.message);
    });
  }

  renderContent() {
    let {override, oid, active, days, hosts, hosts_manual, port, port_manual,
      severity, override_result_id, override_result_uuid, override_task_id,
      override_task_uuid, tasks, text, custom_severity, new_severity,
      new_severity_from_list,
    } = this.state;
    let is_edit = is_defined(override);
    return (
      <Layout flex="column">
        {is_edit ?
          <FormGroup title={_('NVT Name')}>
            {render_nvt_name(override.nvt)}
          </FormGroup> :
            <FormGroup title={_('NVT OID')}>
              <TextField name="oid"
                value={oid}
                onChange={this.onValueChange}/>
            </FormGroup>
        }

        <FormGroup title={_('Active')} flex="column">
          <Radio name="active"
            value="-1"
            checked={active === '-1'}
            title={_('yes, always')}
            onChange={this.onValueChange}/>
          {is_edit && override.isActive() && !is_empty(override.end_time) &&
            <Layout flex box>
              <Radio name="active"
                value="-2"
                checked={active === '-2'}
                title={_('yes, until')}
                onChange={this.onValueChange}/>
              <Text>{datetime(override.end_time)}</Text>
            </Layout>
          }
          <Layout flex box>
            <Radio name="active"
              value="1"
              checked={active === '1'}
              title={_('yes, for the next')}
              onChange={this.onValueChange}>
            </Radio>
            <Spinner name="days" value={days} size="4"
              onChange={this.onValueChange}
              disabled={active !== '1'} type="int" min="1"/>
            <Text>{_('days')}</Text>
          </Layout>
          <Radio name="active"
            value="0"
            checked={active === '0'}
            title={_('no')}
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Hosts')}>
          <Radio name="hosts"
            value=""
            title={_('Any')}
            checked={hosts === ''}
            onChange={this.onValueChange}>
          </Radio>
          {is_edit && !is_empty(override.hosts) &&
            <Layout flex box>
              <Radio name="hosts"
                value={override.hosts}
                checked={!is_empty(hosts)}
                onChange={this.onValueChange}>
              </Radio>
              <TextField name="hosts"
                disabled={is_empty(hosts)}
                value={hosts}
                onChange={this.onValueChange}/>
            </Layout>
          }
          {!is_edit &&
            <Layout flex box>
              <Radio name="hosts"
                value="--"
                checked={hosts === '--'}
                onChange={this.onValueChange}>
              </Radio>
              <TextField name="hosts_manual"
                value={hosts_manual}
                disabled={hosts !== '--'}
                onChange={this.onValueChange}/>
            </Layout>
          }
        </FormGroup>

        <FormGroup title={_('Location')}>
          <Radio name="port"
            value=""
            title={_('Any')}
            checked={port === ''}
            onChange={this.onValueChange}>
          </Radio>
          {is_edit && !is_empty(override.port) &&
            <Layout flex box>
              <Radio name="port"
                value={override.port}
                checked={!is_empty(port)}
                onChange={this.onValueChange}>
              </Radio>
              <TextField name="port"
                value={port}
                disabled={is_empty(port)}
                onChange={this.onValueChange}/>
            </Layout>
          }
          {!is_edit &&
            <Layout flex box>
              <Radio name="port"
                value="--"
                checked={port === '--'}
                onChange={this.onValueChange}>
              </Radio>
              <TextField name="port_manual"
                value={port_manual}
                disabled={port !== '--'}
                onChange={this.onValueChange}/>
            </Layout>
          }
        </FormGroup>

        <FormGroup title={_('Severity')}>
          <Radio name="severity"
            value=""
            title={_('Any')}
            checked={is_empty(severity)}
            onChange={this.onValueChange}>
          </Radio>
          {is_edit && override.severity > 0.0 &&
            <Radio name="severity"
              value={0.1}
              title={_('> 0.0')}
              checked={!is_empty(severity) && severity > 0.0}
              onChange={this.onValueChange}>
            </Radio>
          }
          {is_edit && override.severity <= 0.0 &&
            <Radio name="severity"
              value={override.severity}
              title={result_cvss_risk_factor(override.severity)}
              checked={!is_empty(severity) && severity <= 0.0}
              onChange={this.onValueChange}>
            </Radio>
          }
          {!is_edit &&
            <Layout flex box>
              <Radio name="severity"
                value="0.1"
                title={_('> 0.0')}
                checked={severity === '0.1'}
                onChange={this.onValueChange}>
              </Radio>
              <Radio name="severity"
                value="0.0"
                title={_('Log')}
                checked={severity === '0.0'}
                onChange={this.onValueChange}>
              </Radio>
            </Layout>
          }
        </FormGroup>

        <FormGroup title={_('New Severity')}>
          <Radio name="custom_severity"
            value="0"
            checked={custom_severity === '0'}
            onChange={this.onValueChange}>
          </Radio>
          <Select2 name="new_severity_from_list"
            value={new_severity_from_list}
            disabled={custom_severity !== '0'}
            onChange={this.onValueChange}>
            {is_edit &&
              <option value="">--</option>
            }
            <option value={10.0}>10.0 ({_('High')})</option>
            <option value={5.0}>5.0 ({_('Medium')}</option>
            <option value={2.0}>2.0 ({_('Low')}</option>
            <option value={0.0}>{_('Log')}</option>
            <option value={-1.0}>{_('False Positive')}</option>
          </Select2>
          <Radio name="custom_severity"
            value="1"
            title={_('Other')}
            checked={custom_severity === '1'}
            onChange={this.onValueChange}>
          </Radio>
          <TextField name="new_severity"
            value={new_severity}
            disabled={custom_severity !== '1'}
            onChange={this.onValueChange}/>
        </FormGroup>

        <FormGroup title={_('Task')}>
          <Radio name="override_task_id"
            value=""
            title={_('Any')}
            checked={override_task_id === ''}
            onChange={this.onValueChange}/>
          {is_edit && override.task && !is_empty(override.task.id) &&
            <Layout flex box>
              <Radio name="override_task_id"
                value={override.task.id}
                checked={!is_empty(override_task_id)}
                onChange={this.onValueChange}/>
              <Select2 name="override_task_id"
                value={override_task_id}
                disabled={is_empty(override_task_id)}
                onChange={this.onValueChange}>
                {render_options(tasks)}
              </Select2>
            </Layout>
          }
          {!is_edit &&
            <Layout flex box>
              <Radio name="override_task_id"
                value="0"
                checked={override_task_id === '0'}
                onChange={this.onValueChange}/>
              <Select2 name="override_task_uuid"
                value={override_task_uuid}
                disabled={override_task_id !== '0'}
                onChange={this.onValueChange}>
                {render_options(tasks)}
              </Select2>
            </Layout>
          }
        </FormGroup>

        <FormGroup title={_('Result')}>
          <Radio name="override_result_id"
            value=""
            title={_('Any')}
            checked={override_result_id === ''}
            onChange={this.onValueChange}/>
          {is_edit && override.result && !is_empty(override.result.id) &&
            <Layout flex box>
              <Radio name="override_result_id"
                value={override.result.id}
                checked={!is_empty(override_result_id)}
                onChange={this.onValueChange}/>
              <TextField name="override_result_id"
                value={override_result_id}
                size="34"
                disabled={is_empty(override_result_id)}
                onChange={this.onValueChange}/>
            </Layout>
          }
          {!is_edit &&
            <Layout flex box>
              <Radio name="override_result_id"
                value="0"
                title={_('UUID')}
                checked={override_result_id === '0'}
                onChange={this.onValueChange}/>
              <TextField name="override_result_uuid"
                value={override_result_uuid}
                size="34"
                disabled={override_result_id !== '0'}
                onChange={this.onValueChange}/>
            </Layout>
          }
        </FormGroup>

        <FormGroup title={_('Text')}>
          <TextArea name="text"
            grow="1"
            rows="10" cols="60"
            value={text}
            onChange={this.onValueChange}/>
        </FormGroup>
      </Layout>
    );
  }
}

OverrideDialog.propTypes = {
  override: React.PropTypes.object,
};


export default OverrideDialog;

// vim: set ts=2 sw=2 tw=80:
