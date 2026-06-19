/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {
  fireEvent,
  getSelectItemElementsForSelect,
  rendererWith,
  screen,
  within,
} from 'web/testing';
import date from 'gmp/models/date';
import Note from 'gmp/models/note';
import {
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
  ACTIVE_YES_FOR_NEXT_VALUE,
  ANY,
  DEFAULT_DAYS,
  DEFAULT_OID_VALUE,
  MANUAL,
} from 'gmp/models/override';
import Task from 'gmp/models/task';
import {createSession} from 'gmp/testing';
import NoteDialog from 'web/pages/notes/NoteDialog';

const tasks = [
  new Task({id: 'task-1', name: 'Task 1'}),
  new Task({id: 'task-2', name: 'Task 2'}),
];

describe('NoteDialog tests', () => {
  test('should render with default values and handle close', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({});

    render(<NoteDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();
    expect(screen.getDialogTitle()).toHaveTextContent('New Note');

    expect(screen.getByName('oid')).toHaveValue(DEFAULT_OID_VALUE);

    const activeFormGroup = within(screen.getByTestId('group-active'));
    const activeRadioInputs = activeFormGroup.getRadioInputs();
    expect(activeRadioInputs).toHaveLength(3);
    expect(activeRadioInputs[0]).toBeChecked();

    const hostsFormGroup = within(screen.getByTestId('group-hosts'));
    const hostsRadioInputs = hostsFormGroup.getRadioInputs();
    expect(hostsRadioInputs).toHaveLength(2);
    expect(hostsRadioInputs[0]).toBeChecked();
    expect(hostsFormGroup.getByName('hostsManual')).toBeDisabled();

    const locationFormGroup = within(screen.getByTestId('group-location'));
    const locationRadioInputs = locationFormGroup.getRadioInputs();
    expect(locationRadioInputs).toHaveLength(2);
    expect(locationRadioInputs[0]).toBeChecked();
    expect(screen.getByName('portManual')).toBeDisabled();

    const severityFormGroup = within(screen.getByTestId('group-severity'));
    const severityRadioInputs = severityFormGroup.getRadioInputs();
    expect(severityRadioInputs).toHaveLength(3);
    expect(severityRadioInputs[0]).toBeChecked();

    const taskFormGroup = within(screen.getByTestId('group-task'));
    const taskRadioInputs = taskFormGroup.getRadioInputs();
    expect(taskRadioInputs).toHaveLength(2);
    expect(taskRadioInputs[0]).toBeChecked();
    expect(taskFormGroup.getSelectElement()).toBeDisabled();

    const resultFormGroup = within(screen.getByTestId('group-result'));
    const resultRadioInputs = resultFormGroup.getRadioInputs();
    expect(resultRadioInputs).toHaveLength(2);
    expect(resultRadioInputs[0]).toBeChecked();
    expect(resultFormGroup.getByName('resultUuid')).toBeDisabled();

    expect(screen.getByName('text')).toHaveValue('');

    fireEvent.click(screen.getDialogCloseButton());
    expect(onClose).toHaveBeenCalled();
  });

  test('should allow to save with default values', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({});

    render(<NoteDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      active: ACTIVE_YES_ALWAYS_VALUE,
      days: DEFAULT_DAYS,
      fixed: false,
      hosts: ANY,
      hostsManual: '',
      id: undefined,
      oid: DEFAULT_OID_VALUE,
      port: ANY,
      portManual: '',
      resultId: ANY,
      taskId: ANY,
      text: '',
    });
  });

  test('should render fixed dialog with initial values and save', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({});

    render(
      <NoteDialog
        active={ACTIVE_YES_FOR_NEXT_VALUE}
        fixed={true}
        hosts={MANUAL}
        hostsManual="host1, host2"
        nvtName="Test NVT"
        oid="1.2.3"
        port={MANUAL}
        portManual="1234"
        resultId={MANUAL}
        resultName="Test Result"
        severity={9.9}
        taskId={MANUAL}
        taskName="Task 1"
        taskUuid="task-1"
        tasks={tasks}
        text="foo bar"
        onClose={onClose}
        onSave={onSave}
      />,
    );

    expect(screen.queryByName('oid')).not.toBeInTheDocument();
    const nvtFormGroup = screen.getByTestId('group-nvt-oid');
    expect(nvtFormGroup).toHaveTextContent('Test NVT');

    const activeFormGroup = within(screen.getByTestId('group-active'));
    const activeRadioInputs = activeFormGroup.getRadioInputs();
    expect(activeRadioInputs).toHaveLength(3);
    expect(activeRadioInputs[1]).toBeChecked();

    const hostsFormGroup = within(screen.getByTestId('group-hosts'));
    const hostsRadioInputs = hostsFormGroup.getRadioInputs();
    expect(hostsRadioInputs).toHaveLength(2);
    expect(hostsRadioInputs[1]).toBeChecked();
    expect(hostsFormGroup.getByName('hostsManual')).toHaveValue('host1, host2');

    const locationFormGroup = within(screen.getByTestId('group-location'));
    const locationRadioInputs = locationFormGroup.getRadioInputs();
    expect(locationRadioInputs).toHaveLength(2);
    expect(locationRadioInputs[1]).toBeChecked();
    expect(screen.getByName('portManual')).toHaveValue('1234');

    const severityFormGroup = within(screen.getByTestId('group-severity'));
    const severityRadioInputs = severityFormGroup.getRadioInputs();
    expect(severityRadioInputs).toHaveLength(2);
    expect(severityRadioInputs[1]).toBeChecked();

    const taskFormGroup = within(screen.getByTestId('group-task'));
    const taskRadioInputs = taskFormGroup.getRadioInputs();
    expect(taskRadioInputs).toHaveLength(2);
    expect(taskRadioInputs[0]).not.toBeChecked();
    expect(taskRadioInputs[1]).toBeChecked();
    expect(taskFormGroup.getSelectElement()).toHaveValue('Task 1');

    const resultFormGroup = within(screen.getByTestId('group-result'));
    const resultRadioInputs = resultFormGroup.getRadioInputs();
    expect(resultRadioInputs).toHaveLength(2);
    expect(resultRadioInputs[1]).toBeChecked();
    expect(resultFormGroup.queryByName('resultUuid')).not.toBeInTheDocument();
    expect(
      resultFormGroup.getByText('Only selected result (Test Result)'),
    ).toBeInTheDocument();

    expect(screen.getByName('text')).toHaveValue('foo bar');

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      active: ACTIVE_YES_FOR_NEXT_VALUE,
      days: DEFAULT_DAYS,
      fixed: true,
      hosts: MANUAL,
      hostsManual: 'host1, host2',
      id: undefined,
      oid: '1.2.3',
      port: MANUAL,
      portManual: '1234',
      resultId: MANUAL,
      resultName: 'Test Result',
      severity: 9.9,
      taskId: MANUAL,
      taskName: 'Task 1',
      taskUuid: 'task-1',
      text: 'foo bar',
    });
  });

  test('should allow to change task selection', async () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({});

    render(<NoteDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    const taskFormGroup = within(screen.getByTestId('group-task'));
    const taskRadioInputs = taskFormGroup.getRadioInputs();
    fireEvent.click(taskRadioInputs[1]);

    const taskOptions = await getSelectItemElementsForSelect(
      taskFormGroup.getSelectElement(),
    );
    fireEvent.click(taskOptions[1]);

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: MANUAL,
        taskUuid: 'task-2',
      }),
    );
  });

  test('should allow to change hosts', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({});

    render(<NoteDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    const hostsFormGroup = within(screen.getByTestId('group-hosts'));
    const hostsRadioInputs = hostsFormGroup.getRadioInputs();
    fireEvent.click(hostsRadioInputs[1]);

    const hostsManualInput = hostsFormGroup.getByName('hostsManual');
    fireEvent.change(hostsManualInput, {target: {value: '10.0.0.1, 10.0.0.2'}});

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        hosts: MANUAL,
        hostsManual: '10.0.0.1, 10.0.0.2',
      }),
    );
  });

  test('should allow to change port', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({});

    render(<NoteDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    const locationFormGroup = within(screen.getByTestId('group-location'));
    const locationRadioInputs = locationFormGroup.getRadioInputs();
    fireEvent.click(locationRadioInputs[1]);

    const portManualInput = locationFormGroup.getByName('portManual');
    fireEvent.change(portManualInput, {target: {value: '443/tcp'}});

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        port: MANUAL,
        portManual: '443/tcp',
      }),
    );
  });

  test('should allow to change result', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({});

    render(<NoteDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    const resultFormGroup = within(screen.getByTestId('group-result'));
    const resultRadioInputs = resultFormGroup.getRadioInputs();
    fireEvent.click(resultRadioInputs[1]);

    const resultUuidInput = resultFormGroup.getByName('resultUuid');
    fireEvent.change(resultUuidInput, {target: {value: 'result-uuid-1'}});

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        resultId: MANUAL,
        resultUuid: 'result-uuid-1',
      }),
    );
  });

  test('should render edit dialog for an existing note instance', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const noteEndTime = date('2026-01-01T12:00:00Z');
    const note = new Note({
      id: 'note-1',
      active: 1,
      endTime: noteEndTime,
      text: 'existing note',
    });
    const {render} = rendererWith({
      gmp: {session: createSession({timezone: 'UTC'})},
    });

    render(
      <NoteDialog
        active={ACTIVE_YES_UNTIL_VALUE}
        id={note.id}
        note={note}
        nvtName="Existing NVT"
        oid="1.3.6.1.4.1.25623.1.0.100001"
        taskId={MANUAL}
        taskName="Task 1"
        taskUuid="task-1"
        tasks={tasks}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const nvtFormGroup = within(screen.getByTestId('group-nvt'));
    const nvtRadioInputs = nvtFormGroup.getRadioInputs();
    expect(nvtRadioInputs).toHaveLength(2);
    expect(nvtRadioInputs[0]).toBeChecked();
    expect(nvtRadioInputs[1]).not.toBeChecked();

    const oidInput = nvtFormGroup.getByRole('textbox');
    expect(oidInput).toBeDisabled();
    expect(oidInput).toHaveValue(DEFAULT_OID_VALUE);

    const activeFormGroup = within(screen.getByTestId('group-active'));
    const activeRadioInputs = activeFormGroup.getRadioInputs();
    expect(activeRadioInputs).toHaveLength(4);
    expect(activeRadioInputs[1]).toBeChecked();
    expect(activeFormGroup.getByText('yes, until')).toBeInTheDocument();
    expect(activeFormGroup.getByText(/2026/)).toBeInTheDocument();

    fireEvent.click(nvtRadioInputs[1]);
    expect(oidInput).not.toBeDisabled();

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'note-1',
        oid: DEFAULT_OID_VALUE,
        taskId: MANUAL,
        taskUuid: 'task-1',
      }),
    );
  });
});
