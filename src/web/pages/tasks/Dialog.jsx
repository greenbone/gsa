/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {
  OPENVAS_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
  OPENVASD_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
} from 'gmp/models/scanner';
import {
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  AUTO_DELETE_NO,
  DEFAULT_MAX_CHECKS,
  DEFAULT_MAX_HOSTS,
  DEFAULT_MIN_QOD,
} from 'gmp/models/task';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import {first} from 'gmp/utils/array';
import {selectSaveId} from 'gmp/utils/id';
import {isDefined} from 'gmp/utils/identity';
import SaveDialog from 'web/components/dialog/SaveDialog';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import MultiSelect from 'web/components/form/MultiSelect';
import Select from 'web/components/form/Select';
import Spinner from 'web/components/form/Spinner';
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import {NewIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import useTranslation from 'web/hooks/useTranslation';
import AddResultsToAssetsGroup from 'web/pages/tasks/AddResultsToAssetsGroup';
import AutoDeleteReportsGroup from 'web/pages/tasks/AutoDeleteReportsGroup';
import PropTypes from 'web/utils/PropTypes';
import {renderSelectItems, UNSET_VALUE} from 'web/utils/Render';
import withCapabilities from 'web/utils/withCapabilities';
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
        disabled={!changeTask}
        isLoading={isLoading}
        items={renderSelectItems(scanners)}
        name="scanner_id"
        value={scannerId}
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

  const alertIds =
    alert_ids.length === 1 && alert_ids[0] === 0 ? [] : alert_ids;

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
    alert_ids: alertIds,
    config_id,
    schedule_id,
    scanner_id,
    scanner_type: scannerType,
    target_id,
  };

  return (
    <SaveDialog
      defaultValues={uncontrolledData}
      title={title}
      values={controlledData}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        const openvasConfigId = selectSaveId(scan_configs, state.config_id);

        const useOpenvasScanConfig =
          state.scanner_type === OPENVAS_SCANNER_TYPE ||
          state.scanner_type === GREENBONE_SENSOR_SCANNER_TYPE ||
          state.scanner_type === OPENVASD_SCANNER_TYPE;

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

            <FormGroup direction="row" title={_('Scan Targets')}>
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
                  disabled={!changeTask}
                  isLoading={isLoadingTargets}
                  items={targetItems}
                  name="target_id"
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
              <FormGroup direction="row" title={_('Alerts')}>
                <MultiSelect
                  grow="1"
                  isLoading={isLoadingAlerts}
                  items={alertItems}
                  name="alert_ids"
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
              <FormGroup direction="row" title={_('Schedule')}>
                <Select
                  grow="1"
                  isLoading={isLoadingSchedules}
                  items={scheduleItems}
                  name="schedule_id"
                  value={state.schedule_id}
                  onChange={onScheduleChange}
                />
                <Checkbox
                  checked={state.schedule_periods === YES_VALUE}
                  checkedValue={YES_VALUE}
                  name="schedule_periods"
                  title={_('Once')}
                  unCheckedValue={NO_VALUE}
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
                disabled={state.in_assets !== YES_VALUE}
                name="apply_overrides"
                value={state.apply_overrides}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Min QoD')}>
              <Spinner
                disabled={state.in_assets !== YES_VALUE}
                max="100"
                min="0"
                name="min_qod"
                postfix="%"
                type="int"
                value={state.min_qod}
                onChange={onValueChange}
              />
            </FormGroup>

            {changeTask && (
              <FormGroup title={_('Alterable Task')}>
                <YesNoRadio
                  disabled={task && !task.isNew()}
                  name="alterable"
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
                changeTask={changeTask}
                isLoading={isLoadingScanners}
                scannerId={state.scanner_id}
                scanners={scanners}
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
                      disabled={!changeTask}
                      isLoading={isLoadingConfigs}
                      items={openvasScanConfigItems}
                      name="config_id"
                      value={openvasConfigId}
                      onChange={value => {
                        onScanConfigChange(value);
                      }}
                    />
                  </Title>
                </FormGroup>
                <FormGroup title={_('Order for target hosts')}>
                  <Select
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
                    name="hosts_ordering"
                    value={state.hosts_ordering}
                    onChange={onValueChange}
                  />
                </FormGroup>
                <FormGroup
                  title={_('Maximum concurrently executed NVTs per host')}
                >
                  <Spinner
                    min="0"
                    name="max_checks"
                    value={state.max_checks}
                    onChange={onValueChange}
                  />
                </FormGroup>
                <FormGroup title={_('Maximum concurrently scanned hosts')}>
                  <Spinner
                    min="0"
                    name="max_hosts"
                    type="int"
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
                      checked={state.add_tag === YES_VALUE}
                      checkedValue={YES_VALUE}
                      name="add_tag"
                      title={_('Add:')}
                      unCheckedValue={NO_VALUE}
                      onChange={onValueChange}
                    />
                    <Select
                      disabled={state.add_tag !== YES_VALUE}
                      grow="1"
                      isLoading={isLoadingTags}
                      items={tagItems}
                      name="tag_id"
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
