/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import React, {useState} from 'react';

import _ from 'gmp/locale';

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
  OSP_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';

import {
  FULL_AND_FAST_SCAN_CONFIG_ID,
  OPENVAS_SCAN_CONFIG_TYPE,
  OSP_SCAN_CONFIG_TYPE,
  filterEmptyScanConfig,
} from 'gmp/models/scanconfig';

import {forEach, first} from 'gmp/utils/array';
import {isDefined, isArray} from 'gmp/utils/identity';
import {selectSaveId} from 'gmp/utils/id';

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
import Layout from 'web/components/layout/layout';

import PropTypes from 'web/utils/proptypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/render';
import useCapabilities from 'web/utils/useCapabilities';

import AddResultsToAssetsGroup from './addresultstoassetsgroup';
import AutoDeleteReportsGroup from './autodeletereportsgroup';

const sort_scan_configs = (scan_configs = []) => {
  const sorted_scan_configs = {
    [OPENVAS_SCAN_CONFIG_TYPE]: [],
    [OSP_SCAN_CONFIG_TYPE]: [],
  };

  scan_configs = scan_configs.filter(filterEmptyScanConfig);

  forEach(scan_configs, config => {
    const type = config.scanConfigType;
    if (!isArray(sorted_scan_configs[type])) {
      sorted_scan_configs[type] = [];
    }
    sorted_scan_configs[type].push(config);
  });
  return sorted_scan_configs;
};

const get_scanner = (scanners, scanner_id) => {
  if (!isDefined(scanners)) {
    return undefined;
  }

  return scanners.find(sc => {
    return sc.id === scanner_id;
  });
};

const ScannerSelect = props => {
  const {changeTask, isLoading, scannerId, scanners, onChange} = props;

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
    [OSP_SCANNER_TYPE]: PropTypes.array,
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
  comment = '',
  config_id,
  error,
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
  name = _('Unnamed'),
  scan_configs = [],
  scanner_id = OPENVAS_DEFAULT_SCANNER_ID,
  scanners = [
    {
      id: OPENVAS_DEFAULT_SCANNER_ID,
      scannerType: OPENVAS_SCANNER_TYPE,
    },
  ],
  schedule_id = UNSET_VALUE,
  schedule_periods = NO_VALUE,
  schedules = [],
  source_iface = '',
  tags = [],
  target_id,
  targets,
  task,
  title = _('New Task'),
  onAlertsChange,
  onClose,
  onErrorClose,
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
  const scanner = get_scanner(scanners, scanner_id);
  const scanner_type = isDefined(scanner) ? scanner.scannerType : undefined;

  const [configType, setConfigType] = useState('openvas');
  const [prevConfigType, setPrevConfigType] = useState('openvas');

  const capabilities = useCapabilities();

  // eslint-disable-next-line no-shadow
  const handleScannerChange = (value, name) => {
    // eslint-disable-next-line no-shadow
    const scanner = get_scanner(scanners, value);
    // eslint-disable-next-line no-shadow
    const scanner_type = isDefined(scanner) ? scanner.scannerType : undefined;

    if (
      scanner_type === OPENVAS_SCANNER_TYPE ||
      scanner_type === GREENBONE_SENSOR_SCANNER_TYPE
    ) {
      setConfigType('openvas');
    } else if (scanner_type === OSP_SCANNER_TYPE) {
      setConfigType('osp');
    } else {
      setConfigType('other');
    }

    if (isDefined(onScannerChange)) {
      onScannerChange(value);
    }

    if (configType !== prevConfigType && isDefined(onScanConfigChange)) {
      if (
        scanner_type === OPENVAS_SCANNER_TYPE ||
        scanner_type === GREENBONE_SENSOR_SCANNER_TYPE
      ) {
        onScanConfigChange(
          selectSaveId(
            sorted_scan_configs[OPENVAS_SCAN_CONFIG_TYPE],
            FULL_AND_FAST_SCAN_CONFIG_ID,
          ),
        );
      } else if (scanner_type === OSP_SCANNER_TYPE) {
        onScanConfigChange(
          selectSaveId(sorted_scan_configs[OSP_SCAN_CONFIG_TYPE], UNSET_VALUE),
        );
      } else {
        onScanConfigChange(UNSET_VALUE);
      }
    }
    setPrevConfigType(configType);
  };

  const tag_items = renderSelectItems(tags);

  const target_items = renderSelectItems(targets);

  const schedule_items = renderSelectItems(schedules, UNSET_VALUE);

  const sorted_scan_configs = sort_scan_configs(scan_configs);

  const osp_scan_config_items = renderSelectItems(
    sorted_scan_configs[OSP_SCAN_CONFIG_TYPE],
  );

  const openvas_scan_config_items = renderSelectItems(
    sorted_scan_configs[OPENVAS_SCAN_CONFIG_TYPE],
  );

  const alert_items = renderSelectItems(alerts);

  // having a task means we are editing a task
  const hasTask = isDefined(task);

  const change_task = hasTask ? task.isChangeable() : true;

  const showTagSelection = !hasTask && tags.length > 0;

  const tag_id = showTagSelection ? first(tags).id : undefined;

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
    scanner_type,
    scanner_id,
    schedule_periods,
    source_iface,
    tag_id,
    tags,
    task,
  };

  const controlledData = {
    alert_ids,
    config_id,
    schedule_id,
    scanner_id,
    scanner_type,
    target_id,
  };

  return (
    <SaveDialog
      error={error}
      title={title}
      onClose={onClose}
      onErrorClose={onErrorClose}
      onSave={onSave}
      defaultValues={uncontrolledData}
      values={controlledData}
    >
      {({values: state, onValueChange}) => {
        const osp_config_id = selectSaveId(
          sorted_scan_configs[OSP_SCAN_CONFIG_TYPE],
          state.config_id,
        );
        const openvas_config_id = selectSaveId(
          sorted_scan_configs[OPENVAS_SCAN_CONFIG_TYPE],
          state.config_id,
        );

        const is_osp_scanner = state.scanner_type === OSP_SCANNER_TYPE;

        const use_openvas_scan_config =
          state.scanner_type === OPENVAS_SCANNER_TYPE ||
          state.scanner_type === GREENBONE_SENSOR_SCANNER_TYPE;

        return (
          <Layout flex="column">
            <FormGroup title={_('Name')}>
              <TextField
                name="name"
                grow="1"
                size="30"
                value={state.name}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Comment')}>
              <TextField
                name="comment"
                grow="1"
                size="30"
                value={state.comment}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Scan Targets')}>
              <Divider>
                <div
                  title={
                    change_task
                      ? null
                      : _(
                          'This setting is not alterable once task has been run at least once.',
                        )
                  }
                >
                  <Select
                    name="target_id"
                    disabled={!change_task}
                    items={target_items}
                    isLoading={isLoadingTargets}
                    value={state.target_id}
                    width="260px"
                    onChange={onTargetChange}
                  />
                </div>
                {change_task && (
                  <Layout>
                    <NewIcon
                      title={_('Create a new target')}
                      onClick={onNewTargetClick}
                    />
                  </Layout>
                )}
              </Divider>
            </FormGroup>

            {capabilities.mayOp('get_alerts') && (
              <FormGroup title={_('Alerts')}>
                <Divider>
                  <MultiSelect
                    name="alert_ids"
                    items={alert_items}
                    isLoading={isLoadingAlerts}
                    value={state.alert_ids}
                    width="260px"
                    onChange={onAlertsChange}
                  />
                  <Layout>
                    <NewIcon
                      title={_('Create a new alert')}
                      onClick={onNewAlertClick}
                    />
                  </Layout>
                </Divider>
              </FormGroup>
            )}

            {capabilities.mayOp('get_schedules') && (
              <FormGroup title={_('Schedule')}>
                <Divider>
                  <Select
                    name="schedule_id"
                    value={state.schedule_id}
                    items={schedule_items}
                    isLoading={isLoadingSchedules}
                    width="201px"
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
                  <Layout>
                    <NewIcon
                      title={_('Create a new schedule')}
                      onClick={onNewScheduleClick}
                    />
                  </Layout>
                </Divider>
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
                size="4"
                disabled={state.in_assets !== YES_VALUE}
                type="int"
                min="0"
                max="100"
                value={state.min_qod}
                onChange={onValueChange}
              />
              <Layout>%</Layout>
            </FormGroup>

            {change_task && (
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
            <div
              title={
                change_task
                  ? null
                  : _(
                      'This setting is not alterable once task has been run at least once.',
                    )
              }
            >
              <ScannerSelect
                scanners={scanners}
                scannerId={state.scanner_id}
                changeTask={change_task}
                isLoading={isLoadingScanners}
                onChange={handleScannerChange}
              />
            </div>
            {use_openvas_scan_config && (
              <Layout flex="column" grow="1">
                <FormGroup titleSize="2" title={_('Scan Config')}>
                  <div
                    title={
                      change_task
                        ? null
                        : _(
                            'This setting is not alterable once task has been run at least once.',
                          )
                    }
                  >
                    <Select
                      name="config_id"
                      disabled={!change_task}
                      items={openvas_scan_config_items}
                      isLoading={isLoadingConfigs}
                      value={openvas_config_id}
                      onChange={value => {
                        onScanConfigChange(value);
                        setPrevConfigType(configType);
                      }}
                    />
                  </div>
                </FormGroup>
                <FormGroup titleSize="4" title={_('Network Source Interface')}>
                  <TextField
                    name="source_iface"
                    value={state.source_iface}
                    onChange={onValueChange}
                  />
                </FormGroup>
                <FormGroup titleSize="4" title={_('Order for target hosts')}>
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
                  titleSize="4"
                  title={_('Maximum concurrently executed NVTs per host')}
                >
                  <Spinner
                    name="max_checks"
                    size="10"
                    min="0"
                    maxLength="10"
                    value={state.max_checks}
                    onChange={onValueChange}
                  />
                </FormGroup>
                <FormGroup
                  titleSize="4"
                  title={_('Maximum concurrently scanned hosts')}
                >
                  <Spinner
                    name="max_hosts"
                    type="int"
                    min="0"
                    size="10"
                    maxLength="10"
                    value={state.max_hosts}
                    onChange={onValueChange}
                  />
                </FormGroup>
              </Layout>
            )}

            {is_osp_scanner && (
              <FormGroup titleSize="2" title={_('Scan Config')}>
                <Select
                  name="config_id"
                  items={osp_scan_config_items}
                  value={osp_config_id}
                  onChange={value => {
                    onScanConfigChange(value);
                    setPrevConfigType(configType);
                  }}
                />
              </FormGroup>
            )}

            {capabilities.mayAccess('tags') &&
              capabilities.mayCreate('tag') &&
              showTagSelection && (
                <React.Fragment>
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
                        disabled={state.add_tag !== YES_VALUE}
                        name="tag_id"
                        items={tag_items}
                        isLoading={isLoadingTags}
                        value={state.tag_id}
                        onChange={onValueChange}
                      />
                    </Divider>
                  </FormGroup>
                </React.Fragment>
              )}
          </Layout>
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
  comment: PropTypes.string,
  config_id: PropTypes.idOrZero,
  error: PropTypes.string,
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
  source_iface: PropTypes.string,
  tag_id: PropTypes.id,
  tags: PropTypes.array,
  target_id: PropTypes.idOrZero,
  targets: PropTypes.array,
  task: PropTypes.model,
  title: PropTypes.string,
  onAlertsChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onErrorClose: PropTypes.func,
  onNewAlertClick: PropTypes.func.isRequired,
  onNewScheduleClick: PropTypes.func.isRequired,
  onNewTargetClick: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onScanConfigChange: PropTypes.func.isRequired,
  onScannerChange: PropTypes.func.isRequired,
  onScheduleChange: PropTypes.func.isRequired,
  onTargetChange: PropTypes.func.isRequired,
};

export default TaskDialog;

// vim: set ts=2 sw=2 tw=80:
