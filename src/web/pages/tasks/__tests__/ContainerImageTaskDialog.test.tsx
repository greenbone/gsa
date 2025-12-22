/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {
  changeInputValue,
  fireEvent,
  rendererWith,
  screen,
  wait,
  within,
} from 'web/testing';
import {CONTAINER_IMAGE_DEFAULT_SCANNER_ID} from 'gmp/models/scanner';
import Task, {AUTO_DELETE_NO, TASK_STATUS} from 'gmp/models/task';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import ContainerImageTaskDialog from 'web/pages/tasks/ContainerImageTaskDialog';

describe('ContainerImageTaskDialog component tests', () => {
  const getMockFn = testing.fn().mockResolvedValue({
    data: [
      {id: 'oci-1', name: 'Registry Target 1'},
      {id: 'oci-2', name: 'Registry Target 2'},
    ],
    meta: {
      counts: {
        filtered: 2,
        first: 1,
        length: 2,
        rows: 2,
      },
    },
  });

  const gmp = {
    settings: {
      token: 'test-token',
    },
    ociimagetargets: {
      get: getMockFn,
    },
  };

  const alerts = [
    {id: 'al-1', name: 'Alert 1'},
    {id: 'al-2', name: 'Alert 2'},
  ];
  const schedules = [{id: 'sc-1', name: 'Daily 09:00'}];
  const tags = [{id: 'tg-1', name: 'Important'}];

  beforeEach(() => {
    getMockFn.mockClear();
  });

  const commonHandlers = () => ({
    onClose: testing.fn(),
    onSave: testing.fn(),
    onAlertsChange: testing.fn(),
    onNewAlertClick: testing.fn(),
    onNewScheduleClick: testing.fn(),
    onScheduleChange: testing.fn(),
    onScannerChange: testing.fn(),
    onOciImageTargetChange: testing.fn(),
  });

  const renderDialog = (
    props: Partial<React.ComponentProps<typeof ContainerImageTaskDialog>> = {},
  ) => {
    return rendererWith({gmp, capabilities: true}).render(
      <ContainerImageTaskDialog
        acceptInvalidCerts={true}
        addTag={false}
        alerts={alerts}
        alterable={false}
        applyOverrides={true}
        autoDelete={AUTO_DELETE_NO}
        autoDeleteData={0}
        comment=""
        inAssets={true}
        minQod={70}
        name=""
        registryAllowInsecure={false}
        schedules={schedules}
        tags={tags}
        {...commonHandlers()}
        {...props}
      />,
    );
  };

  test('should render create dialog with defaults', () => {
    renderDialog();

    expect(screen.getDialogTitle()).toHaveTextContent(
      'New Container Image Task',
    );
    expect(screen.getByName('name')).toHaveValue('');
    expect(screen.getByName('comment')).toHaveValue('');
    expect(screen.getByName('acceptInvalidCerts')).toBeChecked();
    expect(screen.getByName('registryAllowInsecure')).not.toBeChecked();
  });

  test('should render edit dialog with task', () => {
    const task = Task.fromElement({
      _id: 't1',
      name: 'Container Task',
      comment: 'Test comment',
      status: TASK_STATUS.new,
      alterable: YES_VALUE,
    });

    renderDialog({
      task,
      name: 'Container Task',
      comment: 'Test comment',
      title: 'Edit Container Image Task',
    });

    expect(screen.getDialogTitle()).toHaveTextContent(
      'Edit Container Image Task',
    );
    expect(screen.getByName('name')).toHaveValue('Container Task');
    expect(screen.getByName('comment')).toHaveValue('Test comment');
  });

  test('should list OCI image targets and call onOciImageTargetChange when selected', async () => {
    const {onOciImageTargetChange} = commonHandlers();
    renderDialog({onOciImageTargetChange});

    // Wait for the OCI targets to load
    await wait();

    const ociTargetSelect = screen.getByTestId('oci-image-target-select');
    expect(ociTargetSelect).toBeInTheDocument();

    expect(getMockFn).toHaveBeenCalled();

    fireEvent.click(ociTargetSelect);
    const option1 = await screen.findByText('Registry Target 1');
    const option2 = await screen.findByText('Registry Target 2');
    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();
  });

  test('should show Tag selector in create mode (no task)', () => {
    renderDialog();
    expect(screen.getByName('addTag')).toBeInTheDocument();
    expect(screen.getByName('tagId')).toBeInTheDocument();
  });

  test('should hide Tag selector in edit mode (task provided)', () => {
    const task = Task.fromElement({
      _id: 't1',
      status: TASK_STATUS.new,
      alterable: YES_VALUE,
    });
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

  test('should display scanner as disabled Container Image Scanner', () => {
    renderDialog();

    const scannerSelect = screen.getByName('scannerId');
    expect(scannerSelect).toBeDisabled();
    expect(scannerSelect).toHaveValue(CONTAINER_IMAGE_DEFAULT_SCANNER_ID);
  });

  test('should handle scanner preferences checkboxes', () => {
    renderDialog({
      acceptInvalidCerts: false,
      registryAllowInsecure: true,
    });

    const acceptCerts = screen.getByName('acceptInvalidCerts');
    const allowInsecure = screen.getByName('registryAllowInsecure');

    expect(acceptCerts).not.toBeChecked();
    expect(allowInsecure).toBeChecked();

    fireEvent.click(acceptCerts);
    fireEvent.click(allowInsecure);

    expect(acceptCerts).toBeChecked();
    expect(allowInsecure).not.toBeChecked();
  });

  test('should call creation buttons for alert and schedule', async () => {
    const {onNewScheduleClick, onNewAlertClick} = commonHandlers();
    renderDialog({onNewScheduleClick, onNewAlertClick});

    fireEvent.click(screen.getByTitle('Create a new alert'));
    expect(onNewAlertClick).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Create a new schedule'));
    expect(onNewScheduleClick).toHaveBeenCalled();
  });

  test('should save dialog with updated values', async () => {
    const onSave = testing.fn();
    renderDialog({
      name: 'Initial Container Task',
      comment: 'Initial comment',
      onSave,
    });

    changeInputValue(screen.getByName('name'), 'Updated Container Task');
    changeInputValue(screen.getByName('comment'), 'Updated comment');

    fireEvent.click(screen.getByName('registryAllowInsecure'));
    fireEvent.click(screen.getByName('acceptInvalidCerts'));

    fireEvent.click(screen.getDialogSaveButton());
    await wait();

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated Container Task',
        comment: 'Updated comment',
        registryAllowInsecure: true,
        acceptInvalidCerts: false,
      }),
    );
  });

  test('should handle alterable task setting for new task', () => {
    renderDialog({alterable: false});

    const alterable = screen.getByName('alterable');
    expect(alterable).not.toBeChecked();
    expect(alterable).not.toBeDisabled();

    fireEvent.click(alterable);
    expect(alterable).toBeChecked();
  });

  test('should disable alterable task setting for existing task', () => {
    const task = Task.fromElement({
      _id: 't1',
      status: TASK_STATUS.new,
      alterable: NO_VALUE,
    });

    renderDialog({task});

    const alterable = screen.getByName('alterable');

    const alterableCheckbox = within(alterable).queryByRole('checkbox');

    expect(alterableCheckbox).toBeNull();
  });

  test('should handle loading states', () => {
    gmp.ociimagetargets.get.mockReturnValueOnce(new Promise(() => {}));

    renderDialog({
      isLoadingAlerts: true,
      isLoadingSchedules: true,
      isLoadingTags: true,
    });

    const ociTargetSelect = screen.getByTestId('oci-image-target-select');
    expect(ociTargetSelect).toHaveAttribute('placeholder', 'Loading...');
    const scheduleGroup = screen.getByTestId('schedule-group');

    const scheduleSelect = within(scheduleGroup).getByTestId('schedule-select');
    expect(scheduleSelect).toHaveAttribute('placeholder', 'Loading...');

    const tagSelect = screen.getByTestId('tag-select');
    expect(tagSelect).toHaveAttribute('placeholder', 'Loading...');
  });

  test('should close dialog on close button click', () => {
    const onClose = testing.fn();
    renderDialog({onClose});

    fireEvent.click(screen.getDialogCloseButton());
    expect(onClose).toHaveBeenCalled();
  });

  test('should handle empty alerts list correctly', () => {
    renderDialog({alertIds: ['0']});

    expect(screen.getByName('alertIds')).toHaveValue('');
  });

  test('should handle multiple alert selection', () => {
    const onAlertsChange = testing.fn();
    renderDialog({
      alertIds: ['al-1', 'al-2'],
      onAlertsChange,
    });

    const alertsSelect = screen.getByName('alertIds');
    expect(alertsSelect).toBeInTheDocument();
  });
});
