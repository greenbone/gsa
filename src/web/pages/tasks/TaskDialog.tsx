/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import ScanConfig from 'gmp/models/scanconfig';
import Scanner, {
  OPENVAS_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
  OPENVASD_SCANNER_TYPE,
  GREENBONE_SENSOR_SCANNER_TYPE,
  OPENVASD_SENSOR_SCANNER_TYPE,
  ScannerType,
} from 'gmp/models/scanner';
import Task, {
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  HOSTS_ORDERING_SEQUENTIAL,
  AUTO_DELETE_NO,
  DEFAULT_MAX_CHECKS,
  DEFAULT_MAX_HOSTS,
  DEFAULT_MIN_QOD,
  TaskAutoDelete,
  TaskHostsOrdering,
} from 'gmp/models/task';
import {NO_VALUE, YES_VALUE, YesNo} from 'gmp/parser';
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
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import AddResultsToAssetsGroup from 'web/pages/tasks/AddResultsToAssetsGroup';
import AutoDeleteReportsGroup from 'web/pages/tasks/AutoDeleteReportsGroup';
import {
  RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';

interface ScannerSelectProps {
  changeTask?: boolean;
  isLoading?: boolean;
  scannerId?: string;
  scanners?: Scanner[];
  onChange?: (value: string) => void;
}

interface TaskDialogValues {
  alert_ids: string[];
  config_id?: string;
  schedule_id?: string;
  scanner_id?: string;
  scanner_type?: ScannerType;
  target_id?: string;
}

interface TaskDialogDefaultValues {
  add_tag?: YesNo;
  alterable?: YesNo;
  apply_overrides?: YesNo;
  auto_delete?: TaskAutoDelete;
  auto_delete_data?: number;
  comment?: string;
  config_id?: string;
  hosts_ordering?: TaskHostsOrdering;
  in_assets?: YesNo;
  max_checks?: number;
  max_hosts?: number;
  min_qod?: number;
  name: string;
  schedule_periods?: YesNo;
  tag_id?: string;
  tags?: RenderSelectItemProps[];
  task?: Task;
}

export type TaskDialogData = TaskDialogValues & TaskDialogDefaultValues;

interface TaskDialogProps {
  add_tag?: YesNo;
  alert_ids?: string[];
  alerts?: RenderSelectItemProps[];
  alterable?: YesNo;
  apply_overrides?: YesNo;
  auto_delete?: TaskAutoDelete;
  auto_delete_data?: number;
  comment?: string;
  config_id?: string;
  hosts_ordering?: TaskHostsOrdering;
  in_assets?: YesNo;
  isLoadingAlerts?: boolean;
  isLoadingConfigs?: boolean;
  isLoadingScanners?: boolean;
  isLoadingSchedules?: boolean;
  isLoadingTargets?: boolean;
  isLoadingTags?: boolean;
  max_checks?: number;
  max_hosts?: number;
  min_qod?: number;
  name?: string;
  scan_configs?: ScanConfig[];
  scanner_id?: string;
  scanners?: Scanner[];
  schedule_id?: string;
  schedule_periods?: YesNo;
  schedules?: RenderSelectItemProps[];
  tags?: RenderSelectItemProps[];
  target_id?: string;
  targets?: RenderSelectItemProps[];
  task?: Task;
  title?: string;
  onAlertsChange?: (value: string[]) => void;
  onClose: () => void;
  onNewAlertClick?: () => void;
  onNewScheduleClick?: () => void;
  onNewTargetClick?: () => void;
  onSave?: (data: TaskDialogData) => void | Promise<void>;
  onScanConfigChange?: (value: string) => void;
  onScannerChange?: (value: string) => void;
  onScheduleChange?: (value: string) => void;
  onTargetChange?: (value: string) => void;
}

const Title = styled.div`
  flex-grow: 1;
`;

const DEFAULT_SCANNER = new Scanner({
  id: OPENVAS_DEFAULT_SCANNER_ID,
  scannerType: OPENVAS_SCANNER_TYPE,
});

const getScanner = (scanners: Scanner[] | undefined, scannerId: string) => {
  if (!isDefined(scanners)) {
    return undefined;
  }

  return scanners.find(scanner => {
    return scanner.id === scannerId;
  });
};

const ScannerSelect = ({
  changeTask,
  isLoading,
  scannerId,
  scanners,
  onChange,
}: ScannerSelectProps) => {
  const [_] = useTranslation();
  return (
    <FormGroup title={_('Scanner')}>
      <Select
        disabled={!changeTask}
        isLoading={isLoading}
        items={renderSelectItems(scanners as RenderSelectItemProps[])}
        name="scanner_id"
        value={scannerId}
        onChange={onChange}
      />
    </FormGroup>
  );
};

const TaskDialog = ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  add_tag = NO_VALUE,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  alert_ids = [],
  alerts = [],
  alterable = NO_VALUE,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  apply_overrides = YES_VALUE,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  auto_delete = AUTO_DELETE_NO,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  auto_delete_data = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  comment = '',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  config_id,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  hosts_ordering = HOSTS_ORDERING_SEQUENTIAL,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  in_assets = YES_VALUE,
  isLoadingAlerts = false,
  isLoadingConfigs = false,
  isLoadingScanners = false,
  isLoadingSchedules = false,
  isLoadingTargets = false,
  isLoadingTags = false,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  max_checks = DEFAULT_MAX_CHECKS,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  max_hosts = DEFAULT_MAX_HOSTS,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  min_qod = DEFAULT_MIN_QOD,
  name = '',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  scan_configs = [],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  scanner_id = OPENVAS_DEFAULT_SCANNER_ID,
  scanners = [DEFAULT_SCANNER],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  schedule_id = UNSET_VALUE,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  schedule_periods = NO_VALUE,
  schedules = [],
  tags = [],
  // eslint-disable-next-line @typescript-eslint/naming-convention
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
}: TaskDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();

  name = name || _('Unnamed');
  title = title || _('New Task');

  const scanner = getScanner(scanners, scanner_id);
  const scannerType = isDefined(scanner) ? scanner.scannerType : undefined;

  const tagItems = renderSelectItems(tags);
  const targetItems = renderSelectItems(targets);
  const scheduleItems = renderSelectItems(schedules, UNSET_VALUE);
  const openvasScanConfigItems = renderSelectItems(
    scan_configs as RenderSelectItemProps[],
  );

  const alertIds =
    alert_ids.length === 1 && String(alert_ids[0]) === '0' ? [] : alert_ids;

  const alertItems = renderSelectItems(alerts);

  // having a task means we are editing a task
  const hasTask = isDefined(task);

  const changeTask = hasTask ? task.isChangeable() : true;

  const showTagSelection = !hasTask && tags.length > 0;

  const tagId = showTagSelection
    ? first<RenderSelectItemProps, {id: undefined}>(tags).id
    : undefined;

  const uncontrolledData: TaskDialogDefaultValues = {
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
    schedule_periods,
    tag_id: tagId,
    tags,
    task,
  };

  const controlledData: TaskDialogValues = {
    alert_ids: alertIds,
    config_id,
    schedule_id,
    scanner_id,
    scanner_type: scannerType,
    target_id,
  };

  return (
    <SaveDialog<TaskDialogValues, TaskDialogDefaultValues>
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
          state.scanner_type === OPENVASD_SCANNER_TYPE ||
          state.scanner_type === OPENVASD_SENSOR_SCANNER_TYPE;

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
                    ? undefined
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
                max={100}
                min={0}
                name="min_qod"
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
                  ? undefined
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
                        ? undefined
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
                        isDefined(onScanConfigChange) &&
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
                    min={0}
                    name="max_checks"
                    value={state.max_checks}
                    onChange={onValueChange}
                  />
                </FormGroup>
                <FormGroup title={_('Maximum concurrently scanned hosts')}>
                  <Spinner
                    min={0}
                    name="max_hosts"
                    type="int"
                    value={state.max_hosts}
                    onChange={onValueChange}
                  />
                </FormGroup>
              </>
            )}

            {capabilities.mayAccess('tag') &&
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

export default TaskDialog;
