/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';

import {parseFloat} from 'gmp/parser';

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

import DateTime from 'web/components/date/datetime';

import SaveDialog from 'web/components/dialog/savedialog';

import Divider from 'web/components/layout/divider';
import Layout from 'web/components/layout/layout';

import FormGroup from 'web/components/form/formgroup';
import TextArea from 'web/components/form/textarea';
import TextField from 'web/components/form/textfield';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';

import PropTypes from 'web/utils/proptypes';
import {
  renderNvtName,
  renderSelectItems,
  severityFormat,
} from 'web/utils/render';
import {
  LOG_VALUE,
  translatedResultSeverityRiskFactor,
} from 'web/utils/severity';

const NoteDialog = ({
  active = ACTIVE_YES_ALWAYS_VALUE,
  days = DEFAULT_DAYS,
  fixed = false,
  id,
  hosts = ANY,
  hostsManual = '',
  note,
  nvtName,
  nvtId,
  port = ANY,
  portManual = '',
  resultId = RESULT_ANY,
  result_name,
  resultUuid,
  severity,
  taskId = TASK_ANY,
  taskName,
  tasks,
  taskUuid,
  text = '',
  title = _('New Note'),
  onClose,
  onSave,
}) => {
  const is_edit = isDefined(note);

  const data = {
    severity,
    active,
    days,
    fixed,
    hosts,
    hostsManual,
    id,
    nvtId: isDefined(nvtId) ? nvtId : DEFAULT_OID_VALUE,
    port,
    portManual,
    resultId,
    resultUuid,
    result_name,
    taskId,
    taskUuid,
    taskName,
    text,
  };

  return (
    <SaveDialog
      title={title}
      defaultValues={data}
      values={{id}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <Layout flex="column">
            {state.fixed && isDefined(nvtId) && (
              <FormGroup title={_('NVT')} flex="column">
                <span>{renderNvtName(nvtId, nvtName)}</span>
              </FormGroup>
            )}
            {state.fixed && !isDefined(nvtId) && (
              <FormGroup title={_('NVT')} flex="column">
                <span>{renderNvtName(state.nvtId, nvtName)}</span>
              </FormGroup>
            )}
            {is_edit && !state.fixed && (
              <FormGroup title={_('NVT')} flex="column">
                <Radio
                  title={renderNvtName(nvtId, nvtName)}
                  name="nvtId"
                  checked={state.nvtId === nvtId}
                  value={nvtId}
                  onChange={onValueChange}
                />
                <Divider>
                  <Radio
                    name="nvtId"
                    checked={state.nvtId !== nvtId}
                    value={DEFAULT_OID_VALUE}
                    onChange={onValueChange}
                  />
                  <TextField
                    name="nvtId"
                    disabled={state.nvtId === nvtId}
                    value={
                      state.nvtId === nvtId ? DEFAULT_OID_VALUE : state.nvtId
                    }
                    onChange={onValueChange}
                  />
                </Divider>
              </FormGroup>
            )}
            {!is_edit && !state.fixed && (
              <FormGroup title={_('NVT OID')}>
                <TextField
                  name="nvtId"
                  value={state.nvtId}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}
            <FormGroup title={_('Active')} flex="column">
              <Divider flex="column">
                <Radio
                  name="active"
                  title={_('yes, always')}
                  checked={state.active === ACTIVE_YES_ALWAYS_VALUE}
                  value={ACTIVE_YES_ALWAYS_VALUE}
                  onChange={onValueChange}
                />
                {is_edit && note.isActive() && isDefined(note.endTime) && (
                  <Divider>
                    <Radio
                      name="active"
                      title={_('yes, until')}
                      checked={state.active === ACTIVE_YES_UNTIL_VALUE}
                      value={ACTIVE_YES_UNTIL_VALUE}
                      onChange={onValueChange}
                    />
                    <DateTime date={note.endTime} />
                  </Divider>
                )}
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
                <span>{_('days')}</span>
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
                  checked={state.hosts === MANUAL}
                  value={MANUAL}
                  onChange={onValueChange}
                />
                <TextField
                  name="hostsManual"
                  disabled={state.hosts !== MANUAL}
                  value={state.hostsManual}
                  onChange={onValueChange}
                />
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
                  checked={state.port === MANUAL}
                  value={MANUAL}
                  onChange={onValueChange}
                />
                <TextField
                  name="portManual"
                  disabled={state.port !== MANUAL}
                  value={state.portManual}
                  onChange={onValueChange}
                />
              </Divider>
            </FormGroup>

            <FormGroup title={_('Severity')}>
              <Radio
                name="severity"
                title={_('Any')}
                checked={isEmpty(state.severity)}
                value=""
                onChange={onValueChange}
              />
              {isDefined(severity) && (
                <Layout>
                  {severity > LOG_VALUE ? (
                    <Radio
                      name="severity"
                      title={' > ' + severityFormat(severity - 0.1)}
                      checked={true}
                      convert={parseFloat}
                      value={severity}
                      onChange={onValueChange}
                    />
                  ) : (
                    <Radio
                      name="severity"
                      title={translatedResultSeverityRiskFactor(severity)}
                      checked={state.severity === severity}
                      convert={parseFloat}
                      value={severity}
                      onChange={onValueChange}
                    />
                  )}
                </Layout>
              )}
              {!isDefined(severity) && (
                <Layout>
                  <Radio
                    name="severity"
                    title={_('> 0.0')}
                    checked={state.severity === 0.1}
                    convert={parseFloat}
                    value="0.1"
                    onChange={onValueChange}
                  />
                  <Radio
                    name="severity"
                    value="0.0"
                    title={_('Log')}
                    checked={state.severity === 0.0}
                    convert={parseFloat}
                    onChange={onValueChange}
                  />
                </Layout>
              )}
            </FormGroup>

            <FormGroup title={_('Task')}>
              <Radio
                name="taskId"
                title={_('Any')}
                checked={state.taskId === ''}
                value=""
                onChange={onValueChange}
              />
              <Divider>
                <Radio
                  name="taskId"
                  checked={state.taskId === '0'}
                  value="0"
                  onChange={onValueChange}
                />
                <Select
                  name="taskUuid"
                  value={state.taskUuid}
                  items={renderSelectItems(tasks)}
                  disabled={state.taskId !== '0'}
                  onChange={onValueChange}
                />
              </Divider>
            </FormGroup>

            <FormGroup title={_('Result')}>
              <Radio
                name="resultId"
                title={_('Any')}
                checked={state.resultId === ''}
                value=""
                onChange={onValueChange}
              />
              <Divider>
                <Radio
                  name="resultId"
                  title={
                    state.fixed
                      ? _('Only selected result ({{- name}})', {
                          name: state.result_name,
                        })
                      : _('UUID')
                  }
                  checked={state.resultId === '0'}
                  value="0"
                  onChange={onValueChange}
                />
                {!fixed && (
                  <TextField
                    name="resultUuid"
                    size="34"
                    disabled={state.resultId !== '0'}
                    value={state.resultId}
                    onChange={onValueChange}
                  />
                )}
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
  hostsManual: PropTypes.string,
  id: PropTypes.string,
  note: PropTypes.model,
  nvtName: PropTypes.string,
  nvtId: PropTypes.string,
  port: PropTypes.string,
  portManual: PropTypes.string,
  resultId: PropTypes.id,
  result_name: PropTypes.string,
  resultUuid: PropTypes.id,
  severity: PropTypes.number,
  taskId: PropTypes.id,
  taskName: PropTypes.string,
  taskUuid: PropTypes.id,
  tasks: PropTypes.array,
  text: PropTypes.string,
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default NoteDialog;

// vim: set ts=2 sw=2 tw=80:
