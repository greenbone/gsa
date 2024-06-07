/* Copyright (C) 2016-2022 Greenbone AG
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

import styled from 'styled-components';

import {first} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

import {NO_VALUE, YES_VALUE} from 'gmp/parser';

import {
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  AUTO_DELETE_NO,
  DEFAULT_MAX_CHECKS,
  DEFAULT_MAX_HOSTS,
  DEFAULT_MIN_QOD,
} from 'gmp/models/task';

import {
  OPENVAS_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';

import SaveDialog from 'web/components/dialog/savedialog';

import MultiSelect from 'web/components/form/multiselect';
import Select from 'web/components/form/select';
import Spinner from 'web/components/form/spinner';
import FormGroup from 'web/components/form/formgroup';
import Checkbox from 'web/components/form/checkbox';
import YesNoRadio from 'web/components/form/yesnoradio';
import TextField from 'web/components/form/textfield';

import NewIcon from 'web/components/icon/newicon';

import Divider from 'web/components/layout/divider';

import useTranslation from 'web/hooks/useTranslation';

import AddResultsToAssetsGroup from './addresultstoassetsgroup';
import AutoDeleteReportsGroup from './autodeletereportsgroup';

const Title = styled.div`
  flex-grow: 1;
`;

const getScanner = (scanners, scanner_id) => {
  if (!isDefined(scanners)) {
    return undefined;
  }

  return scanners.find(sc => {
    return sc.id === scanner_id;
  });
};

const ScannerSelect = ({
  changeTask,
  isLoading,
  scannerId,
  scanners,
  onChange,
}) => {
  const [_] = useTranslation();
  return (
    <FormGroup title={_('Scanner')}>
      <Select
        name="scanner_id"
        value={scannerId}
        disabled={!changeTask}
        items={renderSelectItems(scanners)}
        isLoading={isLoading}
        onChange={onChange}
      />
    </FormGroup>
  );
};

ScannerSelect.propTypes = {
  changeTask: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool,
  scanConfigs: PropTypes.shape({
    [OPENVAS_SCANNER_TYPE]: PropTypes.array,
  }),
  scannerId: PropTypes.id.isRequired,
  scanners: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

const TaskDialog = ({
  add_tag = NO_VALUE,
  alert_ids = [],
  alerts = [],
  alterable = NO_VALUE,
  apply_overrides = YES_VALUE,
  auto_delete = AUTO_DELETE_NO,
  auto_delete_data = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  capabilities,
  comment = '',
  config_id,
  hosts_ordering = HOSTS_ORDERING_SEQUENTIAL,
  in_assets = YES_VALUE,
  isLoadingAlerts = false,
  isLoadingConfigs = false,
  isLoadingScanners = false,
  isLoadingSchedules = false,
  isLoadingTargets = false,
  isLoadingTags = false,
  max_checks = DEFAULT_MAX_CHECKS,
  max_hosts = DEFAULT_MAX_HOSTS,
  min_qod = DEFAULT_MIN_QOD,
  name,
  scan_configs = [],
  scanner_id = OPENVAS_DEFAULT_SCANNER_ID,
  scanners = [
    {
      id: OPENVAS_DEFAULT_SCANNER_ID,
      scanner_type: OPENVAS_SCANNER_TYPE,
    },
  ],
  schedule_id = UNSET_VALUE,
  schedule_periods = NO_VALUE,
  schedules = [],
  tags = [],
  target_id,
  targets,
  task,
  title,
  onAlertsChange,
  onClose,
  onNewAlertClick,
  onNewScheduleClick,
  onNewTargetClick,
  onSave,
  onScanConfigChange,
  onScannerChange,
  onScheduleChange,
  onTargetChange,
  ...data
}) => {
  const [_] = useTranslation();

  name = name || _('Unnamed');
  title = title || _('New Task');

  const scanner = getScanner(scanners, scanner_id);
  const scannerType = isDefined(scanner) ? scanner.scannerType : undefined;

  const tagItems = renderSelectItems(tags);

  const targetItems = renderSelectItems(targets);

  const scheduleItems = renderSelectItems(schedules, UNSET_VALUE);

  const openvasScanConfigItems = renderSelectItems(scan_configs);

  const alertItems = renderSelectItems(alerts);

  // having a task means we are editing a task
  const hasTask = isDefined(task);

  const changeTask = hasTask ? task.isChangeable() : true;

  const showTagSelection = !hasTask && tags.length > 0;

  const tagId = showTagSelection ? first(tags).id : undefined;

  const uncontrolledData = {
    ...data,
    add_tag,
    alterable,
    apply_overrides,
    auto_delete,
    auto_delete_data,
    comment,
    config_id,
    hosts_ordering,
    in_assets,
    max_checks,
    max_hosts,
    min_qod,
    name,
    scanner_type: scannerType,
    scanner_id,
    schedule_periods,
    tag_id: tagId,
    tags,
    task,
  };

  const controlledData = {
    alert_ids,
    config_id,
    schedule_id,
    scanner_id,
    scanner_type: scannerType,
    target_id,
  };

  return (
    <SaveDialog
      title={title}
      onClose={onClose}
      onSave={onSave}
      defaultValues={uncontrolledData}
      values={controlledData}
    >
      {({values: state, onValueChange}) => {
        const openvasConfigId = selectSaveId(scan_configs, state.config_id);

        const useOpenvasScanConfig =
          state.scanner_type === OPENVAS_SCANNER_TYPE ||
          state.scanner_type === GREENBONE_SENSOR_SCANNER_TYPE;

        return (
          <>
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Scan Targets')} direction="row">
              <Title
                title={
                  changeTask
                    ? null
                    : _(
                        'This setting is not alterable once task has been run at least once.',
                      )
                }
              >
                <Select
                  name="target_id"
                  disabled={!changeTask}
                  items={targetItems}
                  isLoading={isLoadingTargets}
                  value={state.target_id}
                  onChange={onTargetChange}
                />
              </Title>
              {changeTask && (
                <NewIcon
                  title={_('Create a new target')}
                  onClick={onNewTargetClick}
                />
              )}
            </FormGroup>

            {capabilities.mayOp('get_alerts') && (
              <FormGroup title={_('Alerts')} direction="row">
                <MultiSelect
                  grow="1"
                  name="alert_ids"
                  items={alertItems}
                  isLoading={isLoadingAlerts}
                  value={state.alert_ids}
                  onChange={onAlertsChange}
                />
                <NewIcon
                  title={_('Create a new alert')}
                  onClick={onNewAlertClick}
                />
              </FormGroup>
            )}

            {capabilities.mayOp('get_schedules') && (
              <FormGroup title={_('Schedule')} direction="row">
                <Select
                  grow="1"
                  name="schedule_id"
                  value={state.schedule_id}
                  items={scheduleItems}
                  isLoading={isLoadingSchedules}
                  onChange={onScheduleChange}
                />
                <Checkbox
                  name="schedule_periods"
                  checked={state.schedule_periods === YES_VALUE}
                  checkedValue={YES_VALUE}
                  unCheckedValue={NO_VALUE}
                  title={_('Once')}
                  onChange={onValueChange}
                />
                <NewIcon
                  title={_('Create a new schedule')}
                  onClick={onNewScheduleClick}
                />
              </FormGroup>
            )}

            <AddResultsToAssetsGroup
              inAssets={state.in_assets}
              onChange={onValueChange}
            />

            <FormGroup title={_('Apply Overrides')}>
              <YesNoRadio
                name="apply_overrides"
                disabled={state.in_assets !== YES_VALUE}
                value={state.apply_overrides}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Min QoD')}>
              <Spinner
                name="min_qod"
                disabled={state.in_assets !== YES_VALUE}
                type="int"
                min="0"
                max="100"
                postfix="%"
                value={state.min_qod}
                onChange={onValueChange}
              />
            </FormGroup>

            {changeTask && (
              <FormGroup title={_('Alterable Task')}>
                <YesNoRadio
                  name="alterable"
                  disabled={task && !task.isNew()}
                  value={state.alterable}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            <AutoDeleteReportsGroup
              autoDelete={state.auto_delete}
              autoDeleteData={state.auto_delete_data}
              onChange={onValueChange}
            />

            <Title
              title={
                changeTask
                  ? null
                  : _(
                      'This setting is not alterable once task has been run at least once.',
                    )
              }
            >
              <ScannerSelect
                scanners={scanners}
                scannerId={state.scanner_id}
                changeTask={changeTask}
                isLoading={isLoadingScanners}
                onChange={onScannerChange}
              />
            </Title>
            {useOpenvasScanConfig && (
              <>
                <FormGroup title={_('Scan Config')}>
                  <Title
                    title={
                      changeTask
                        ? null
                        : _(
                            'This setting is not alterable once task has been run at least once.',
                          )
                    }
                  >
                    <Select
                      name="config_id"
                      disabled={!changeTask}
                      items={openvasScanConfigItems}
                      isLoading={isLoadingConfigs}
                      value={openvasConfigId}
                      onChange={value => {
                        onScanConfigChange(value);
                      }}
                    />
                  </Title>
                </FormGroup>
                <FormGroup title={_('Order for target hosts')}>
                  <Select
                    name="hosts_ordering"
                    items={[
                      {
                        value: 'sequential',
                        label: _('Sequential'),
                      },
                      {
                        value: 'random',
                        label: _('Random'),
                      },
                      {
                        value: 'reverse',
                        label: _('Reverse'),
                      },
                    ]}
                    value={state.hosts_ordering}
                    onChange={onValueChange}
                  />
                </FormGroup>
                <FormGroup
                  title={_('Maximum concurrently executed NVTs per host')}
                >
                  <Spinner
                    name="max_checks"
                    min="0"
                    value={state.max_checks}
                    onChange={onValueChange}
                  />
                </FormGroup>
                <FormGroup title={_('Maximum concurrently scanned hosts')}>
                  <Spinner
                    name="max_hosts"
                    type="int"
                    min="0"
                    value={state.max_hosts}
                    onChange={onValueChange}
                  />
                </FormGroup>
              </>
            )}

            {capabilities.mayAccess('tags') &&
              capabilities.mayCreate('tag') &&
              showTagSelection && (
                <FormGroup title={_('Tag')}>
                  <Divider>
                    <Checkbox
                      title={_('Add:')}
                      name="add_tag"
                      checkedValue={YES_VALUE}
                      unCheckedValue={NO_VALUE}
                      checked={state.add_tag === YES_VALUE}
                      onChange={onValueChange}
                    />
                    <Select
                      grow="1"
                      disabled={state.add_tag !== YES_VALUE}
                      name="tag_id"
                      items={tagItems}
                      isLoading={isLoadingTags}
                      value={state.tag_id}
                      onChange={onValueChange}
                    />
                  </Divider>
                </FormGroup>
              )}
          </>
        );
      }}
    </SaveDialog>
  );
};

TaskDialog.propTypes = {
  add_tag: PropTypes.yesno,
  alert_ids: PropTypes.array,
  alerts: PropTypes.array,
  alterable: PropTypes.yesno,
  apply_overrides: PropTypes.yesno,
  auto_delete: PropTypes.oneOf(['keep', 'no']),
  auto_delete_data: PropTypes.number,
  capabilities: PropTypes.capabilities.isRequired,
  comment: PropTypes.string,
  config_id: PropTypes.idOrZero,
  hosts_ordering: PropTypes.oneOf(['sequential', 'random', 'reverse']),
  in_assets: PropTypes.yesno,
  isLoadingAlerts: PropTypes.bool,
  isLoadingConfigs: PropTypes.bool,
  isLoadingScanners: PropTypes.bool,
  isLoadingSchedules: PropTypes.bool,
  isLoadingTags: PropTypes.bool,
  isLoadingTargets: PropTypes.bool,
  max_checks: PropTypes.number,
  max_hosts: PropTypes.number,
  min_qod: PropTypes.number,
  name: PropTypes.string,
  scan_configs: PropTypes.arrayOf(PropTypes.model),
  scanner_id: PropTypes.idOrZero,
  scanners: PropTypes.array,
  schedule_id: PropTypes.idOrZero,
  schedule_periods: PropTypes.yesno,
  schedules: PropTypes.array,
  tag_id: PropTypes.id,
  tags: PropTypes.array,
  target_id: PropTypes.idOrZero,
  targets: PropTypes.array,
  task: PropTypes.model,
  title: PropTypes.string,
  onAlertsChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onNewAlertClick: PropTypes.func.isRequired,
  onNewScheduleClick: PropTypes.func.isRequired,
  onNewTargetClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onScanConfigChange: PropTypes.func.isRequired,
  onScannerChange: PropTypes.func.isRequired,
  onScheduleChange: PropTypes.func.isRequired,
  onTargetChange: PropTypes.func.isRequired,
};

export default withCapabilities(TaskDialog);

// vim: set ts=2 sw=2 tw=80:
