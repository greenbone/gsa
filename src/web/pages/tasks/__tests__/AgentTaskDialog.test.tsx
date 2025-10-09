/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {
  rendererWith,
  fireEvent,
  getSelectItemElementsForSelect,
  screen,
} from 'web/testing';
import Task, {TASK_STATUS} from 'gmp/models/task';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import AgentTaskDialog from 'web/pages/tasks/AgentTaskDialog';

describe('AgentTaskDialog component tests', () => {
  const gmp = {settings: {}};

  const agentGroups = [
    {id: 'ag-1', name: 'Group A'},
    {id: 'ag-2', name: 'Group B'},
  ];
  const alerts = [
    {id: 'al-1', name: 'Alert 1'},
    {id: 'al-2', name: 'Alert 2'},
  ];
  const schedules = [{id: 'sc-1', name: 'Daily 09:00'}];
  const tags = [{id: 'tg-1', name: 'Important'}];

  const commonHandlers = () => ({
    onClose: testing.fn(),
    onSave: testing.fn(),
    onAlertsChange: testing.fn(),
    onNewAlertClick: testing.fn(),
    onNewScheduleClick: testing.fn(),
    onNewAgentGroupClick: testing.fn(),
    onScheduleChange: testing.fn(),
    onAgentGroupChange: testing.fn(),
  });

  const renderDialog = (
    props: Partial<React.ComponentProps<typeof AgentTaskDialog>> = {},
  ) =>
    rendererWith({gmp, capabilities: true}).render(
      <AgentTaskDialog
        addTag={NO_VALUE}
        agentGroups={agentGroups}
        alerts={alerts}
        alterable={NO_VALUE}
        applyOverrides={YES_VALUE}
        comment=""
        inAssets={YES_VALUE}
        minQod={70}
        name=""
        schedules={schedules}
        tags={tags}
        {...commonHandlers()}
        {...props}
      />,
    );

  test('should render defaults (title, name fallback)', async () => {
    renderDialog();

    expect(screen.getDialogTitle()).toHaveTextContent('New Agent Task');

    expect(screen.getByName('name')).toHaveValue('Unnamed');

    expect(screen.getByName('comment')).toBeInTheDocument();
    expect(screen.getByName('applyOverrides')).toBeInTheDocument();
    expect(screen.getByName('minQod')).toBeInTheDocument();
  });

  test('should list agent groups and call onAgentGroupChange when selected', async () => {
    const {onAgentGroupChange} = commonHandlers();
    renderDialog({onAgentGroupChange});

    const agentGroupSelect = screen.getByName('agentGroupId');
    fireEvent.click(agentGroupSelect);

    //@ts-expect-error
    const items = await getSelectItemElementsForSelect(agentGroupSelect);
    expect(items[0]).toHaveTextContent('Group A');
    fireEvent.click(items[0]);

    expect(onAgentGroupChange).toHaveBeenCalledWith('ag-1', 'agentGroupId');
  });

  test('shows Tag selector in create mode (no task)', () => {
    renderDialog();
    expect(screen.getByName('addTag')).toBeInTheDocument();
    expect(screen.getByName('tagId')).toBeInTheDocument();
  });

  test('hides Tag selector in edit mode (task provided)', () => {
    const task = new Task({status: TASK_STATUS.new, alterable: YES_VALUE});
    renderDialog({task});
    expect(screen.queryByName('addTag')).toBeNull();
    expect(screen.queryByName('tagId')).toBeNull();
  });

  test('should list schedules and toggle "Once" checkbox', async () => {
    const {onScheduleChange} = commonHandlers();
    renderDialog({onScheduleChange});

    const scheduleSelect = screen.getByName('scheduleId');
    fireEvent.click(scheduleSelect);
    const daily = await screen.findByText('Daily 09:00');
    fireEvent.click(daily);
    expect(onScheduleChange).toHaveBeenCalledWith('sc-1', 'scheduleId');

    const once = screen.getByName('schedulePeriods') as HTMLInputElement;
    expect(once.checked).toBe(false);
    fireEvent.click(once);
    expect(once.checked).toBe(true);
  });

  test('should list alerts (MultiSelect) and call onNewAlertClick', async () => {
    const {onNewAlertClick, onAlertsChange} = commonHandlers();
    renderDialog({onNewAlertClick, onAlertsChange});

    const ms = screen.getByName('alertIds');
    expect(ms).toBeInTheDocument();

    const newBtn = screen.getByTitle('Create a new alert');
    fireEvent.click(newBtn);
    expect(onNewAlertClick).toHaveBeenCalled();
  });

  test('should disable Apply Overrides and Min QoD when inAssets is NO', async () => {
    renderDialog({inAssets: NO_VALUE});

    const apply = screen.getByName('applyOverrides');
    const minQod = screen.getByName('minQod');

    expect(apply).toBeDisabled();
    expect(minQod).toBeDisabled();
  });

  test('should call creation buttons for agent group and schedule', async () => {
    const {onNewScheduleClick, onNewAgentGroupClick} = commonHandlers();
    renderDialog({onNewScheduleClick, onNewAgentGroupClick});

    fireEvent.click(screen.getByTitle('Create a new Agent Group'));
    expect(onNewAgentGroupClick).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Create a new schedule'));
    expect(onNewScheduleClick).toHaveBeenCalled();
  });

  test('should close dialog on close button click', () => {
    const {onClose} = commonHandlers();
    rendererWith({gmp, capabilities: true}).render(
      <AgentTaskDialog
        agentGroups={agentGroups}
        alerts={alerts}
        schedules={schedules}
        tags={tags}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getDialogCloseButton());
    expect(onClose).toHaveBeenCalled();
  });
});
