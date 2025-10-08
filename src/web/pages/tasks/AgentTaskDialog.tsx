/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Task, {
  AUTO_DELETE_KEEP_DEFAULT_VALUE,
  AUTO_DELETE_NO,
  DEFAULT_MIN_QOD,
  TaskAutoDelete,
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
  alertIds: string[];
  scheduleId?: string;
  agentGroupId?: string;
}

interface AgentTaskDialogDefaultValues {
  addTag?: YesNo;
  alterable?: YesNo;
  applyOverrides?: YesNo;
  autoDelete?: TaskAutoDelete;
  autoDeleteData?: number;
  comment?: string;
  inAssets?: YesNo;
  minQod?: number;
  name: string;
  schedulePeriods?: YesNo;
  tagId?: string;
  tags?: RenderSelectItemProps[];
  task?: Task;
}

export type AgentTaskDialogData = AgentTaskDialogValues &
  AgentTaskDialogDefaultValues;

interface AgentTaskDialogProps {
  addTag?: YesNo;
  agentGroupId?: string;
  agentGroups?: RenderSelectItemProps[];
  alertIds?: string[];
  alerts?: RenderSelectItemProps[];
  alterable?: YesNo;
  applyOverrides?: YesNo;
  autoDelete?: TaskAutoDelete;
  autoDeleteData?: number;
  comment?: string;
  inAssets?: YesNo;
  isLoadingAlerts?: boolean;
  isLoadingScanners?: boolean;
  isLoadingSchedules?: boolean;
  isLoadingAgentGroups?: boolean;
  isLoadingTags?: boolean;
  minQod?: number;
  name?: string;
  scheduleId?: string;
  schedulePeriods?: YesNo;
  schedules?: RenderSelectItemProps[];
  tags?: RenderSelectItemProps[];
  task?: Task;
  title?: string;
  onAlertsChange?: (value: string[]) => void;
  onClose: () => void;
  onNewAlertClick?: () => void;
  onNewScheduleClick?: () => void;
  onNewAgentGroupClick?: () => void;
  onSave?: (data: AgentTaskDialogData) => void | Promise<void>;
  onScheduleChange?: (value: string) => void;
  onAgentGroupChange?: (value: string) => void;
}

const Title = styled.div`
  flex-grow: 1;
`;

const AgentTaskDialog = ({
  addTag = NO_VALUE,
  alertIds = [],
  alerts = [],
  alterable = NO_VALUE,
  applyOverrides = YES_VALUE,
  autoDelete = AUTO_DELETE_NO,
  autoDeleteData = AUTO_DELETE_KEEP_DEFAULT_VALUE,
  comment = '',
  inAssets = YES_VALUE,
  isLoadingAlerts = false,
  isLoadingSchedules = false,
  isLoadingAgentGroups = false,
  isLoadingTags = false,
  minQod = DEFAULT_MIN_QOD,
  name = '',
  scheduleId = UNSET_VALUE,
  schedulePeriods = NO_VALUE,
  schedules = [],
  tags = [],
  agentGroupId,
  agentGroups,
  task,
  title,
  onAlertsChange,
  onClose,
  onNewAlertClick,
  onNewScheduleClick,
  onNewAgentGroupClick,
  onSave,
  onScheduleChange,
  onAgentGroupChange,
}: AgentTaskDialogProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();

  name = name || _('Unnamed');
  title = title || _('New Agent Task');

  const tagItems = renderSelectItems(tags);
  const agentGroupItems = renderSelectItems(agentGroups);
  const scheduleItems = renderSelectItems(schedules, UNSET_VALUE);

  const alertIdList =
    alertIds.length === 1 && String(alertIds[0]) === '0' ? [] : alertIds;

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
    inAssets,
    minQod,
    name,
    schedulePeriods,
    tagId,
    tags,
    task,
  };

  const controlledData: AgentTaskDialogValues = {
    alertIds: alertIdList,
    scheduleId,
    agentGroupId,
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

            {capabilities.mayOp('get_agent_groups') &&
              capabilities.mayCreate('agentgroup') && (
                <FormGroup direction="row" title={_('Scan Agent Groups')}>
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
                      isLoading={isLoadingAgentGroups}
                      items={agentGroupItems}
                      name="agentGroupId"
                      value={state.agentGroupId}
                      onChange={onAgentGroupChange}
                    />
                  </Title>
                  {changeTask && (
                    <NewIcon
                      title={_('Create a new Agent Group')}
                      onClick={onNewAgentGroupClick}
                    />
                  )}
                </FormGroup>
              )}

            {capabilities.mayOp('get_alerts') &&
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

            {capabilities.mayOp('get_schedules') &&
              capabilities.mayCreate('schedule') && (
                <FormGroup direction="row" title={_('Schedule')}>
                  <Select
                    grow="1"
                    isLoading={isLoadingSchedules}
                    items={scheduleItems}
                    name="scheduleId"
                    value={state.scheduleId}
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
            {/* @ts-ignore */}
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

export default AgentTaskDialog;
