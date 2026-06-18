/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, wait, within} from 'web/testing';
import {
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_FOR_NEXT_VALUE,
  ANY,
  DEFAULT_DAYS,
  DEFAULT_OID_VALUE,
  MANUAL,
} from 'gmp/models/override';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import NoteComponent from 'web/pages/notes/NoteComponent';

const createGmp = ({
  getTasks = testing.fn().mockResolvedValue({
    data: [{name: 'Task 1', id: 'task-1'}],
  }),
  create = testing.fn().mockResolvedValue({}),
  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse),
} = {}) => ({
  user: {currentSettings},
  tasks: {getAll: getTasks},
  note: {create},
  session: createSession(),
});

describe('NoteComponent', () => {
  test('should render create note dialog', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(
      <NoteComponent>
        {({create}) => (
          <button data-testid="button" onClick={() => create({})}>
            Create Note
          </button>
        )}
      </NoteComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();

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

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(gmp.note.create).toHaveBeenCalledWith({
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

  test('should render fixed create note dialog with initial values', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(
      <NoteComponent>
        {({create}) => {
          return (
            <button
              data-testid="button"
              onClick={() =>
                create({
                  active: ACTIVE_YES_FOR_NEXT_VALUE,
                  fixed: true,
                  hosts: MANUAL,
                  hostsManual: 'host1, host2',
                  nvtName: 'Test NVT',
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
                })
              }
            >
              Create Note
            </button>
          );
        }}
      </NoteComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();

    await wait();

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

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(gmp.note.create).toHaveBeenCalledWith({
      active: ACTIVE_YES_FOR_NEXT_VALUE,
      days: DEFAULT_DAYS,
      fixed: true,
      hosts: MANUAL,
      hostsManual: 'host1, host2',
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
});
