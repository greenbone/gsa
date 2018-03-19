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
import {is_defined} from 'gmp/utils';
import {parse_float, parse_yesno, YES_VALUE, NO_VALUE} from 'gmp/parser.js';
import {ANY, MANUAL} from 'gmp/commands/overrides.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {
  render_nvt_name,
  result_cvss_risk_factor,
  render_select_items,
} from '../../utils/render.js';

import SaveDialog from '../../components/dialog/savedialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Spinner from '../../components/form/spinner.js';
import Text from '../../components/form/text.js';
import TextArea from '../../components/form/textarea.js';
import TextField from '../../components/form/textfield.js';
import Select from '../../components/form/select.js';

export const ACTIVE_NO_VALUE = '0';
export const ACTIVE_YES_FOR_NEXT_VALUE = '1';
export const ACTIVE_YES_ALWAYS_VALUE = '-1';
export const ACTIVE_YES_UNTIL_VALUE = '-2';

const DEFAULT_DAYS = 30;
const DEFAULT_OID_VALUE = '1.3.6.1.4.1.25623.1.0.';

const SEVERITY_FALSE_POSITIVE = -1;

export const TASK_ANY = '';
export const TASK_SELECTED = '0';

export const RESULT_ANY = '';
export const RESULT_UUID = '0';

