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
  RESULT_ANY,
  RESULT_UUID,
  TASK_ANY,
} from 'gmp/models/override';
import {currentSettingsDefaultResponse} from 'web/pages/__mocks__/CurrentSettings';
import NoteComponent from 'web/pages/notes/NoteComponent';

const currentSettings = testing
  .fn()
  .mockResolvedValue(currentSettingsDefaultResponse);

describe('NoteComponent', () => {
  test('should render create note dialog', async () => {
    const getAll = testing.fn().mockResolvedValue({
      data: [],
    });
    const create = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {currentSettings},
      tasks: {getAll},
      note: {create},
    };
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
    expect(hostsFormGroup.getByName('hosts_manual')).toBeDisabled();

    const locationFormGroup = within(screen.getByTestId('group-location'));
    const locationRadioInputs = locationFormGroup.getRadioInputs();
    expect(locationRadioInputs).toHaveLength(2);
    expect(locationRadioInputs[0]).toBeChecked();
    expect(screen.getByName('port_manual')).toBeDisabled();

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
    expect(resultFormGroup.getByName('result_uuid')).toBeDisabled();

    expect(screen.getByName('text')).toHaveValue('');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(create).toHaveBeenCalledWith({
      active: ACTIVE_YES_ALWAYS_VALUE,
      days: DEFAULT_DAYS,
      fixed: false,
      hosts: ANY,
      hosts_manual: '',
      id: undefined,
      oid: DEFAULT_OID_VALUE,
      port: ANY,
      port_manual: '',
      result_id: RESULT_ANY,
      task_id: TASK_ANY,
      text: '',
    });
  });

  test('should render create note dialog with initial values', async () => {
    const getAll = testing.fn().mockResolvedValue({
      data: [{id: 'task-1', name: 'Task 1'}],
    });
    const create = testing.fn().mockResolvedValue({});
    const gmp = {
      user: {currentSettings},
      tasks: {getAll},
      note: {create},
    };
    const {render} = rendererWith({gmp});
    const initial = {
      active: ACTIVE_YES_FOR_NEXT_VALUE,
      fixed: true,
      hosts: MANUAL,
      hosts_manual: 'host1, host2',
      nvt_name: 'Test NVT',
      oid: '1.2.3',
      port: MANUAL,
      port_manual: '1234',
      result_id: RESULT_UUID,
      result_name: 'Test Result',
      severity: 9.9,
      task_id: 'task-1',
      task_name: 'Task 1',
      task_uuid: 'task-1',
      text: 'foo bar',
    };

    render(
      <NoteComponent>
        {({create}) => {
          return (
            <button data-testid="button" onClick={() => create(initial)}>
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
    expect(hostsFormGroup.getByName('hosts_manual')).toHaveValue(
      'host1, host2',
    );

    const locationFormGroup = within(screen.getByTestId('group-location'));
    const locationRadioInputs = locationFormGroup.getRadioInputs();
    expect(locationRadioInputs).toHaveLength(2);
    expect(locationRadioInputs[1]).toBeChecked();
    expect(screen.getByName('port_manual')).toHaveValue('1234');

    const severityFormGroup = within(screen.getByTestId('group-severity'));
    const severityRadioInputs = severityFormGroup.getRadioInputs();
    expect(severityRadioInputs).toHaveLength(2);
    expect(severityRadioInputs[1]).toBeChecked();

    const taskFormGroup = within(screen.getByTestId('group-task'));
    const taskRadioInputs = taskFormGroup.getRadioInputs();
    expect(taskRadioInputs).toHaveLength(2);
    expect(taskRadioInputs[0]).not.toBeChecked();
    expect(taskRadioInputs[1]).not.toBeChecked();
    expect(taskFormGroup.getSelectElement()).toHaveValue('Task 1');

    const resultFormGroup = within(screen.getByTestId('group-result'));
    const resultRadioInputs = resultFormGroup.getRadioInputs();
    expect(resultRadioInputs).toHaveLength(2);
    expect(resultRadioInputs[1]).toBeChecked();
    expect(resultFormGroup.queryByName('result_uuid')).not.toBeInTheDocument();
    expect(
      resultFormGroup.getByText('Only selected result (Test Result)'),
    ).toBeInTheDocument();

    expect(screen.getByName('text')).toHaveValue('foo bar');

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(create).toHaveBeenCalledWith({
      active: ACTIVE_YES_FOR_NEXT_VALUE,
      days: DEFAULT_DAYS,
      fixed: true,
      hosts: MANUAL,
      hosts_manual: 'host1, host2',
      oid: '1.2.3',
      port: MANUAL,
      port_manual: '1234',
      result_id: RESULT_UUID,
      result_name: 'Test Result',
      severity: 9.9,
      task_id: 'task-1',
      task_name: 'Task 1',
      task_uuid: 'task-1',
      text: 'foo bar',
    });
  });
});
