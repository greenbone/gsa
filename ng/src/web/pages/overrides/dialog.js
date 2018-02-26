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

import _, {datetime} from 'gmp/locale.js';
import {is_defined, is_empty} from 'gmp/utils';
import {parse_float} from 'gmp/parser.js';
import {ANY, MANUAL} from 'gmp/commands/overrides.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {
  render_nvt_name,
  render_options,
  result_cvss_risk_factor,
} from '../../utils/render.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Spinner from '../../components/form/spinner.js';
import Text from '../../components/form/text.js';
import TextArea from '../../components/form/textarea.js';
import TextField from '../../components/form/textfield.js';
import Select from '../../components/form/select.js';

const DEFAULTS = {
  active: '-1',
  days: 30,
  fixed: false,
  oid: '1.3.6.1.4.1.25623.1.0.',
  hosts: ANY,
  hosts_manual: '',
  port: ANY,
  port_manual: '',
  custom_severity: '0',
  new_severity_from_list: -1,
  result_id: '',
  result_uuid: '',
  task_id: '',
  task_uuid: '',
  tasks: [],
  text: '',
};

const OverrideDialog = ({
    active,
    custom_severity,
    days,
    fixed,
    hosts,
    hosts_manual,
    id,
    new_severity,
    new_severity_from_list,
    nvt,
    oid,
    override,
    override_severity,
    port,
    port_manual,
    result_id,
    result_name,
    result_uuid,
    severity,
    task_id,
    task_name,
    tasks,
    task_uuid,
    text,
    title = _('New Override'),
    visible,
    onClose,
    onSave,
    ...initial
  }) => {

  const is_edit = is_defined(override);

  const data = {
    ...DEFAULTS,
    ...initial,
    nvt,
  };

  if (is_defined(active)) {
    data.active = active;
  };
  if (is_defined(custom_severity)) {
    data.custom_severity = custom_severity;
  };
  if (is_defined(days)) {
    data.days = days;
  };
  if (is_defined(fixed)) {
    data.fixed = fixed;
  };
  if (is_defined(hosts)) {
    data.hosts = hosts;
  };
  if (is_defined(hosts_manual) && hosts_manual.length > 0) {
    data.hosts_manual = hosts_manual;
  };
  if (is_defined(id)) {
    data.id = id;
  };
  if (is_defined(override_severity)) {
    data.override_severity = override_severity;
  };
  if (is_defined(oid)) {
    data.oid = oid;
  };
  if (is_defined(port)) {
    data.port = port;
  };
  if (is_defined(port_manual) && port_manual.length > 0) {
    data.port_manual = port_manual;
  };
  if (is_defined(result_id)) {
    data.result_id = result_id;
  };
  if (is_defined(result_uuid) && result_uuid.length > 0) {
    data.result_uuid = result_uuid;
  };
  if (is_defined(result_name)) {
    data.result_name = result_name;
  };
  if (is_defined(task_id)) {
    data.task_id = task_id;
  };
  if (is_defined(task_uuid) && task_uuid.length > 0) {
    data.task_uuid = task_uuid;
  };
  if (is_defined(task_name)) {
    data.task_name = task_name;
  };
  if (is_defined(tasks)) {
    data.tasks = tasks;
  };
  if (is_defined(text)) {
    data.text = text;
  };

  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      initialData={data}
    >
      {({
        data: state,
        onValueChange,
      }) => {
        return (
          <Layout flex="column">
            {state.fixed &&
              <FormGroup title={_('NVT')} flex="column">
                <Text>{render_nvt_name(nvt)}</Text>
              </FormGroup>
            }
            {is_edit && !state.fixed &&
              <FormGroup title={_('NVT')} flex="column">
                <Radio
                  name="oid"
                  value={state.nvt.oid}
                  title={render_nvt_name(nvt)}
                  checked={state.oid === state.nvt.oid}
                  onChange={onValueChange}/>
                <Layout flex box>
                  <Radio
                    name="oid"
                    value="1.3.6.1.4.1.25623.1.0."
                    checked={state.oid !== state.nvt.oid}
                    onChange={onValueChange}/>
                  <TextField
                    name="oid"
                    value={state.oid}
                    disabled={state.oid === state.nvt.oid}
                    onChange={onValueChange}/>
                </Layout>
              </FormGroup>
            }
            {!is_edit && !state.fixed &&
              <FormGroup title={_('NVT OID')}>
                <TextField
                  name="oid"
                  value={state.oid}
                  onChange={onValueChange}/>
              </FormGroup>
            }

            <FormGroup title={_('Active')} flex="column">
              <Radio
                name="active"
                value="-1"
                checked={state.active === '-1'}
                title={_('yes, always')}
                onChange={onValueChange}/>
              {is_edit && override.isActive() && !is_empty(override.end_time) &&
                <Layout flex box>
                  <Divider>
                    <Radio
                      name="active"
                      value="-2"
                      checked={state.active === '-2'}
                      title={_('yes, until')}
                      onChange={onValueChange}/>
                    <Text>{datetime(override.end_time)}</Text>
                  </Divider>
                </Layout>
              }
              <Divider>
                <Radio
                  name="active"
                  value="1"
                  checked={state.active === '1'}
                  title={_('yes, for the next')}
                  onChange={onValueChange}>
                </Radio>
                <Spinner
                  name="days"
                  value={state.days}
                  size="4"
                  onChange={onValueChange}
                  disabled={state.active !== '1'}
                  type="int"
                  min="1"/>
                <Text>{_('days')}</Text>
              </Divider>
              <Radio
                name="active"
                value="0"
                checked={state.active === '0'}
                title={_('no')}
                onChange={onValueChange}/>
            </FormGroup>

            <FormGroup title={_('Hosts')}>
              <Radio
                name="hosts"
                value={ANY}
                title={_('Any')}
                checked={state.hosts === ANY}
                onChange={onValueChange}>
              </Radio>
              <Layout flex box>
                <Radio
                  name="hosts"
                  value={MANUAL}
                  title={state.fixed ? state.hosts_manual : ''}
                  checked={state.hosts === MANUAL}
                  onChange={onValueChange}>
                </Radio>
                {!state.fixed &&
                  <TextField
                    name="hosts_manual"
                    value={state.hosts_manual}
                    disabled={state.hosts !== MANUAL}
                    onChange={onValueChange}/>
                }
              </Layout>
            </FormGroup>

            <FormGroup title={_('Location')}>
              <Radio
                name="port"
                value={ANY}
                title={_('Any')}
                checked={state.port === ANY}
                onChange={onValueChange}>
              </Radio>
              <Layout flex box>
                <Radio
                  name="port"
                  value={MANUAL}
                  title={state.fixed ? state.port_manual : ''}
                  checked={state.port === MANUAL}
                  onChange={onValueChange}>
                </Radio>
                {!state.fixed &&
                  <TextField
                    name="port_manual"
                    value={state.port_manual}
                    disabled={state.port !== MANUAL}
                    onChange={onValueChange}/>
                }
              </Layout>
            </FormGroup>

            <FormGroup title={_('Severity')}>
              <Radio
                name="severity"
                value=""
                title={_('Any')}
                checked={is_empty(state.severity)}
                onChange={onValueChange}>
              </Radio>
              {is_edit && !state.fixed &&
                <Layout flex box>
                  <Radio
                    name="severity"
                    value={0.1}
                    title={_('> 0.0')}
                    checked={!is_empty(state.severity) && state.severity > 0.0}
                    convert={parse_float}
                    onChange={onValueChange}>
                  </Radio>
                  <Radio
                    name="severity"
                    value={state.override_severity}
                    title={result_cvss_risk_factor(state.override_severity)}
                    checked={!is_empty(state.severity) && state.severity <= 0.0}
                    convert={parse_float}
                    onChange={onValueChange}>
                  </Radio>
                </Layout>
              }
              {!is_edit && !state.fixed &&
                <Layout flex box>
                  <Radio
                    name="severity"
                    value="0.1"
                    title={_('> 0.0')}
                    checked={state.severity === 0.1}
                    convert={parse_float}
                    onChange={onValueChange}>
                  </Radio>
                  <Radio
                    name="severity"
                    value="0.0"
                    title={_('Log')}
                    checked={state.severity === 0.0}
                    convert={parse_float}
                    onChange={onValueChange}>
                  </Radio>
                </Layout>
              }
              {state.fixed &&
                <Layout flex box>
                  <Radio
                    name="severity"
                    value={state.severity}
                    title={
                      state.severity > 0 ?
                        _('> 0.0') :
                        result_cvss_risk_factor(state.override_severity)
                    }
                    checked={!is_empty(state.severity) && state.severity > 0.0}
                    convert={parse_float}
                    onChange={onValueChange}>
                  </Radio>
                </Layout>
              }
            </FormGroup>

            <FormGroup title={_('New Severity')}>
              <Divider>
                <Radio
                  name="custom_severity"
                  value="0"
                  checked={state.custom_severity === '0'}
                  onChange={onValueChange}>
                </Radio>
                <Select
                  name="new_severity_from_list"
                  value={state.new_severity_from_list}
                  disabled={state.custom_severity !== '0'}
                  convert={parse_float}
                  onChange={onValueChange}>
                  {is_edit &&
                    <option value="">--</option>
                  }
                  <option value={10.0}>10.0 ({_('High')})</option>
                  <option value={5.0}>5.0 ({_('Medium')}</option>
                  <option value={2.0}>2.0 ({_('Low')}</option>
                  <option value={0.0}>{_('Log')}</option>
                  <option value={-1.0}>{_('False Positive')}</option>
                </Select>
                <Radio
                  name="custom_severity"
                  value="1"
                  title={_('Other')}
                  checked={state.custom_severity === '1'}
                  onChange={onValueChange}>
                </Radio>
                <TextField
                  name="new_severity"
                  value={state.new_severity}
                  disabled={state.custom_severity !== '1'}
                  convert={parse_float}
                  onChange={onValueChange}/>
              </Divider>
            </FormGroup>

            <FormGroup title={_('Task')}>
              <Radio
                name="task_id"
                value=""
                title={_('Any')}
                checked={state.task_id === ''}
                onChange={onValueChange}/>
              <Layout flex box>
                <Radio
                  name="task_id"
                  value="0"
                  title={state.fixed ? state.task_name : ''}
                  checked={state.task_id === '0'}
                  onChange={onValueChange}/>
                {!state.fixed &&
                  <Select
                    name="task_uuid"
                    value={state.task_uuid}
                    disabled={state.task_id !== '0'}
                    onChange={onValueChange}>
                    {render_options(tasks)}
                  </Select>
                }
              </Layout>
            </FormGroup>

            <FormGroup title={_('Result')}>
              <Radio
                name="result_id"
                value=""
                title={_('Any')}
                checked={state.result_id === ''}
                onChange={onValueChange}/>
              <Divider>
                <Radio
                  name="result_id"
                  value="0"
                  title={
                    state.fixed ?
                      _('Only selected result ({{- name}})',
                        {name: state.result_name}) : _('UUID')
                  }
                  checked={state.result_id === '0'}
                  onChange={onValueChange}/>
                {!state.fixed &&
                  <TextField
                    name="result_uuid"
                    value={state.result_uuid}
                    size="34"
                    disabled={state.result_id !== '0'}
                    onChange={onValueChange}/>
                }
              </Divider>
            </FormGroup>

            <FormGroup title={_('Text')}>
              <TextArea
                name="text"
                grow="1"
                rows="10" cols="60"
                value={state.text}
                onChange={onValueChange}/>
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

OverrideDialog.propTypes = {
  active: PropTypes.oneOf(['0', '1', '-1', '-2']),
  custom_severity: PropTypes.oneOf(['0', '1']),
  days: PropTypes.number,
  fixed: PropTypes.bool,
  hosts: PropTypes.string,
  hosts_manual: PropTypes.string,
  id: PropTypes.string,
  new_severity: PropTypes.number,
  new_severity_from_list: PropTypes.number,
  nvt: PropTypes.model,
  oid: PropTypes.string,
  override: PropTypes.model,
  override_severity: PropTypes.number,
  port: PropTypes.string,
  port_manual: PropTypes.string,
  result_id: PropTypes.id,
  result_name: PropTypes.string,
  result_uuid: PropTypes.id,
  severity: PropTypes.number,
  task_id: PropTypes.id,
  task_name: PropTypes.string,
  task_uuid: PropTypes.id,
  tasks: PropTypes.array,
  text: PropTypes.string,
  title: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default OverrideDialog;

// vim: set ts=2 sw=2 tw=80:
