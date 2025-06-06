/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
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
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import DateTime from 'web/components/date/DateTime';
import SaveDialog from 'web/components/dialog/SaveDialog';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Select from 'web/components/form/Select';
import Spinner from 'web/components/form/Spinner';
import TextArea from 'web/components/form/TextArea';
import TextField from 'web/components/form/TextField';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';
import {
  renderNvtName,
  renderSelectItems,
  severityFormat,
} from 'web/utils/Render';
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
      defaultValues={data}
      title={title}
      values={{id}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            {state.fixed && isDefined(oid) && (
              <FormGroup flex="column" title={_('NVT')}>
                <span>{renderNvtName(oid, nvt_name)}</span>
              </FormGroup>
            )}
            {state.fixed && !isDefined(oid) && (
              <FormGroup flex="column" title={_('NVT')}>
                <span>{renderNvtName(state.oid, nvt_name)}</span>
              </FormGroup>
            )}
            {isEdit && !state.fixed && (
              <FormGroup direction="column" title={_('NVT')}>
                <Radio
                  checked={state.oid === oid}
                  name="oid"
                  title={renderNvtName(oid, nvt_name)}
                  value={oid}
                  onChange={onValueChange}
                />
                <Row>
                  <Radio
                    checked={state.oid !== oid}
                    name="oid"
                    value={DEFAULT_OID_VALUE}
                    onChange={onValueChange}
                  />
                  <TextField
                    disabled={state.oid === oid}
                    name="oid"
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
                  checked={state.active === ACTIVE_YES_ALWAYS_VALUE}
                  name="active"
                  title={_('yes, always')}
                  value={ACTIVE_YES_ALWAYS_VALUE}
                  onChange={onValueChange}
                />
                {isEdit && note.isActive() && isDefined(note.endTime) && (
                  <Row>
                    <Radio
                      checked={state.active === ACTIVE_YES_UNTIL_VALUE}
                      name="active"
                      title={_('yes, until')}
                      value={ACTIVE_YES_UNTIL_VALUE}
                      onChange={onValueChange}
                    />
                    <DateTime date={note.endTime} />
                  </Row>
                )}
              </Row>
              <Row>
                <Radio
                  checked={state.active === ACTIVE_YES_FOR_NEXT_VALUE}
                  name="active"
                  title={_('yes, for the next')}
                  value={ACTIVE_YES_FOR_NEXT_VALUE}
                  onChange={onValueChange}
                />
                <Spinner
                  disabled={state.active !== ACTIVE_YES_FOR_NEXT_VALUE}
                  min="1"
                  name="days"
                  type="int"
                  value={state.days}
                  onChange={onValueChange}
                />
                <span>{_('days')}</span>
              </Row>
              <Radio
                checked={state.active === ACTIVE_NO_VALUE}
                name="active"
                title={_('no')}
                value={ACTIVE_NO_VALUE}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Hosts')}>
              <Radio
                checked={state.hosts === ANY}
                name="hosts"
                title={_('Any')}
                value={ANY}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  checked={state.hosts === MANUAL}
                  name="hosts"
                  value={MANUAL}
                  onChange={onValueChange}
                />
                <TextField
                  disabled={state.hosts !== MANUAL}
                  name="hosts_manual"
                  value={state.hosts_manual}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup title={_('Location')}>
              <Radio
                checked={state.port === ANY}
                name="port"
                title={_('Any')}
                value={ANY}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  checked={state.port === MANUAL}
                  name="port"
                  value={MANUAL}
                  onChange={onValueChange}
                />
                <TextField
                  disabled={state.port !== MANUAL}
                  name="port_manual"
                  value={state.port_manual}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup title={_('Severity')}>
              <Row>
                <Radio
                  checked={isEmpty(state.severity)}
                  name="severity"
                  title={_('Any')}
                  value=""
                  onChange={onValueChange}
                />
                {isDefined(severity) && (
                  <>
                    {severity > LOG_VALUE ? (
                      <Radio
                        checked={true}
                        convert={parseFloat}
                        name="severity"
                        title={' > ' + severityFormat(severity - 0.1)}
                        value={severity}
                        onChange={onValueChange}
                      />
                    ) : (
                      <Radio
                        checked={state.severity === severity}
                        convert={parseFloat}
                        name="severity"
                        title={translatedResultSeverityRiskFactor(severity)}
                        value={severity}
                        onChange={onValueChange}
                      />
                    )}
                  </>
                )}
              </Row>
              {!isDefined(severity) && (
                <>
                  <Radio
                    checked={state.severity === 0.1}
                    convert={parseFloat}
                    name="severity"
                    title={_('> 0.0')}
                    value="0.1"
                    onChange={onValueChange}
                  />
                  <Radio
                    checked={state.severity === 0.0}
                    convert={parseFloat}
                    name="severity"
                    title={_('Log')}
                    value="0.0"
                    onChange={onValueChange}
                  />
                </>
              )}
            </FormGroup>

            <FormGroup title={_('Task')}>
              <Radio
                checked={state.task_id === ''}
                name="task_id"
                title={_('Any')}
                value=""
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  checked={state.task_id === '0'}
                  name="task_id"
                  value="0"
                  onChange={onValueChange}
                />
                <Select
                  disabled={state.task_id !== '0'}
                  items={renderSelectItems(tasks)}
                  name="task_uuid"
                  value={state.task_uuid}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup title={_('Result')}>
              <Radio
                checked={state.result_id === RESULT_ANY}
                name="result_id"
                title={_('Any')}
                value={RESULT_ANY}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  checked={state.result_id === RESULT_UUID}
                  name="result_id"
                  title={
                    state.fixed
                      ? _('Only selected result ({{- name}})', {
                          name: state.result_name,
                        })
                      : _('UUID')
                  }
                  value={RESULT_UUID}
                  onChange={onValueChange}
                />
                {!fixed && (
                  <TextField
                    disabled={state.result_id !== RESULT_UUID}
                    name="result_uuid"
                    value={state.result_uuid}
                    onChange={onValueChange}
                  />
                )}
              </Row>
            </FormGroup>

            <FormGroup title={_('Text')}>
              <TextArea
                autosize={true}
                minRows="4"
                name="text"
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
