/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import {parseFloat, parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';

import {
  ANY,
  MANUAL,
  ACTIVE_YES_ALWAYS_VALUE,
  DEFAULT_DAYS,
  DEFAULT_OID_VALUE,
  RESULT_ANY,
  TASK_ANY,
  ACTIVE_YES_UNTIL_VALUE,
  ACTIVE_YES_FOR_NEXT_VALUE,
  ACTIVE_NO_VALUE,
  TASK_SELECTED,
  RESULT_UUID,
} from 'gmp/models/override';

import DateTime from 'web/components/date/datetime';

import PropTypes from 'web/utils/proptypes';
import {
  renderNvtName,
  renderSelectItems,
  severityFormat,
} from 'web/utils/render';
import {
  FALSE_POSITIVE_VALUE,
  LOG_VALUE,
  HIGH_VALUE,
  MEDIUM_VALUE,
  LOW_VALUE,
  _FALSE_POSITIVE,
  _LOG,
  _LOW,
  _MEDIUM,
  _HIGH,
  translatedResultSeverityRiskFactor,
} from 'web/utils/severity';

import SaveDialog from 'web/components/dialog/savedialog';

import FormGroup from 'web/components/form/formgroup';
import Radio from 'web/components/form/radio';
import Spinner from 'web/components/form/spinner';
import TextArea from 'web/components/form/textarea';
import TextField from 'web/components/form/textfield';
import Select from 'web/components/form/select';

import Row from 'web/components/layout/row';

import useTranslation from 'web/hooks/useTranslation';
import Layout from 'web/components/layout/layout';

const OverrideDialog = ({
  active = ACTIVE_YES_ALWAYS_VALUE,
  custom_severity = NO_VALUE,
  days = DEFAULT_DAYS,
  fixed = false,
  hosts = ANY,
  hosts_manual = '',
  id,
  newSeverity,
  new_severity_from_list = FALSE_POSITIVE_VALUE,
  nvt_name,
  oid,
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
  title,
  onClose,
  onSave,
}) => {
  const [_] = useTranslation();
  const is_edit = isDefined(override);

  title = title || _('New Override');

  const data = {
    active,
    custom_severity,
    days,
    hosts,
    hosts_manual,
    newSeverity,
    new_severity_from_list,
    oid: isDefined(oid) ? oid : DEFAULT_OID_VALUE,
    override,
    port,
    port_manual,
    result_id,
    result_uuid,
    severity: isDefined(severity) ? severity : '',
    task_id,
    task_name,
    tasks,
    task_uuid,
    text,
  };

  let severity_from_list_items = [
    {
      value: HIGH_VALUE,
      label: `${_HIGH}`,
    },
    {
      value: MEDIUM_VALUE,
      label: `${_MEDIUM}`,
    },
    {
      value: LOW_VALUE,
      label: `${_LOW}`,
    },
    {
      value: LOG_VALUE,
      label: `${_LOG}`,
    },
    {
      value: FALSE_POSITIVE_VALUE,
      label: `${_FALSE_POSITIVE}`,
    },
  ];

  if (is_edit) {
    severity_from_list_items = [
      {
        label: '--',
        value: '',
      },
      ...severity_from_list_items,
    ];
  }
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
            {fixed && isDefined(oid) && (
              <FormGroup title={_('NVT')} flex="column">
                <span>{renderNvtName(oid, nvt_name)}</span>
              </FormGroup>
            )}
            {fixed && !isDefined(oid) && (
              <FormGroup title={_('NVT')} flex="column">
                <span>{renderNvtName(state.oid, nvt_name)}</span>
              </FormGroup>
            )}
            {is_edit && !fixed && (
              <FormGroup title={_('NVT')}>
                <Radio
                  name="oid"
                  title={renderNvtName(oid, nvt_name)}
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
            {!is_edit && !fixed && (
              <FormGroup title={_('NVT OID')}>
                <TextField
                  grow="1"
                  name="oid"
                  value={state.oid}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            <FormGroup title={_('Active')}>
              <Radio
                name="active"
                value={ACTIVE_YES_ALWAYS_VALUE}
                checked={state.active === ACTIVE_YES_ALWAYS_VALUE}
                title={_('yes, always')}
                onChange={onValueChange}
              />
              {is_edit &&
                override.isActive() &&
                isDefined(override.endTime) && (
                  <Row>
                    <Radio
                      name="active"
                      value={ACTIVE_YES_UNTIL_VALUE}
                      checked={state.active === ACTIVE_YES_UNTIL_VALUE}
                      title={_('yes, until')}
                      onChange={onValueChange}
                    />
                    <DateTime date={override.endTime} />
                  </Row>
                )}
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
                  disabled={state.active !== ACTIVE_YES_FOR_NEXT_VALUE}
                  type="int"
                  min="1"
                  value={state.days}
                  onChange={onValueChange}
                />
                <span>{_('days')}</span>
              </Row>
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
              <Row>
                <Radio
                  name="hosts"
                  checked={state.hosts === MANUAL}
                  value={MANUAL}
                  onChange={onValueChange}
                />
                <TextField
                  grow="1"
                  name="hosts_manual"
                  value={state.hosts_manual}
                  disabled={state.hosts !== MANUAL}
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
                  grow="1"
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
                checked={state.severity === ''}
                value=""
                onChange={onValueChange}
              />
              {isDefined(severity) && severity > 0 ? (
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
              {!isDefined(severity) && (
                <>
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
                </>
              )}
            </FormGroup>

            <FormGroup title={_('New Severity')} direction="column">
              <Row>
                <Radio
                  name="custom_severity"
                  checked={state.custom_severity === NO_VALUE}
                  convert={parseYesNo}
                  value={NO_VALUE}
                  onChange={onValueChange}
                />
                <Select
                  name="new_severity_from_list"
                  disabled={state.custom_severity === YES_VALUE}
                  convert={parseFloat}
                  items={severity_from_list_items}
                  value={state.new_severity_from_list}
                  onChange={onValueChange}
                />
              </Row>
              <Row>
                <Radio
                  name="custom_severity"
                  title={_('Other')}
                  checked={state.custom_severity === YES_VALUE}
                  convert={parseYesNo}
                  value={YES_VALUE}
                  onChange={onValueChange}
                />
                <TextField
                  name="newSeverity"
                  disabled={state.custom_severity === NO_VALUE}
                  convert={parseFloat}
                  value={state.newSeverity}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup title={_('Task')}>
              <Radio
                name="task_id"
                title={_('Any')}
                checked={state.task_id === TASK_ANY}
                value={TASK_ANY}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  name="task_id"
                  checked={state.task_id === TASK_SELECTED}
                  value={TASK_SELECTED}
                  onChange={onValueChange}
                />

                <Select
                  name="task_uuid"
                  grow="1"
                  disabled={state.task_id !== TASK_SELECTED}
                  items={renderSelectItems(tasks)}
                  value={state.task_uuid}
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
                    isDefined(result_name)
                      ? _('Only selected result ({{- name}})', {
                          name: result_name,
                        })
                      : _('UUID')
                  }
                  checked={state.result_id === RESULT_UUID}
                  value={RESULT_UUID}
                  onChange={onValueChange}
                />
                {(result_id === RESULT_ANY || result_id === RESULT_UUID) &&
                  !fixed && (
                    <TextField
                      name="result_uuid"
                      grow="1"
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

OverrideDialog.propTypes = {
  active: PropTypes.oneOf([
    ACTIVE_NO_VALUE,
    ACTIVE_YES_FOR_NEXT_VALUE,
    ACTIVE_YES_ALWAYS_VALUE,
    ACTIVE_YES_UNTIL_VALUE,
  ]),
  custom_severity: PropTypes.yesno,
  days: PropTypes.number,
  fixed: PropTypes.bool,
  hosts: PropTypes.string,
  hosts_manual: PropTypes.string,
  id: PropTypes.string,
  newSeverity: PropTypes.number,
  new_severity_from_list: PropTypes.number,
  nvt_name: PropTypes.string,
  oid: PropTypes.string,
  override: PropTypes.model,
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

export default OverrideDialog;

// vim: set ts=2 sw=2 tw=80:
