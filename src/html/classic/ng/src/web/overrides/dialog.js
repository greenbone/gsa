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
import {is_defined, is_empty} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import {render_nvt_name, result_cvss_risk_factor, render_options,
} from '../render.js';

import {withDialog} from '../dialog/dialog.js';

import FormGroup from '../form/formgroup.js';
import Radio from '../form/radio.js';
import Spinner from '../form/spinner.js';
import Text from '../form/text.js';
import TextArea from '../form/textarea.js';
import TextField from '../form/textfield.js';
import Select2 from '../form/select2.js';

const OverrideDialog = ({
    active,
    custom_severity,
    days,
    hosts,
    hosts_manual,
    new_severity,
    new_severity_from_list,
    oid,
    override,
    port,
    port_manual,
    result_id,
    result_uuid,
    severity,
    task_id,
    tasks,
    task_uuid,
    text,
    onValueChange,
  }) => {

  let is_edit = is_defined(override);

  let override_severity = is_edit && override.severity ?
    override.severity : 0;

  return (
    <Layout flex="column">
      {is_edit ?
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
        </FormGroup> :
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
            checked={hosts === '--'}
            onChange={onValueChange}>
          </Radio>
          <TextField name="hosts_manual"
            value={hosts_manual}
            disabled={hosts !== '--'}
            onChange={onValueChange}/>
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
            checked={port === '--'}
            onChange={onValueChange}>
          </Radio>
          <TextField name="port_manual"
            value={port_manual}
            disabled={port !== '--'}
            onChange={onValueChange}/>
        </Layout>
      </FormGroup>

      <FormGroup title={_('Severity')}>
        <Radio name="severity"
          value=""
          title={_('Any')}
          checked={is_empty(severity)}
          onChange={onValueChange}>
        </Radio>
        {is_edit &&
          <Layout flex box>
            <Radio name="severity"
              value={0.1}
              title={_('> 0.0')}
              checked={!is_empty(severity) && severity > 0.0}
              onChange={onValueChange}>
            </Radio>
            <Radio name="severity"
              value={override_severity}
              title={result_cvss_risk_factor(override_severity)}
              checked={!is_empty(severity) && severity <= 0.0}
              onChange={onValueChange}>
            </Radio>
          </Layout>
        }
        {!is_edit &&
          <Layout flex box>
            <Radio name="severity"
              value="0.1"
              title={_('> 0.0')}
              checked={severity === '0.1'}
              onChange={onValueChange}>
            </Radio>
            <Radio name="severity"
              value="0.0"
              title={_('Log')}
              checked={severity === '0.0'}
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
            checked={task_id === '0'}
            onChange={onValueChange}/>
          <Select2 name="task_uuid"
            value={task_uuid}
            disabled={task_id !== '0'}
            onChange={onValueChange}>
            {render_options(tasks)}
          </Select2>
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
            title={_('UUID')}
            checked={result_id === '0'}
            onChange={onValueChange}/>
          <TextField name="result_uuid"
            value={result_uuid}
            size="34"
            disabled={result_id !== '0'}
            onChange={onValueChange}/>
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
  active: React.PropTypes.oneOf(['0', '1', '-1', '-2']),
  custom_severity: PropTypes.number,
  days: PropTypes.number,
  hosts_manual: React.PropTypes.string,
  hosts: React.PropTypes.string,
  new_severity: PropTypes.number,
  new_severity_from_list: PropTypes.number,
  oid: React.PropTypes.string,
  override: PropTypes.model,
  port_manual: React.PropTypes.string,
  port: React.PropTypes.string,
  result_id: PropTypes.id,
  result_uuid: PropTypes.id,
  severity: PropTypes.number,
  task_id: PropTypes.id,
  tasks: PropTypes.arrayLike,
  task_uuid: PropTypes.id,
  text: React.PropTypes.string,
  onValueChange: React.PropTypes.func,
};


export default withDialog(OverrideDialog, {
  title: _('New Override'),
  footer: _('Save'),
  defaultState: {
    active: '-1',
    days: 30,
    oid: '1.3.6.1.4.1.25623.1.0.',
    hosts: '',
    hosts_manual: '',
    port: '',
    port_manual: '',
    severity: '',
    custom_severity: '0',
    new_severity: '',
    new_severity_from_list: -1,
    result_id: '',
    result_uuid: '',
    task_id: '',
    task_uuid: '',
    tasks: [],
    text: '',
  },
});

// vim: set ts=2 sw=2 tw=80:
