/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
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
import {is_defined, is_empty, parse_float} from 'gmp/utils.js';

import Divider from '../../components/layout/divider.js';
import Layout from '../../components/layout/layout.js';

import PropTypes from '../../utils/proptypes.js';
import {
  render_nvt_name,
  render_options,
  result_cvss_risk_factor,
} from '../../utils/render.js';

import withDialog from '../../components/dialog/withDialog.js';

import FormGroup from '../../components/form/formgroup.js';
import Text from '../../components/form/text.js';
import TextArea from '../../components/form/textarea.js';
import TextField from '../../components/form/textfield.js';
import Radio from '../../components/form/radio.js';
import Select2 from '../../components/form/select2.js';
import Spinner from '../../components/form/spinner.js';

const NoteDialog = ({
    active,
    days,
    fixed,
    hosts,
    hosts_manual,
    note,
    note_severity,
    nvt,
    oid,
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

  const is_edit = is_defined(note);

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
            value={nvt.oid}
            title={render_nvt_name(nvt)}
            checked={oid === nvt.oid}
            onChange={onValueChange}/>
          <Layout flex box>
            <Radio
              name="oid"
              value="1.3.6.1.4.1.25623.1.0."
              checked={oid !== nvt.oid}
              onChange={onValueChange}/>
            <TextField
              name="oid"
              value={oid}
              disabled={oid === nvt.oid}
              onChange={onValueChange}/>
          </Layout>
        </FormGroup>
      }
      {!is_edit && !fixed &&
        <FormGroup title={_('NVT OID')}>
          <TextField
            name="oid"
            value={oid}
            onChange={onValueChange}/>
        </FormGroup>
      }
      <FormGroup title={_('Active')} flex="column">
        <Radio
          name="active"
          value="-1"
          checked={active === '-1'}
          title={_('yes, always')}
          onChange={onValueChange}/>
        {is_edit && note.isActive() && !is_empty(note.end_time) &&
          <Divider>
            <Radio
              name="active"
              value="-2"
              checked={active === '-2'}
              title={_('yes, until')}
              onChange={onValueChange}/>
            <Text>{datetime(note.end_time)}</Text>
          </Divider>
        }
        <Divider>
          <Radio
            name="active"
            value="1"
            checked={active === '1'}
            title={_('yes, for the next')}
            onChange={onValueChange}>
          </Radio>
          <Spinner
            name="days"
            value={days}
            size="4"
            type="int"
            min="1"
            onChange={onValueChange}
            disabled={active !== '1'}/>
          <Text>{_('days')}</Text>
        </Divider>
        <Radio
          name="active"
          value="0"
          checked={active === '0'}
          title={_('no')}
          onChange={onValueChange}/>
      </FormGroup>

      <FormGroup title={_('Hosts')}>
        <Radio
          name="hosts"
          value=""
          title={_('Any')}
          checked={hosts === ''}
          onChange={onValueChange}>
        </Radio>
        <Divider>
          <Radio
            name="hosts"
            value="--"
            title={fixed ? hosts_manual : ''}
            checked={hosts === '--'}
            onChange={onValueChange}>
          </Radio>
          {!fixed &&
            <TextField
              name="hosts_manual"
              disabled={hosts !== '--'}
              value={hosts_manual}
              onChange={onValueChange}/>
          }
        </Divider>
      </FormGroup>

      <FormGroup title={_('Location')}>
        <Radio
          name="port"
          value=""
          title={_('Any')}
          checked={port === ''}
          onChange={onValueChange}>
        </Radio>
        <Divider>
          <Radio
            name="port"
            value="--"
            title={fixed ? port_manual : ''}
            checked={port === '--'}
            onChange={onValueChange}>
          </Radio>
          {!fixed &&
            <TextField
              name="port_manual"
              value={port_manual}
              disabled={port !== '--'}
              onChange={onValueChange}/>
          }
        </Divider>
      </FormGroup>

      <FormGroup title={_('Severity')}>
        <Radio
          name="severity"
          value=""
          title={_('Any')}
          checked={is_empty(severity)}
          onChange={onValueChange}>
        </Radio>
        {is_edit && !fixed &&
          <Divider>
            <Radio
              name="severity"
              value={0.1}
              title={_('> 0.0')}
              checked={!is_empty(severity) && severity > 0.0}
              convert={parse_float}
              onChange={onValueChange}>
            </Radio>
            <Radio
              name="severity"
              value={note_severity}
              title={result_cvss_risk_factor(note_severity)}
              checked={!is_empty(severity) && severity <= 0.0}
              convert={parse_float}
              onChange={onValueChange}>
            </Radio>
          </Divider>
        }
        {!is_edit && !fixed &&
          <Divider>
            <Radio
              name="severity"
              value={0.1}
              title={_('> 0.0')}
              convert={parse_float}
              checked={severity === 0.1}
              onChange={onValueChange}>
            </Radio>
            <Radio
              name="severity"
              value={0.0}
              title={_('Log')}
              checked={severity === 0.0}
              convert={parse_float}
              onChange={onValueChange}>
            </Radio>
          </Divider>
        }
        {fixed &&
          <Divider>
            <Radio
              name="severity"
              value={severity}
              title={
                severity > 0 ?
                  _('> 0.0') :
                  result_cvss_risk_factor(note_severity)
              }
              checked={!is_empty(severity) && severity > 0.0}
              convert={parse_float}
              onChange={onValueChange}>
            </Radio>
          </Divider>
        }
      </FormGroup>

      <FormGroup title={_('Task')}>
        <Radio
          name="task_id"
          value=""
          title={_('Any')}
          checked={task_id === ''}
          onChange={onValueChange}/>
        <Divider>
          <Radio
            name="task_id"
            value="0"
            title={fixed ? task_name : ''}
            checked={task_id === '0'}
            onChange={onValueChange}/>
          {!fixed &&
            <Select2
              name="task_uuid"
              value={task_uuid}
              disabled={task_id !== '0'}
              onChange={onValueChange}>
              {render_options(tasks)}
            </Select2>
          }
        </Divider>
      </FormGroup>

      <FormGroup title={_('Result')}>
        <Radio
          name="result_id"
          value=""
          title={_('Any')}
          checked={result_id === ''}
          onChange={onValueChange}/>
        <Divider>
          <Radio
            name="result_id"
            value="0"
            title={
              fixed ?
                _('Only selected result ({{- name}})', {name: result_name}) :
                _('UUID')
            }
            checked={result_id === '0'}
            onChange={onValueChange}/>
          {!fixed &&
            <TextField
              name="result_uuid"
              value={result_uuid}
              size="34"
              disabled={result_id !== '0'}
              onChange={onValueChange}/>
          }
        </Divider>
      </FormGroup>

      <FormGroup title={_('Text')}>
        <TextArea
          name="text"
          grow="1"
          rows="10" cols="60"
          value={text}
          onChange={onValueChange}/>
      </FormGroup>
    </Layout>
  );
};

NoteDialog.propTypes = {
  active: PropTypes.oneOf(['0', '1', '-1', '-2']),
  days: PropTypes.number,
  fixed: PropTypes.bool,
  hosts: PropTypes.string,
  hosts_manual: PropTypes.string,
  note: PropTypes.model,
  note_id: PropTypes.id,
  note_severity: PropTypes.number,
  nvt: PropTypes.model,
  oid: PropTypes.string,
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
  onValueChange: PropTypes.func.isRequired,
};

export default withDialog({
  title: _('New Note'),
  footer: _('Save'),
  defaultState: {
    active: '-1',
    days: 30,
    fixed: false,
    oid: '1.3.6.1.4.1.25623.1.0.',
    hosts: '',
    hosts_manual: '',
    note_severity: 0,
    result_id: '',
    result_uuid: '',
    task_id: '',
    task_uuid: '',
    port: '',
    port_manual: '',
    text: '',
    tasks: [],
  },
})(NoteDialog);

// vim: set ts=2 sw=2 tw=80:
