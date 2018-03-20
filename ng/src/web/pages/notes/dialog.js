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

import _, {datetime} from 'gmp/locale';

import {is_defined} from 'gmp/utils/identity';
import {is_empty} from 'gmp/utils/string';

import {parse_float} from 'gmp/parser';

import {
  ANY,
  MANUAL,
  TASK_ANY,
  DEFAULT_DAYS,
  ACTIVE_YES_ALWAYS_VALUE,
  DEFAULT_OID_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
  ACTIVE_YES_FOR_NEXT_VALUE,
  ACTIVE_NO_VALUE,
  RESULT_ANY,
} from 'gmp/models/override';

import SaveDialog from '../../components/dialog/savedialog';

import Divider from '../../components/layout/divider';
import Layout from '../../components/layout/layout';

import PropTypes from '../../utils/proptypes';
import {
  render_nvt_name,
  result_cvss_risk_factor,
  render_select_items,
  cvss_number_format,
} from '../../utils/render.js';

import FormGroup from '../../components/form/formgroup.js';
import Text from '../../components/form/text.js';
import TextArea from '../../components/form/textarea.js';
import TextField from '../../components/form/textfield.js';
import Radio from '../../components/form/radio.js';
import Select from '../../components/form/select.js';
import Spinner from '../../components/form/spinner.js';

