/* Copyright (C) 2017-2022 Greenbone AG
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
  RESULT_UUID,
} from 'gmp/models/override';

import DateTime from 'web/components/date/datetime';

import SaveDialog from 'web/components/dialog/savedialog';

import Row from 'web/components/layout/row';

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

import FormGroup from 'web/components/form/formgroup';
import TextArea from 'web/components/form/textarea';
import TextField from 'web/components/form/textfield';
import Radio from 'web/components/form/radio';
import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';

import useTranslation from 'web/hooks/useTranslation';

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
  title,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  const isEdit = isDefined(note);

  title = title || _('New Note');

  const data = {
    severity,
    active,
    days,
    fixed,
    hosts,
    hosts_manual,
    id,
    oid: isDefined(oid) ? oid : DEFAULT_OID_VALUE,
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
      title={title}
      defaultValues={data}
      values={{id}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            {state.fixed && isDefined(oid) && (
              <FormGroup title={_('NVT')} flex="column">
                <span>{renderNvtName(oid, nvt_name)}</span>
              </FormGroup>
            )}
            {state.fixed && !isDefined(oid) && (
              <FormGroup title={_('NVT')} flex="column">
                <span>{renderNvtName(state.oid, nvt_name)}</span>
              </FormGroup>
            )}
            {isEdit && !state.fixed && (
              <FormGroup title={_('NVT')} direction="column">
                <Radio
                  title={renderNvtName(oid, nvt_name)}
                  name="oid"
                  checked={state.oid === oid}
                  value={oid}
                  onChange={onValueChange}
                />
                <Row>
                  <Radio
                    name="oid"
                    checked={state.oid !== oid}
                    value={DEFAULT_OID_VALUE}
                    onChange={onValueChange}
                  />
                  <TextField
                    name="oid"
                    disabled={state.oid === oid}
                    value={state.oid === oid ? DEFAULT_OID_VALUE : state.oid}
                    onChange={onValueChange}
                  />
                </Row>
              </FormGroup>
            )}
            {!isEdit && !state.fixed && (
              <FormGroup title={_('NVT OID')}>
                <TextField
                  name="oid"
                  value={state.oid}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}
            <FormGroup title={_('Active')}>
              <Row>
                <Radio
                  name="active"
                  title={_('yes, always')}
                  checked={state.active === ACTIVE_YES_ALWAYS_VALUE}
                  value={ACTIVE_YES_ALWAYS_VALUE}
                  onChange={onValueChange}
                />
                {isEdit && note.isActive() && isDefined(note.endTime) && (
                  <Row>
                    <Radio
                      name="active"
                      title={_('yes, until')}
                      checked={state.active === ACTIVE_YES_UNTIL_VALUE}
                      value={ACTIVE_YES_UNTIL_VALUE}
                      onChange={onValueChange}
                    />
                    <DateTime date={note.endTime} />
                  </Row>
                )}
              </Row>
              <Row>
                <Radio
                  name="active"
                  checked={state.active === ACTIVE_YES_FOR_NEXT_VALUE}
                  title={_('yes, for the next')}
                  value={ACTIVE_YES_FOR_NEXT_VALUE}
                  onChange={onValueChange}
                />
                <Spinner
                  name="days"
                  type="int"
                  min="1"
                  disabled={state.active !== ACTIVE_YES_FOR_NEXT_VALUE}
                  value={state.days}
                  onChange={onValueChange}
                />
                <span>{_('days')}</span>
              </Row>
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
              <Row>
                <Radio
                  name="hosts"
                  checked={state.hosts === MANUAL}
                  value={MANUAL}
                  onChange={onValueChange}
                />
                <TextField
                  name="hosts_manual"
                  disabled={state.hosts !== MANUAL}
                  value={state.hosts_manual}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup title={_('Location')}>
              <Radio
                name="port"
                title={_('Any')}
                checked={state.port === ANY}
                value={ANY}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  name="port"
                  checked={state.port === MANUAL}
                  value={MANUAL}
                  onChange={onValueChange}
                />
                <TextField
                  name="port_manual"
                  disabled={state.port !== MANUAL}
                  value={state.port_manual}
                  onChange={onValueChange}
                />
              </Row>
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
                <>
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
                </>
              )}
              {!isDefined(severity) && (
                <Row>
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
                </Row>
              )}
            </FormGroup>

            <FormGroup title={_('Task')}>
              <Radio
                name="task_id"
                title={_('Any')}
                checked={state.task_id === ''}
                value=""
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  name="task_id"
                  checked={state.task_id === '0'}
                  value="0"
                  onChange={onValueChange}
                />
                <Select
                  name="task_uuid"
                  value={state.task_uuid}
                  items={renderSelectItems(tasks)}
                  disabled={state.task_id !== '0'}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup title={_('Result')}>
              <Radio
                name="result_id"
                title={_('Any')}
                checked={state.result_id === RESULT_ANY}
                value={RESULT_ANY}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  name="result_id"
                  title={
                    state.fixed
                      ? _('Only selected result ({{- name}})', {
                          name: state.result_name,
                        })
                      : _('UUID')
                  }
                  checked={state.result_id === RESULT_UUID}
                  value={RESULT_UUID}
                  onChange={onValueChange}
                />
                {!fixed && (
                  <TextField
                    name="result_uuid"
                    disabled={state.result_id !== RESULT_UUID}
                    value={state.result_uuid}
                    onChange={onValueChange}
                  />
                )}
              </Row>
            </FormGroup>

            <FormGroup title={_('Text')}>
              <TextArea
                name="text"
                minRows="4"
                autosize={true}
                value={state.text}
                onChange={onValueChange}
              />
            </FormGroup>
          </>
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
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default NoteDialog;

// vim: set ts=2 sw=2 tw=80:
