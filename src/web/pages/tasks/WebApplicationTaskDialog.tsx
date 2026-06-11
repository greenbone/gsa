/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ALL_FILTER} from 'gmp/models/filter';
import {WEB_APPLICATION_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';
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
import TextField from 'web/components/form/TextField';
import YesNoRadio from 'web/components/form/YesNoRadio';
import {NewIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
import {useGetWebApplicationTargets} from 'web/hooks/use-query/web-application-targets';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import AutoDeleteReportsGroup from 'web/pages/tasks/AutoDeleteReportsGroup';
import {
  type RenderSelectItemProps,
  renderSelectItems,
  UNSET_VALUE,
} from 'web/utils/Render';

interface WebApplicationTaskDialogValues {
  alertIds: string[];
  scheduleId?: string;
  webApplicationTargetId?: string;
  scannerId?: string;
}

interface WebApplicationTaskDialogDefaultValues {
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
}

export type WebApplicationTaskDialogData = WebApplicationTaskDialogValues &
  WebApplicationTaskDialogDefaultValues;

interface WebApplicationTaskDialogProps {
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
  webApplicationTargetId?: string;
  scannerId?: string;
  scheduleId?: string;
  schedulePeriods?: boolean;
  schedules?: RenderSelectItemProps[];
  tags?: RenderSelectItemProps[];
  task?: Task;
  title?: string;
  onAlertsChange?: (value: string[]) => void;
  onClose: () => void | Promise<void>;
  onNewAlertClick?: () => void;
  onNewWebApplicationTargetClick?: () => void;
  onNewScheduleClick?: () => void;
  onWebApplicationTargetChange?: (value: string) => void;
  onSave: (data: WebApplicationTaskDialogData) => void | Promise<void>;
  onScheduleChange?: (value: string) => void;
  onScannerChange?: (value: string) => void;
}

const WebApplicationTaskDialog = ({
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
  webApplicationTargetId = UNSET_VALUE,
  scannerId = WEB_APPLICATION_DEFAULT_SCANNER_ID,
  scheduleId = UNSET_VALUE,
  schedulePeriods = false,
  schedules = [],
  tags = [],
  task,
  title,
  onAlertsChange,
  onClose,
  onNewAlertClick,
  onNewWebApplicationTargetClick,
  onNewScheduleClick,
  onWebApplicationTargetChange,
  onSave,
  onScheduleChange,
  onScannerChange,
}: WebApplicationTaskDialogProps) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  const isEdit = isDefined(task);

  const {
    data: webApplicationTargetsData,
    isLoading: isWebApplicationTargetsLoading,
  } = useGetWebApplicationTargets({
    filter: ALL_FILTER,
  });

  title = title || _('New Web Application Task');

  const tagItems = renderSelectItems(tags);
  const scheduleItems = renderSelectItems(schedules, UNSET_VALUE);

  const webApplicationTargetRenderItems: RenderSelectItemProps[] =
    webApplicationTargetsData?.entities?.map(target => ({
      id: target.id || '',
      name: target.name || target.id || 'Unnamed',
    })) || [];

  const webApplicationTargetItems = renderSelectItems(
    webApplicationTargetRenderItems,
    UNSET_VALUE,
  );

  const alertIdList =
    alertIds.length === 1 && String(alertIds[0]) === '0' ? [] : alertIds;

  const alertItems = renderSelectItems(alerts);

  const scannerItems = renderSelectItems([
    {
      id: WEB_APPLICATION_DEFAULT_SCANNER_ID,
      name: 'Web Application Scanner',
    },
  ]);

  const hasTask = isDefined(task);

  const changeTask = hasTask ? task.isChangeable() : true;

  const showTagSelection = !hasTask && tags.length > 0;

  const tagId = showTagSelection
    ? first<RenderSelectItemProps, {id: undefined}>(tags).id
    : undefined;

  const uncontrolledData: WebApplicationTaskDialogDefaultValues = {
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
  };

  const controlledData: WebApplicationTaskDialogValues = {
    alertIds: alertIdList,
    scheduleId,
    webApplicationTargetId,
    scannerId,
  };

  return (
    <SaveDialog<
      WebApplicationTaskDialogValues,
      WebApplicationTaskDialogDefaultValues
    >
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

            <FormGroup direction="row" title={_('Web Application Target')}>
              <Select
                data-testid="web-application-target-select"
                disabled={!changeTask}
                grow="1"
                isLoading={isWebApplicationTargetsLoading}
                items={webApplicationTargetItems}
                name="webApplicationTargetId"
                value={state.webApplicationTargetId}
                onChange={onWebApplicationTargetChange}
              />
              {changeTask && capabilities.mayAccess('webapplicationtarget') && (
                <NewIcon
                  title={_('Create a new web application target')}
                  onClick={onNewWebApplicationTargetClick}
                />
              )}
            </FormGroup>

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

            {capabilities.mayAccess('tag') &&
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
          </>
        );
      }}
    </SaveDialog>
  );
};

export default WebApplicationTaskDialog;