const OverrideDialog = ({
  active = ACTIVE_YES_ALWAYS_VALUE,
  custom_severity = NO_VALUE,
  days = DEFAULT_DAYS,
  fixed = false,
  hosts = ANY,
  hosts_manual = '',
  id,
  new_severity,
  new_severity_from_list = SEVERITY_FALSE_POSITIVE,
  nvt,
  oid = DEFAULT_OID_VALUE,
  override,
  port = ANY,
  port_manual = '',
  result_id = RESULT_ANY,
  result_name,
  result_uuid = '',
  severity,
  task_id = TASK_ANY,
  task_name,
  tasks,
  task_uuid,
  text = '',
  title = _('New Override'),
  visible,
  onClose,
  onSave,
  ...initial
}) => {

  const is_edit = is_defined(override);

  const data = {
    ...initial,
    active,
    custom_severity,
    days,
    hosts,
    hosts_manual,
    id,
    new_severity,
    new_severity_from_list,
    nvt,
    oid,
    override,
    port,
    port_manual,
    result_id,
    result_uuid,
    severity: is_defined(severity) ? severity : '',
    task_id,
    task_name,
    tasks,
    task_uuid,
    text,
  };

  let severity_from_list_items = [{
    label: _('High'),
    value: 10.0,
  }, {
    value: 5.0,
    label: _('Medium'),
  }, {
    value: 2.0,
    label: _('Low'),
  }, {
    value: 0.0,
    label: _('Log'),
  }, {
    value: SEVERITY_FALSE_POSITIVE,
    label: _('False Positive'),
  }];

  if (is_edit) {
    severity_from_list_items = [{
      label: '--',
      value: '',
    }, ...severity_from_list_items];
  }
  return (
    <SaveDialog
      visible={visible}
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={data}
    >
      {({
        values: state,
        onValueChange,
      }) => {
        return (
          <Layout flex="column">
            {fixed &&
              <FormGroup title={_('NVT')} flex="column">
                <Text>{render_nvt_name(nvt)}</Text>
              </FormGroup>
            }
            {is_edit && !fixed &&
              <FormGroup title={_('NVT')} flex="column">
                <Radio
                  name="oid"
                  title={render_nvt_name(nvt)}
                  checked={state.oid === nvt.oid}
                  value={nvt.oid}
                  onChange={onValueChange}
                />
                <Divider>
                  <Radio
                    name="oid"
                    checked={state.oid !== nvt.oid}
                    value={DEFAULT_OID_VALUE}
                    onChange={onValueChange}
                  />
                  <TextField
                    name="oid"
                    disabled={state.oid === nvt.oid}
                    value={state.oid === nvt.oid ?
                      DEFAULT_OID_VALUE : state.oid}
                    onChange={onValueChange}
                  />
                </Divider>
              </FormGroup>
            }
            {!is_edit && !fixed &&
              <FormGroup title={_('NVT OID')}>
                <TextField
                  name="oid"
                  value={state.oid}
                  onChange={onValueChange}
                />
              </FormGroup>
            }

            <FormGroup title={_('Active')} flex="column">
              <Radio
                name="active"
                value={ACTIVE_YES_ALWAYS_VALUE}
                checked={state.active === ACTIVE_YES_ALWAYS_VALUE}
                title={_('yes, always')}
                onChange={onValueChange}
              />
              {is_edit && override.isActive() && !is_empty(override.end_time) &&
                <Layout flex box>
                  <Divider>
                    <Radio
                      name="active"
                      value={ACTIVE_YES_UNTIL_VALUE}
                      checked={state.active === ACTIVE_YES_UNTIL_VALUE}
                      title={_('yes, until')}
                      onChange={onValueChange}
                    />
                    <Text>{datetime(override.end_time)}</Text>
                  </Divider>
                </Layout>
              }
              <Divider>
                <Radio
                  name="active"
                  checked={state.active === ACTIVE_YES_FOR_NEXT_VALUE}
                  title={_('yes, for the next')}
                  value={ACTIVE_YES_FOR_NEXT_VALUE}
                  onChange={onValueChange}
                />
                <Spinner
                  name="days"
                  size="4"
                  disabled={state.active !== ACTIVE_YES_FOR_NEXT_VALUE}
                  type="int"
                  min="1"
                  value={state.days}
                  onChange={onValueChange}
                />
                <Text>{_('days')}</Text>
              </Divider>
              <Radio
                name="active"
                checked={state.active === ACTIVE_NO_VALUE}
                title={_('no')}
                value={ACTIVE_NO_VALUE}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Hosts')}>
              <Radio
                name="hosts"
                title={_('Any')}
                checked={state.hosts === ANY}
                value={ANY}
                onChange={onValueChange}
              />
              <Layout flex box>
                <Radio
                  name="hosts"
                  title={fixed ? state.hosts_manual : ''}
                  checked={state.hosts === MANUAL}
                  value={MANUAL}
                  onChange={onValueChange}
                />
                {!fixed &&
                  <TextField
                    name="hosts_manual"
                    value={state.hosts_manual}
                    disabled={state.hosts !== MANUAL}
                    onChange={onValueChange}
                  />
                }
              </Layout>
            </FormGroup>

            <FormGroup title={_('Location')}>
              <Radio
                name="port"
                title={_('Any')}
                checked={state.port === ANY}
                value={ANY}
                onChange={onValueChange}
              />
              <Layout flex box>
                <Radio
                  name="port"
                  title={fixed ? state.port_manual : ''}
                  checked={state.port === MANUAL}
                  value={MANUAL}
                  onChange={onValueChange}
                />
                {!fixed &&
                  <TextField
                    name="port_manual"
                    disabled={state.port !== MANUAL}
                    value={state.port_manual}
                    onChange={onValueChange}
                  />
                }
              </Layout>
            </FormGroup>

            <FormGroup title={_('Severity')}>
              <Radio
                name="severity"
                title={_('Any')}
                checked={is_empty(state.severity)}
                value=""
                onChange={onValueChange}
              />
              {is_edit && !fixed &&
                <Layout flex box>
                  <Radio
                    name="severity"
                    title={_('> 0.0')}
                    checked={!is_empty(state.severity) && state.severity > 0.0}
                    convert={parse_float}
                    value={0.1}
                    onChange={onValueChange}
                  />
                  <Radio
                    name="severity"
                    title={result_cvss_risk_factor(state.override_severity)}
                    checked={!is_empty(state.severity) && state.severity <= 0.0}
                    convert={parse_float}
                    value={state.override_severity}
                    onChange={onValueChange}
                  />
                </Layout>
              }
              {!is_edit && !fixed &&
                <Layout flex box>
                  <Radio
                    name="severity"
                    title={_('> 0.0')}
                    checked={state.severity === 0.1}
                    convert={parse_float}
                    value="0.1"
                    onChange={onValueChange}
                  />
                  <Radio
                    name="severity"
                    value="0.0"
                    title={_('Log')}
                    checked={state.severity === 0.0}
                    convert={parse_float}
                    onChange={onValueChange}
                  />
                </Layout>
              }
              {fixed &&
                <Layout flex box>
                  <Radio
                    name="severity"
                    title={
                      state.severity > 0 ?
                        _('> 0.0') :
                        result_cvss_risk_factor(state.override_severity)
                    }
                    checked={!is_empty(state.severity) && state.severity > 0.0}
                    convert={parse_float}
                    value={state.severity}
                    onChange={onValueChange}
                  />
                </Layout>
              }
            </FormGroup>

            <FormGroup title={_('New Severity')}>
              <Divider>
                <Radio
                  name="custom_severity"
                  checked={state.custom_severity === '0'}
                  value="0"
                  onChange={onValueChange}
                />
                <Select
                  name="new_severity_from_list"
                  disabled={state.custom_severity !== '0'}
                  convert={parse_float}
                  items={severity_from_list_items}
                  value={state.new_severity_from_list}
                  onChange={onValueChange}
                />
                <Radio
                  name="custom_severity"
                  title={_('Other')}
                  checked={state.custom_severity === '1'}
                  value="1"
                  onChange={onValueChange}
                />
                <TextField
                  name="new_severity"
                  disabled={state.custom_severity !== '1'}
                  convert={parse_float}
                  value={state.new_severity}
                  onChange={onValueChange}
                />
              </Divider>
            </FormGroup>

            <FormGroup title={_('Task')}>
              <Radio
                name="task_id"
                title={_('Any')}
                checked={state.task_id === ''}
                value=""
                onChange={onValueChange}
              />
              <Layout flex box>
                <Radio
                  name="task_id"
                  title={fixed ? state.task_name : ''}
                  checked={state.task_id === '0'}
                  value="0"
                  onChange={onValueChange}
                />
                {!fixed &&
                  <Select
                    name="task_uuid"
                    disabled={state.task_id !== '0'}
                    items={render_select_items(tasks)}
                    value={state.task_uuid}
                    onChange={onValueChange}
                  />
                }
              </Layout>
            </FormGroup>

            <FormGroup title={_('Result')}>
              <Radio
                name="result_id"
                title={_('Any')}
                checked={state.result_id === ''}
                value=""
                onChange={onValueChange}
              />
              <Divider>
                <Radio
                  name="result_id"
                  title={
                    fixed ?
                      _('Only selected result ({{- name}})',
                        {name: state.result_name}) : _('UUID')
                  }
                  checked={state.result_id === '0'}
                  value="0"
                  onChange={onValueChange}
                />
                {!fixed &&
                  <TextField
                    name="result_uuid"
                    size="34"
                    disabled={state.result_id !== '0'}
                    value={state.result_uuid}
                    onChange={onValueChange}
                  />
                }
              </Divider>
            </FormGroup>

            <FormGroup title={_('Text')}>
              <TextArea
                name="text"
                grow="1"
                rows="10"
                cols="60"
                value={state.text}
                onChange={onValueChange}
              />
            </FormGroup>
          </Layout>
        );
      }}
    </SaveDialog>
  );
};

OverrideDialog.propTypes = {
  active: PropTypes.oneOf([
    ACTIVE_NO_VALUE,
    ACTIVE_YES_FOR_NEXT_VALUE,
    ACTIVE_YES_ALWAYS_VALUE,
    ACTIVE_YES_UNTIL_VALUE,
  ]),
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
