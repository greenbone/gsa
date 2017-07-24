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

import _, {datetime} from 'gmp/locale.js';
import {is_defined, is_empty} from 'gmp/utils.js';
import {parse_float} from 'gmp/parser.js';

import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {
  render_nvt_name,
  render_options,
  result_cvss_risk_factor,
} from '../../utils/render.js';

import withDialog from '../../components/dialog/withDialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Radio from '../../components/form/radio.js';
import Spinner from '../../components/form/spinner.js';
import Text from '../../components/form/text.js';
import TextArea from '../../components/form/textarea.js';
import TextField from '../../components/form/textfield.js';
import Select2 from '../../components/form/select2.js';

const OverrideDialog = ({
    active,
    custom_severity,
    days,
    fixed,
    hosts,
    hosts_manual,
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
    onValueChange,
  }) => {

  let is_edit = is_defined(override);

  return (
    <Layout flex="column">
      {fixed &&
        <FormGroup title={_('NVT')} flex="column">
          <Text>{render_nvt_name(nvt)}</Text>
        </FormGroup>
      }
      {is_edit && !fixed &&
        <FormGroup title={_('NVT')} flex="column">
          <Radio name="oid"
            value={override.nvt.oid}
            title={render_nvt_name(override.nvt)}
            checked={oid === override.nvt.oid}
            onChange={onValueChange}/>
          <Layout flex box>
            <Radio name="oid"
              value="1.3.6.1.4.1.25623.1.0."
              checked={oid !== override.nvt.oid}
              onChange={onValueChange}/>
            <TextField name="oid"
              value={oid}
              disabled={oid === override.nvt.oid}
              onChange={onValueChange}/>
          </Layout>
        </FormGroup>
      }
      {!is_edit && !fixed &&
        <FormGroup title={_('NVT OID')}>
          <TextField name="oid"
            value={oid}
            onChange={onValueChange}/>
        </FormGroup>
      }

      <FormGroup title={_('Active')} flex="column">
        <Radio name="active"
          value="-1"
          checked={active === '-1'}
          title={_('yes, always')}
          onChange={onValueChange}/>
        {is_edit && override.isActive() && !is_empty(override.end_time) &&
          <Layout flex box>
            <Radio name="active"
              value="-2"
              checked={active === '-2'}
              title={_('yes, until')}
              onChange={onValueChange}/>
            <Text>{datetime(override.end_time)}</Text>
          </Layout>
        }
        <Layout flex box>
          <Radio name="active"
            value="1"
            checked={active === '1'}
            title={_('yes, for the next')}
            onChange={onValueChange}>
          </Radio>
          <Spinner
            name="days"
            value={days}
            size="4"
            onChange={onValueChange}
            disabled={active !== '1'}
            type="int"
            min="1"/>
          <Text>{_('days')}</Text>
        </Layout>
        <Radio name="active"
          value="0"
          checked={active === '0'}
          title={_('no')}
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Hosts')}>
        <Radio name="hosts"
          value=""
          title={_('Any')}
          checked={hosts === ''}
          onChange={onValueChange}>
        </Radio>
        <Layout flex box>
          <Radio name="hosts"
            value="--"
            title={fixed ? hosts_manual : ''}
            checked={hosts === '--'}
            onChange={onValueChange}>
          </Radio>
          {!fixed &&
            <TextField name="hosts_manual"
              value={hosts_manual}
              disabled={hosts !== '--'}
              onChange={onValueChange}/>
          }
        </Layout>
      </FormGroup>

      <FormGroup title={_('Location')}>
        <Radio name="port"
          value=""
          title={_('Any')}
          checked={port === ''}
          onChange={onValueChange}>
        </Radio>
        <Layout flex box>
          <Radio name="port"
            value="--"
            title={fixed ? port_manual : ''}
            checked={port === '--'}
            onChange={onValueChange}>
          </Radio>
          {!fixed &&
            <TextField name="port_manual"
              value={port_manual}
              disabled={port !== '--'}
              onChange={onValueChange}/>
          }
        </Layout>
      </FormGroup>

      <FormGroup title={_('Severity')}>
        <Radio name="severity"
          value=""
          title={_('Any')}
          checked={is_empty(severity)}
          onChange={onValueChange}>
        </Radio>
        {is_edit && !fixed &&
          <Layout flex box>
            <Radio name="severity"
              value={0.1}
              title={_('> 0.0')}
              checked={!is_empty(severity) && severity > 0.0}
              convert={parse_float}
              onChange={onValueChange}>
            </Radio>
            <Radio name="severity"
              value={override_severity}
              title={result_cvss_risk_factor(override_severity)}
              checked={!is_empty(severity) && severity <= 0.0}
              convert={parse_float}
              onChange={onValueChange}>
            </Radio>
          </Layout>
        }
        {!is_edit && !fixed &&
          <Layout flex box>
            <Radio name="severity"
              value="0.1"
              title={_('> 0.0')}
              checked={severity === 0.1}
              convert={parse_float}
              onChange={onValueChange}>
            </Radio>
            <Radio name="severity"
              value="0.0"
              title={_('Log')}
              checked={severity === 0.0}
              convert={parse_float}
              onChange={onValueChange}>
            </Radio>
          </Layout>
        }
        {fixed &&
          <Layout flex box>
            <Radio
              name="severity"
              value={severity}
              title={
                severity > 0 ?
                  _('> 0.0') :
                  result_cvss_risk_factor(override_severity)
              }
              checked={!is_empty(severity) && severity > 0.0}
              convert={parse_float}
              onChange={onValueChange}>
            </Radio>
          </Layout>
        }
      </FormGroup>

      <FormGroup title={_('New Severity')}>
        <Radio name="custom_severity"
          value="0"
          checked={custom_severity === '0'}
          onChange={onValueChange}>
        </Radio>
        <Select2 name="new_severity_from_list"
          value={new_severity_from_list}
          disabled={custom_severity !== '0'}
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
        </Select2>
        <Radio name="custom_severity"
          value="1"
          title={_('Other')}
          checked={custom_severity === '1'}
          onChange={onValueChange}>
        </Radio>
        <TextField name="new_severity"
          value={new_severity}
          disabled={custom_severity !== '1'}
          convert={parse_float}
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Task')}>
        <Radio name="task_id"
          value=""
          title={_('Any')}
          checked={task_id === ''}
          onChange={onValueChange}/>
        <Layout flex box>
          <Radio name="task_id"
            value="0"
            title={fixed ? task_name : ''}
            checked={task_id === '0'}
            onChange={onValueChange}/>
          {!fixed &&
            <Select2 name="task_uuid"
              value={task_uuid}
              disabled={task_id !== '0'}
              onChange={onValueChange}>
              {render_options(tasks)}
            </Select2>
          }
        </Layout>
      </FormGroup>

      <FormGroup title={_('Result')}>
        <Radio name="result_id"
          value=""
          title={_('Any')}
          checked={result_id === ''}
          onChange={onValueChange}/>
        <Layout flex box>
          <Radio name="result_id"
            value="0"
            title={
              fixed ?
                _('Only selected result ({{- name}})', {name: result_name}) :
                _('UUID')
            }
            checked={result_id === '0'}
            onChange={onValueChange}/>
          {!fixed &&
            <TextField name="result_uuid"
              value={result_uuid}
              size="34"
              disabled={result_id !== '0'}
              onChange={onValueChange}/>
          }
        </Layout>
      </FormGroup>

      <FormGroup title={_('Text')}>
        <TextArea name="text"
          grow="1"
          rows="10" cols="60"
          value={text}
          onChange={onValueChange}/>
      </FormGroup>
    </Layout>
  );
};

