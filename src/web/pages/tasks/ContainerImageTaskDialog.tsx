/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  CONTAINER_IMAGE_TASK_SCANNER_ID,
  CONTAINER_IMAGE_SCANNER_TYPE,
  type ContainerImageScannerType,
} from 'gmp/models/scanner';
import {
  type default as Task,
  type TaskAutoDelete,
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  AUTO_DELETE_NO,
  DEFAULT_MIN_QOD,
} from 'gmp/models/task';
import {parseBoolean} from 'gmp/parser';
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
import {useGetOciImageTargets} from 'web/hooks/use-query/oci-image-targets';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import AutoDeleteReportsGroup from 'web/pages/tasks/AutoDeleteReportsGroup';
import {
  type RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';

interface ContainerImageTaskDialogValues {
  alertIds: string[];
  scheduleId?: string;
  ociImageTargetId?: string;
  scannerId?: string;
}

interface ContainerImageTaskDialogState {
  addTag?: boolean;
  alterable?: boolean;
  applyOverrides?: boolean;
  autoDelete?: TaskAutoDelete;
  autoDeleteData?: number;
  comment: string;
  inAssets: boolean;
  minQod?: number;
  name: string;
  schedulePeriods?: boolean;
  tagId?: string;
  tags?: RenderSelectItemProps[];
  task?: Task;
  id?: string;
  acceptInvalidCerts?: boolean;
  registryAllowInsecure?: boolean;
  scannerType?: ContainerImageScannerType;
}

export type ContainerImageTaskDialogData = ContainerImageTaskDialogValues &
  ContainerImageTaskDialogState;

interface ContainerImageTaskDialogProps {
  addTag?: boolean;
  alertIds?: string[];
  alerts?: RenderSelectItemProps[];
  alterable?: boolean;
  applyOverrides?: boolean;
  autoDelete?: TaskAutoDelete;
  autoDeleteData?: number;
  comment?: string;
  inAssets?: boolean;
  isLoadingAlerts?: boolean;
  isLoadingSchedules?: boolean;
  isLoadingTags?: boolean;
  minQod?: number;
  name?: string;
  ociImageTargetId?: string;
  scannerId?: string;
  scheduleId?: string;
  schedulePeriods?: boolean;
  schedules?: RenderSelectItemProps[];
  tags?: RenderSelectItemProps[];
  task?: Task;
  title?: string;
  acceptInvalidCerts?: boolean;
  registryAllowInsecure?: boolean;
  onAlertsChange?: (value: string[]) => void;
  onClose: () => void | Promise<void>;
  onNewAlertClick?: () => void;
  onNewScheduleClick?: () => void;
  onOciImageTargetChange?: (value: string) => void;
  onSave: (data: ContainerImageTaskDialogData) => void | Promise<void>;
  onScheduleChange?: (value: string) => void;
  onScannerChange?: (value: string) => void;
}

const ContainerImageTaskDialog = ({
  addTag = false,
  alertIds = [],
  alerts = [],
  alterable = false,
  applyOverrides = true,
  autoDelete = AUTO_DELETE_NO,
  autoDeleteData = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  comment = '',
  inAssets = true,
  isLoadingAlerts = false,
  isLoadingSchedules = false,
  isLoadingTags = false,
  minQod = DEFAULT_MIN_QOD,
  name = '',
  ociImageTargetId = UNSET_VALUE,
  scannerId = CONTAINER_IMAGE_TASK_SCANNER_ID,
  scheduleId = UNSET_VALUE,
  schedulePeriods = false,
  schedules = [],
  tags = [],
  task,
  title,
  acceptInvalidCerts = true,
  registryAllowInsecure = false,
  onAlertsChange,
  onClose,
  onNewAlertClick,
  onNewScheduleClick,
  onOciImageTargetChange,
  onSave,
  onScheduleChange,
  onScannerChange,
}: ContainerImageTaskDialogProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const isEdit = isDefined(task);

  const {data: ociImageTargetsData, isLoading: isOciImageTargetsLoading} =
    useGetOciImageTargets({});

  title = title || _('New Container Image Task');

  const tagItems = renderSelectItems(tags);
  const scheduleItems = renderSelectItems(schedules, UNSET_VALUE);

  const ociImageTargetRenderItems: RenderSelectItemProps[] =
    ociImageTargetsData?.entities?.map(target => ({
      id: target.id || '',
      name: target.name || target.id || 'Unnamed',
    })) || [];

  const ociImageTargetItems = renderSelectItems(
    ociImageTargetRenderItems,
    UNSET_VALUE,
  );

  const alertIdList =
    alertIds.length === 1 && String(alertIds[0]) === '0' ? [] : alertIds;

  const alertItems = renderSelectItems(alerts);

  const scannerItems = renderSelectItems([
    {
      id: CONTAINER_IMAGE_TASK_SCANNER_ID,
      name: 'Container Image Scanner',
    },
  ]);

  const hasTask = isDefined(task);

  const changeTask = hasTask ? task.isChangeable() : true;

  const showTagSelection = !hasTask && tags.length > 0;

  const tagId = showTagSelection
    ? first<RenderSelectItemProps, {id: undefined}>(tags).id
    : undefined;

  const uncontrolledData: ContainerImageTaskDialogState = {
    addTag,
    alterable,
    applyOverrides,
    autoDelete,
    autoDeleteData,
    comment,
    inAssets,
    minQod,
    name,
    schedulePeriods,
    tagId,
    tags,
    task,
    id: isEdit ? task.id : undefined,
    acceptInvalidCerts,
    registryAllowInsecure,
    scannerType: CONTAINER_IMAGE_SCANNER_TYPE,
  };

  const controlledData: ContainerImageTaskDialogValues = {
    alertIds: alertIdList,
    scheduleId,
    ociImageTargetId,
    scannerId,
  };

  return (
    <SaveDialog<ContainerImageTaskDialogValues, ContainerImageTaskDialogState>
      defaultValues={uncontrolledData}
      title={title}
      values={controlledData}
      onClose={onClose}
      onSave={onSave}
    >
      {({values: state, onValueChange}) => {
        return (
          <>
            <TextField
              name="name"
              title={_('Name')}
              value={state.name}
              onChange={onValueChange}
            />

            <TextField
              name="comment"
              title={_('Comment')}
              value={state.comment}
              onChange={onValueChange}
            />

            {capabilities.mayAccess('alert') &&
              capabilities.mayCreate('alert') && (
                <FormGroup direction="row" title={_('Alerts')}>
                  <MultiSelect
                    grow="1"
                    isLoading={isLoadingAlerts}
                    items={alertItems}
                    name="alertIds"
                    value={state.alertIds}
                    onChange={onAlertsChange}
                  />
                  <NewIcon
                    title={_('Create a new alert')}
                    onClick={onNewAlertClick}
                  />
                </FormGroup>
              )}

            {capabilities.mayAccess('schedule') &&
              capabilities.mayCreate('schedule') && (
                <FormGroup
                  data-testid="schedule-group"
                  direction="row"
                  title={_('Schedule')}
                >
                  <Select
                    data-testid="schedule-select"
                    grow="1"
                    isLoading={isLoadingSchedules}
                    items={scheduleItems}
                    name="scheduleId"
                    value={state.scheduleId}
                    onChange={onScheduleChange}
                  />
                  <Checkbox
                    checked={state.schedulePeriods === true}
                    checkedValue={true}
                    name="schedulePeriods"
                    title={_('Once')}
                    unCheckedValue={false}
                    onChange={onValueChange}
                  />
                  <NewIcon
                    title={_('Create a new schedule')}
                    onClick={onNewScheduleClick}
                  />
                </FormGroup>
              )}

            <FormGroup title={_('Add results to Assets')}>
              <YesNoRadio
                convert={parseBoolean}
                name="inAssets"
                noValue={false}
                value={state.inAssets}
                yesValue={true}
                onChange={onValueChange}
              />
            </FormGroup>
            <FormGroup title={_('Apply Overrides')}>
              <YesNoRadio
                convert={parseBoolean}
                disabled={!state.inAssets}
                name="applyOverrides"
                noValue={false}
                value={state.applyOverrides}
                yesValue={true}
                onChange={onValueChange}
              />
            </FormGroup>

            <FormGroup title={_('Min QoD')}>
              <Spinner
                disabled={!state.inAssets}
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
                  convert={parseBoolean}
                  disabled={task && !task.isNew()}
                  name="alterable"
                  noValue={false}
                  value={state.alterable}
                  yesValue={true}
                  onChange={onValueChange}
                />
              </FormGroup>
            )}

            <AutoDeleteReportsGroup
              autoDelete={state.autoDelete}
              autoDeleteData={state.autoDeleteData}
              onChange={onValueChange}
            />

            <Select
              disabled={true}
              grow="1"
              isLoading={false}
              items={scannerItems}
              label={_('Scanner')}
              name="scannerId"
              value={state.scannerId}
              onChange={onScannerChange}
            />

            <Select
              data-testid="oci-image-target-select"
              grow="1"
              isLoading={isOciImageTargetsLoading}
              items={ociImageTargetItems}
              label={_('Container Image Target')}
              name="ociImageTargetId"
              value={state.ociImageTargetId}
              onChange={onOciImageTargetChange}
            />

            {/* @ts-ignore */}
            {capabilities.mayAccess('tags') &&
              capabilities.mayCreate('tag') &&
              showTagSelection && (
                <FormGroup title={_('Tag')}>
                  <Divider>
                    <Checkbox
                      checked={state.addTag === true}
                      checkedValue={true}
                      name="addTag"
                      title={_('Add:')}
                      unCheckedValue={false}
                      onChange={onValueChange}
                    />
                    <Select
                      data-testid="tag-select"
                      disabled={state.addTag !== true}
                      grow="1"
                      isLoading={isLoadingTags}
                      items={tagItems}
                      name="tagId"
                      value={state.tagId}
                      onChange={onValueChange}
                    />
                  </Divider>
                </FormGroup>
              )}

            <FormGroup title={_('Override Default Scanner Preferences')}>
              <Checkbox
                checked={state.acceptInvalidCerts ?? true}
                checkedValue={true}
                name="acceptInvalidCerts"
                title={_('Accept Invalid Certificates')}
                unCheckedValue={false}
                onChange={onValueChange}
              />
              <Checkbox
                checked={state.registryAllowInsecure ?? false}
                checkedValue={true}
                name="registryAllowInsecure"
                title={_('Allow Insecure Registry')}
                unCheckedValue={false}
                onChange={onValueChange}
              />
            </FormGroup>
          </>
        );
      }}
    </SaveDialog>
  );
};

export default ContainerImageTaskDialog;