const NoteDialog = ({
  active = ACTIVE_YES_ALWAYS_VALUE,
  days = DEFAULT_DAYS,
  fixed = false,
  id,
  hosts = ANY,
  hosts_manual = '',
  note,
  nvt_name,
  oid,
  port = ANY,
  port_manual = '',
  result_id = RESULT_ANY,
  result_name,
  result_uuid,
  severity,
  task_id = TASK_ANY,
  task_name,
  tasks,
  task_uuid,
  text = '',
  title = _('New Note'),
  visible,
  onClose,
  onSave,
}) => {
  const is_edit = is_defined(note);

  const data = {
    severity,
    active,
    days,
    fixed,
    hosts,
    hosts_manual,
    id,
    oid: is_defined(oid) ? oid : DEFAULT_OID_VALUE,
    port,
    port_manual,
    result_id,
    result_uuid,
    result_name,
    task_id,
    task_uuid,
    task_name,
    text,
  };

  return (
    <SaveDialog
      visible={visible}
      title={title}
      defaultValues={data}
      values={{id}}
      onClose={onClose}
      onSave={onSave}
    >
      {({
        values: state,
        onValueChange,
      }) => {

        return (
          <Layout flex="column">
            {state.fixed &&
              <FormGroup title={_('NVT')} flex="column">
                <Text>{render_nvt_name(oid, nvt_name)}</Text>
              </FormGroup>
            }
            {is_edit && !state.fixed &&
              <FormGroup title={_('NVT')} flex="column">
                <Radio
                  title={render_nvt_name(oid, nvt_name)}
                  name="oid"
                  checked={state.oid === oid}
                  value={oid}
                  onChange={onValueChange}
                />
                <Divider>
                  <Radio
                    name="oid"
                    checked={state.oid !== oid}
                    value={DEFAULT_OID_VALUE}
                    onChange={onValueChange}
                  />
                  <TextField
                    name="oid"
                    disabled={state.oid === oid}
                    value={state.oid === oid ? DEFAULT_OID_VALUE :
                      state.oid}
                    onChange={onValueChange}
                  />
                </Divider>
              </FormGroup>
            }
            {!is_edit && !state.fixed &&
              <FormGroup title={_('NVT OID')}>
                <TextField
                  name="oid"
                  value={state.oid}
                  onChange={onValueChange}
                />
              </FormGroup>
            }
            <FormGroup title={_('Active')} flex="column">
              <Divider flex="column">
                <Radio
                  name="active"
                  title={_('yes, always')}
                  checked={state.active === ACTIVE_YES_ALWAYS_VALUE}
                  value={ACTIVE_YES_ALWAYS_VALUE}
                  onChange={onValueChange}
                />
                {is_edit && note.isActive() &&
                  is_defined(note.end_time) &&
                  <Divider>
                    <Radio
                      name="active"
                      title={_('yes, until')}
                      checked={state.active === ACTIVE_YES_UNTIL_VALUE}
                      value={ACTIVE_YES_UNTIL_VALUE}
                      onChange={onValueChange}
                    />
                    <Text>{datetime(note.end_time)}</Text>
                  </Divider>
                }
              </Divider>
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
                  type="int"
                  min="1"
                  disabled={state.active !== ACTIVE_YES_FOR_NEXT_VALUE}
                  value={state.days}
                  onChange={onValueChange}
                />
                <Text>{_('days')}</Text>
              </Divider>
              <Radio
                name="active"
                title={_('no')}
                checked={state.active === ACTIVE_NO_VALUE}
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
              <Divider>
                <Radio
                  name="hosts"
                  title={state.fixed ? state.hosts_manual : ''}
                  checked={state.hosts === MANUAL}
                  value={MANUAL}
                  onChange={onValueChange}
                />
                {!state.fixed &&
                  <TextField
                    name="hosts_manual"
                    disabled={state.hosts !== MANUAL}
                    value={state.hosts_manual}
                    onChange={onValueChange}
                  />
                }
              </Divider>
            </FormGroup>

            <FormGroup title={_('Location')}>
              <Radio
                name="port"
                title={_('Any')}
                checked={state.port === ANY}
                value={ANY}
                onChange={onValueChange}
              />
              <Divider>
                <Radio
                  name="port"
                  title={state.fixed ? state.port_manual : ''}
                  checked={state.port === MANUAL}
                  value={MANUAL}
                  onChange={onValueChange}
                />
                {!state.fixed &&
                  <TextField
                    name="port_manual"
                    disabled={state.port !== MANUAL}
                    value={state.port_manual}
                    onChange={onValueChange}
                  />
                }
              </Divider>
            </FormGroup>

            <FormGroup title={_('Severity')}>
              <Radio
                name="severity"
                title={_('Any')}
                checked={is_empty(state.severity)}
                value=""
                onChange={onValueChange}
              />
              {is_defined(severity) &&
                <Layout flex>
                  {severity > 0 ?
                    <Radio
                      name="severity"
                      title={' > ' +
                        cvss_number_format(severity - 0.1)}
                      checked={true}
                      convert={parse_float}
                      value={severity}
                      onChange={onValueChange}
                    /> :
                    <Radio
                      name="severity"
                      title={result_cvss_risk_factor(severity)}
                      checked={state.severity === severity}
                      convert={parse_float}
                      value={severity}
                      onChange={onValueChange}
                    />
                  }
                </Layout>
              }
              {!is_defined(severity) &&
                <Layout flex>
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
            </FormGroup>

            <FormGroup title={_('Task')}>
              <Radio
                name="task_id"
                title={_('Any')}
                checked={state.task_id === ''}
                value=""
                onChange={onValueChange}
              />
              <Divider>
                <Radio
                  name="task_id"
                  title={state.fixed ? state.task_name : ''}
                  checked={state.task_id === '0'}
                  value="0"
                  onChange={onValueChange}
                />
                {!state.fixed &&
                  <Select
                    name="task_uuid"
                    value={state.task_uuid}
                    items={render_select_items(tasks)}
                    disabled={state.task_id !== '0'}
                    onChange={onValueChange}
                  />
                }
              </Divider>
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
                    state.fixed ?
                      _('Only selected result ({{- name}})',
                        {name: state.result_name}) :
                      _('UUID')
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
                rows="10" cols="60"
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

NoteDialog.propTypes = {
  active: PropTypes.oneOf([
    ACTIVE_NO_VALUE,
    ACTIVE_YES_FOR_NEXT_VALUE,
    ACTIVE_YES_ALWAYS_VALUE,
    ACTIVE_YES_UNTIL_VALUE,
  ]),
  days: PropTypes.number,
  fixed: PropTypes.bool,
  hosts: PropTypes.string,
  hosts_manual: PropTypes.string,
  id: PropTypes.string,
  note: PropTypes.model,
  nvt_name: PropTypes.string,
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
  title: PropTypes.string,
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default NoteDialog;

// vim: set ts=2 sw=2 tw=80:
