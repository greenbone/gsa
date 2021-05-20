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
  filterEmptyScanConfig,
  SCAN_CONFIG_TYPE,
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

export const toBoolean = value => value === 'true';

const sort_scan_configs = (scanConfigs = []) => {
  const sortedScanConfigs = {
    [SCAN_CONFIG_TYPE.openvas]: [],
    [SCAN_CONFIG_TYPE.osp]: [],
  };

  scanConfigs = scanConfigs.filter(filterEmptyScanConfig);

  forEach(scanConfigs, config => {
    const type = config.scanConfigType;
    if (!isArray(sortedScanConfigs[type])) {
      sortedScanConfigs[type] = [];
    }
    sortedScanConfigs[type].push(config);
  });
  return sortedScanConfigs;
};

const get_scanner = (scanners, scannerId) => {
  if (!isDefined(scanners)) {
    return undefined;
  }

  return scanners.find(sc => {
    return sc.id === scannerId;
  });
};

const ScannerSelect = props => {
  const {changeTask, isLoading, scannerId, scanners, onChange} = props;

  return (
    <FormGroup title={_('Scanner')}>
      <Select
        name="scannerId"
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
  addTag = false,
  alertIds = [],
  alerts = [],
  alterable = false,
  createAssetsApplyOverrides = true,
  autoDelete = false,
  autoDeleteReports = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  comment = '',
  configId,
  error,
  createAssets = true,
  isLoadingAlerts = false,
  isLoadingConfigs = false,
  isLoadingScanners = false,
  isLoadingSchedules = false,
  isLoadingTargets = false,
  isLoadingTags = false,
  maxConcurrentNvts = DEFAULT_MAX_CHECKS,
  maxConcurrentHosts = DEFAULT_MAX_HOSTS,
  createAssetsMinQod = DEFAULT_MIN_QOD,
  name = _('Unnamed'),
  scanConfigs = [],
  scannerId = OPENVAS_DEFAULT_SCANNER_ID,
  scanners = [
    {
      id: OPENVAS_DEFAULT_SCANNER_ID,
      scannerType: OPENVAS_SCANNER_TYPE,
    },
  ],
  scheduleId = UNSET_VALUE,
  schedules = [],
  tags = [],
  targetId,
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
  const scanner = get_scanner(scanners, scannerId);
  const scannerType = isDefined(scanner) ? scanner.scannerType : undefined;

  const [configType, setConfigType] = useState('openvas');
  const [prevConfigType, setPrevConfigType] = useState('openvas');

  const capabilities = useCapabilities();

  // eslint-disable-next-line no-shadow
  const handleScannerChange = (value, name) => {
    // eslint-disable-next-line no-shadow
    const scanner = get_scanner(scanners, value);
    // eslint-disable-next-line no-shadow
    const scannerType = isDefined(scanner) ? scanner.scannerType : undefined;

    if (
      scannerType === OPENVAS_SCANNER_TYPE ||
      scannerType === GREENBONE_SENSOR_SCANNER_TYPE
    ) {
      setConfigType('openvas');
    } else if (scannerType === OSP_SCANNER_TYPE) {
      setConfigType('osp');
    } else {
      setConfigType('other');
    }

    if (isDefined(onScannerChange)) {
      onScannerChange(value);
    }

    if (configType !== prevConfigType && isDefined(onScanConfigChange)) {
      if (
        scannerType === OPENVAS_SCANNER_TYPE ||
        scannerType === GREENBONE_SENSOR_SCANNER_TYPE
      ) {
        onScanConfigChange(
          selectSaveId(
            sortedScanConfigs[SCAN_CONFIG_TYPE.openvas],
            FULL_AND_FAST_SCAN_CONFIG_ID,
          ),
        );
      } else if (scannerType === OSP_SCANNER_TYPE) {
        onScanConfigChange(
          selectSaveId(sortedScanConfigs[SCAN_CONFIG_TYPE.osp], UNSET_VALUE),
        );
      } else {
        onScanConfigChange(UNSET_VALUE);
      }
    }
    setPrevConfigType(configType);
  };

  const tagItems = renderSelectItems(tags);

  const targetItems = renderSelectItems(targets);

  const scheduleItems = renderSelectItems(schedules, UNSET_VALUE);

  const sortedScanConfigs = sort_scan_configs(scanConfigs);

  const ospScanConfigItems = renderSelectItems(
    sortedScanConfigs[SCAN_CONFIG_TYPE.osp],
  );

  const openvasScanConfigItems = renderSelectItems(
    sortedScanConfigs[SCAN_CONFIG_TYPE.openvas],
  );

  const alertItems = renderSelectItems(alerts);

  // having a task means we are editing a task
  const hasTask = isDefined(task);

  const changeTask = hasTask ? task.isChangeable() : true;

  const showTagSelection = !hasTask && tags.length > 0;

  const tagId = showTagSelection ? first(tags).id : undefined;

  const uncontrolledData = {
    ...data,
    addTag,
    alterable,
    createAssetsApplyOverrides,
    autoDelete,
    autoDeleteReports,
    comment,
    configId,
    createAssets,
    maxConcurrentNvts,
    maxConcurrentHosts,
    createAssetsMinQod,
    name,
    scannerType,
    scannerId,
    tagId,
    tags,
    task,
  };

  const controlledData = {
    alertIds,
    configId,
    scheduleId,
    scannerId,
    scannerType,
    targetId,
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
        const ospConfigId = selectSaveId(
          sortedScanConfigs[SCAN_CONFIG_TYPE.osp],
          state.configId,
        );
        const openvasConfigId = selectSaveId(
          sortedScanConfigs[SCAN_CONFIG_TYPE.openvas],
          state.configId,
        );

        const isOspScanner = state.scannerType === OSP_SCANNER_TYPE;

        const useOpenvasScanConfig =
          state.scannerType === OPENVAS_SCANNER_TYPE ||
          state.scannerType === GREENBONE_SENSOR_SCANNER_TYPE;

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
                    changeTask
                      ? null
                      : _(
                          'This setting is not alterable once task has been run at least once.',
                        )
                  }
                >
                  <Select
                    name="targetId"
                    disabled={!changeTask}
                    items={targetItems}
                    isLoading={isLoadingTargets}
                    value={state.targetId}
                    width="260px"
                    onChange={onTargetChange}
                  />
                </div>
                {changeTask && (
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
                    name="alertIds"
                    items={alertItems}
                    isLoading={isLoadingAlerts}
                    value={state.alertIds}
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
                    name="scheduleId"
                    value={state.scheduleId}
                    items={scheduleItems}
                    isLoading={isLoadingSchedules}
                    width="201px"
                    onChange={onScheduleChange}
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
              createAssets={state.createAssets}
              onChange={onValueChange}
            />

            <FormGroup title={_('Apply Overrides')}>
              <YesNoRadio
                name="createAssetsApplyOverrides"
                disabled={!state.createAssets}
                value={state.createAssetsApplyOverrides}
                yesValue={true}
                noValue={false}
                convert={toBoolean}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Min QoD')}>
              <Spinner
                name="createAssetsMinQod"
                size="4"
                disabled={!state.createAssets}
                type="int"
                min="0"
                max="100"
                value={state.createAssetsMinQod}
                onChange={onValueChange}
              />
              <Layout>%</Layout>
            </FormGroup>

            {changeTask && (
              <FormGroup title={_('Alterable Task')}>
                <YesNoRadio
                  name="alterable"
                  disabled={task && !task.isNew()}
                  yesValue={true}
                  noValue={false}
                  convert={toBoolean}
                  value={state.alterable}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            <AutoDeleteReportsGroup
              autoDelete={state.autoDelete}
              autoDeleteReports={state.autoDeleteReports}
              onChange={onValueChange}
            />
            <div
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
                scannerId={state.scannerId}
                changeTask={changeTask}
                isLoading={isLoadingScanners}
                onChange={handleScannerChange}
              />
            </div>
            {useOpenvasScanConfig && (
              <Layout flex="column" grow="1">
                <FormGroup titleSize="2" title={_('Scan Config')}>
                  <div
                    title={
                      changeTask
                        ? null
                        : _(
                            'This setting is not alterable once task has been run at least once.',
                          )
                    }
                  >
                    <Select
                      name="configId"
                      disabled={!changeTask}
                      items={openvasScanConfigItems}
                      isLoading={isLoadingConfigs}
                      value={openvasConfigId}
                      onChange={value => {
                        onScanConfigChange(value);
                        setPrevConfigType(configType);
                      }}
                    />
                  </div>
                </FormGroup>
                <FormGroup
                  titleSize="4"
                  title={_('Maximum concurrently executed NVTs per host')}
                >
                  <Spinner
                    name="maxConcurrentNvts"
                    size="10"
                    min="0"
                    maxLength="10"
                    value={state.maxConcurrentNvts}
                    onChange={onValueChange}
                  />
                </FormGroup>
                <FormGroup
                  titleSize="4"
                  title={_('Maximum concurrently scanned hosts')}
                >
                  <Spinner
                    name="maxConcurrentHosts"
                    type="int"
                    min="0"
                    size="10"
                    maxLength="10"
                    value={state.maxConcurrentHosts}
                    onChange={onValueChange}
                  />
                </FormGroup>
              </Layout>
            )}

            {isOspScanner && (
              <FormGroup titleSize="2" title={_('Scan Config')}>
                <Select
                  name="configId"
                  items={ospScanConfigItems}
                  value={ospConfigId}
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
                        name="addTag"
                        checkedValue={true}
                        unCheckedValue={false}
                        checked={state.addTag}
                        onChange={onValueChange}
                      />
                      <Select
                        disabled={!state.addTag}
                        name="tagId"
                        items={tagItems}
                        isLoading={isLoadingTags}
                        value={state.tagId}
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
  addTag: PropTypes.yesno,
  alertIds: PropTypes.array,
  alerts: PropTypes.array,
  alterable: PropTypes.bool,
  autoDelete: PropTypes.bool,
  autoDeleteReports: PropTypes.number,
  comment: PropTypes.string,
  configId: PropTypes.idOrZero,
  createAssets: PropTypes.bool,
  createAssetsApplyOverrides: PropTypes.yesno,
  createAssetsMinQod: PropTypes.number,
  error: PropTypes.string,
  isLoadingAlerts: PropTypes.bool,
  isLoadingConfigs: PropTypes.bool,
  isLoadingScanners: PropTypes.bool,
  isLoadingSchedules: PropTypes.bool,
  isLoadingTags: PropTypes.bool,
  isLoadingTargets: PropTypes.bool,
  maxConcurrentHosts: PropTypes.number,
  maxConcurrentNvts: PropTypes.number,
  name: PropTypes.string,
  scanConfigs: PropTypes.arrayOf(PropTypes.model),
  scannerId: PropTypes.idOrZero,
  scanners: PropTypes.array,
  scheduleId: PropTypes.idOrZero,
  schedules: PropTypes.array,
  tagId: PropTypes.id,
  tags: PropTypes.array,
  targetId: PropTypes.idOrZero,
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
