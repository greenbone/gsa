/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import ScanConfig from 'gmp/models/scanconfig';
import Scanner, {
  OPENVAS_SCANNER_TYPE,
  OPENVAS_DEFAULT_SCANNER_ID,
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

interface AgentTaskDialogValues {
  alert_ids: string[];
  configId?: string;
  schedule_id?: string;
  scannerId?: string;
  scanner_type?: ScannerType;
  target_id?: string;
}

interface AgentTaskDialogDefaultValues {
  addTag?: YesNo;
  alterable?: YesNo;
  applyOverrides?: YesNo;
  autoDelete?: TaskAutoDelete;
  autoDeleteData?: number;
  comment?: string;
  configId?: string;
  hostsOrdering?: TaskHostsOrdering;
  inAssets?: YesNo;
  maxChecks?: number;
  maxHosts?: number;
  minQod?: number;
  name: string;
  schedulePeriods?: YesNo;
  tag_id?: string;
  tags?: RenderSelectItemProps[];
  task?: Task;
}

export type AgentTaskDialogData = AgentTaskDialogValues &
  AgentTaskDialogDefaultValues;

interface AgentTaskDialogProps {
  addTag?: YesNo;
  alert_ids?: string[];
  alerts?: RenderSelectItemProps[];
  alterable?: YesNo;
  applyOverrides?: YesNo;
  autoDelete?: TaskAutoDelete;
  autoDeleteData?: number;
  comment?: string;
  configId?: string;
  hostsOrdering?: TaskHostsOrdering;
  inAssets?: YesNo;
  isLoadingAlerts?: boolean;
  isLoadingConfigs?: boolean;
  isLoadingScanners?: boolean;
  isLoadingSchedules?: boolean;
  isLoadingTargets?: boolean;
  isLoadingTags?: boolean;
  maxChecks?: number;
  maxHosts?: number;
  minQod?: number;
  name?: string;
  scanConfigs?: ScanConfig[];
  scannerId?: string;
  scanners?: Scanner[];
  schedule_id?: string;
  schedulePeriods?: YesNo;
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
  onSave?: (data: AgentTaskDialogData) => void | Promise<void>;
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

const getScanner = (scanners: Scanner[] | undefined, scanConfigs: string) => {
  if (!isDefined(scanners)) {
    return undefined;
  }

  return scanners.find(scanner => {
    return scanner.id === scanConfigs;
  });
};

const AgentTaskDialog = ({
  addTag = NO_VALUE,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  alert_ids = [],
  alerts = [],
  alterable = NO_VALUE,
  applyOverrides = YES_VALUE,
  autoDelete = AUTO_DELETE_NO,
  autoDeleteData = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  comment = '',
  configId,
  hostsOrdering = HOSTS_ORDERING_SEQUENTIAL,
  inAssets = YES_VALUE,
  isLoadingAlerts = false,
  isLoadingSchedules = false,
  isLoadingTargets = false,
  isLoadingTags = false,
  maxChecks = DEFAULT_MAX_CHECKS,
  maxHosts = DEFAULT_MAX_HOSTS,
  minQod = DEFAULT_MIN_QOD,
  name = '',
  scanConfigs = [],
  scannerId = OPENVAS_DEFAULT_SCANNER_ID,
  scanners = [DEFAULT_SCANNER],
  // eslint-disable-next-line @typescript-eslint/naming-convention
  schedule_id = UNSET_VALUE,
  schedulePeriods = NO_VALUE,
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
  onScheduleChange,
  onTargetChange,
}: AgentTaskDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();

  name = name || _('Unnamed');
  title = title || _('New Agent Task');

  const scanner = getScanner(scanners, scannerId);
  const scannerType = isDefined(scanner) ? scanner.scannerType : undefined;

  const tagItems = renderSelectItems(tags);
  const targetItems = renderSelectItems(targets);
  const scheduleItems = renderSelectItems(schedules, UNSET_VALUE);

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

  const uncontrolledData: AgentTaskDialogDefaultValues = {
    addTag,
    alterable,
    applyOverrides,
    autoDelete,
    autoDeleteData,
    comment,
    configId,
    hostsOrdering,
    inAssets,
    maxChecks,
    maxHosts,
    minQod,
    name,
    schedulePeriods,
    tag_id: tagId,
    tags,
    task,
  };

  const controlledData: AgentTaskDialogValues = {
    alert_ids: alertIds,
    configId,
    schedule_id,
    scannerId,
    scanner_type: scannerType,
    target_id,
  };

  return (
    <SaveDialog<AgentTaskDialogValues, AgentTaskDialogDefaultValues>
      defaultValues={uncontrolledData}
      title={title}
      values={controlledData}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
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
                  checked={state.schedulePeriods === YES_VALUE}
                  checkedValue={YES_VALUE}
                  name="schedulePeriods"
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
              inAssets={state.inAssets}
              onChange={onValueChange}
            />

            <FormGroup title={_('Apply Overrides')}>
              <YesNoRadio
                disabled={state.inAssets !== YES_VALUE}
                name="applyOverrides"
                value={state.applyOverrides}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Min QoD')}>
              <Spinner
                disabled={state.inAssets !== YES_VALUE}
                max={100}
                min={0}
                name="minQod"
                type="int"
                value={state.minQod}
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
              autoDelete={state.autoDelete}
              autoDeleteData={state.autoDeleteData}
              onChange={onValueChange}
            />

            {capabilities.mayAccess('tags') &&
              capabilities.mayCreate('tag') &&
              showTagSelection && (
                <FormGroup title={_('Tag')}>
                  <Divider>
                    <Checkbox
                      checked={state.addTag === YES_VALUE}
                      checkedValue={YES_VALUE}
                      name="addTag"
                      title={_('Add:')}
                      unCheckedValue={NO_VALUE}
                      onChange={onValueChange}
                    />
                    <Select
                      disabled={state.addTag !== YES_VALUE}
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

export default AgentTaskDialog;
