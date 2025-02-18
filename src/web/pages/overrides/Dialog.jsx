/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

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
import {parseFloat, parseYesNo, YES_VALUE, NO_VALUE} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
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
} from 'web/utils/Severity';

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
      defaultValues={data}
      title={title}
      values={{id}}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            {fixed && isDefined(oid) && (
              <FormGroup flex="column" title={_('NVT')}>
                <span>{renderNvtName(oid, nvt_name)}</span>
              </FormGroup>
            )}
            {fixed && !isDefined(oid) && (
              <FormGroup flex="column" title={_('NVT')}>
                <span>{renderNvtName(state.oid, nvt_name)}</span>
              </FormGroup>
            )}
            {is_edit && !fixed && (
              <FormGroup title={_('NVT')}>
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
                checked={state.active === ACTIVE_YES_ALWAYS_VALUE}
                name="active"
                title={_('yes, always')}
                value={ACTIVE_YES_ALWAYS_VALUE}
                onChange={onValueChange}
              />
              {is_edit &&
                override.isActive() &&
                isDefined(override.endTime) && (
                  <Row>
                    <Radio
                      checked={state.active === ACTIVE_YES_UNTIL_VALUE}
                      name="active"
                      title={_('yes, until')}
                      value={ACTIVE_YES_UNTIL_VALUE}
                      onChange={onValueChange}
                    />
                    <DateTime date={override.endTime} />
                  </Row>
                )}
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
                  grow="1"
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
                  grow="1"
                  name="port_manual"
                  value={state.port_manual}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup title={_('Severity')}>
              <Radio
                checked={state.severity === ''}
                name="severity"
                title={_('Any')}
                value=""
                onChange={onValueChange}
              />
              {isDefined(severity) && severity > 0 ? (
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

            <FormGroup direction="column" title={_('New Severity')}>
              <Row>
                <Radio
                  checked={state.custom_severity === NO_VALUE}
                  convert={parseYesNo}
                  name="custom_severity"
                  value={NO_VALUE}
                  onChange={onValueChange}
                />
                <Select
                  convert={parseFloat}
                  disabled={state.custom_severity === YES_VALUE}
                  items={severity_from_list_items}
                  name="new_severity_from_list"
                  value={state.new_severity_from_list}
                  onChange={onValueChange}
                />
              </Row>
              <Row>
                <Radio
                  checked={state.custom_severity === YES_VALUE}
                  convert={parseYesNo}
                  name="custom_severity"
                  title={_('Other')}
                  value={YES_VALUE}
                  onChange={onValueChange}
                />
                <TextField
                  convert={parseFloat}
                  disabled={state.custom_severity === NO_VALUE}
                  name="newSeverity"
                  value={state.newSeverity}
                  onChange={onValueChange}
                />
              </Row>
            </FormGroup>

            <FormGroup title={_('Task')}>
              <Radio
                checked={state.task_id === TASK_ANY}
                name="task_id"
                title={_('Any')}
                value={TASK_ANY}
                onChange={onValueChange}
              />
              <Row>
                <Radio
                  checked={state.task_id === TASK_SELECTED}
                  name="task_id"
                  value={TASK_SELECTED}
                  onChange={onValueChange}
                />

                <Select
                  disabled={state.task_id !== TASK_SELECTED}
                  grow="1"
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
                    isDefined(result_name)
                      ? _('Only selected result ({{- name}})', {
                          name: result_name,
                        })
                      : _('UUID')
                  }
                  value={RESULT_UUID}
                  onChange={onValueChange}
                />
                {(result_id === RESULT_ANY || result_id === RESULT_UUID) &&
                  !fixed && (
                    <TextField
                      disabled={state.result_id !== RESULT_UUID}
                      grow="1"
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