OverrideDialog.propTypes = {
  active: PropTypes.oneOf(['0', '1', '-1', '-2']),
  custom_severity: PropTypes.oneOf(['0', '1']),
  days: PropTypes.number,
  fixed: PropTypes.bool,
  hosts_manual: PropTypes.string,
  hosts: PropTypes.string,
  new_severity_from_list: PropTypes.number,
  new_severity: PropTypes.number,
  nvt: PropTypes.model,
  oid: PropTypes.string,
  override: PropTypes.model,
  override_severity: PropTypes.number,
  port_manual: PropTypes.string,
  port: PropTypes.string,
  result_id: PropTypes.id,
  result_name: PropTypes.string,
  result_uuid: PropTypes.id,
  severity: PropTypes.number,
  task_id: PropTypes.id,
  task_name: PropTypes.string,
  tasks: PropTypes.arrayLike,
  task_uuid: PropTypes.id,
  text: PropTypes.string,
  onValueChange: PropTypes.func.isRequired,
};


export default withDialog({
  title: _('New Override'),
  footer: _('Save'),
  defaultState: {
    active: '-1',
    days: 30,
    fixed: false,
    oid: '1.3.6.1.4.1.25623.1.0.',
    hosts: '',
    hosts_manual: '',
    port: '',
    port_manual: '',
    custom_severity: '0',
    new_severity_from_list: -1,
    result_id: '',
    result_uuid: '',
    task_id: '',
    task_uuid: '',
    tasks: [],
    text: '',
  },
})(OverrideDialog);

// vim: set ts=2 sw=2 tw=80:
