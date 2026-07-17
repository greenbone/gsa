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
import Override, {
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_FOR_NEXT_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
  ANY,
  DEFAULT_DAYS,
  DEFAULT_OID_VALUE,
  MANUAL,
  SEVERITY_FALSE_POSITIVE,
} from 'gmp/models/override';
import Task from 'gmp/models/task';
import {createSession} from 'gmp/testing';
import {
  SEVERITY_RATING_CVSS_2,
  SEVERITY_RATING_CVSS_3,
} from 'gmp/utils/severity';
import OverrideDialog from 'web/pages/overrides/OverrideDialog';

const createTask = (id: string = 'task-1', name: string = 'Task 1') =>
  new Task({
    id,
    name,
  });

const createTasks = () => [
  createTask('task-1', 'Task 1'),
  createTask('task-2', 'Task 2'),
];

const tasks = createTasks();

const createGmp = ({severityRating = SEVERITY_RATING_CVSS_3} = {}) => ({
  session: createSession({timezone: 'UTC'}),
  settings: {
    severityRating,
  },
});

describe('OverrideDialog tests', () => {
  test('should render with default values and handle close', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(<OverrideDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    expect(screen.getDialog()).toBeInTheDocument();
    expect(screen.getDialogTitle()).toHaveTextContent('New Override');

    expect(screen.getByName('oid')).toHaveValue(DEFAULT_OID_VALUE);

    const activeRadios = within(
      screen.getByTestId('group-active'),
    ).getRadioInputs();
    expect(activeRadios).toHaveLength(3);
    expect(activeRadios[0]).toBeChecked();

    const hostsGroup = within(screen.getByTestId('group-hosts'));
    const hostsRadios = hostsGroup.getRadioInputs();
    expect(hostsRadios).toHaveLength(2);
    expect(hostsRadios[0]).toBeChecked();
    expect(hostsGroup.getByName('hostsManual')).toBeDisabled();

    const locationGroup = within(screen.getByTestId('group-location'));
    const locationRadios = locationGroup.getRadioInputs();
    expect(locationRadios).toHaveLength(2);
    expect(locationRadios[0]).toBeChecked();
    expect(locationGroup.getByName('portManual')).toBeDisabled();

    const severityGroup = within(screen.getByTestId('group-severity'));
    const severityRadios = severityGroup.getRadioInputs();
    expect(severityRadios).toHaveLength(4);

    const newSeverityGroup = within(screen.getByTestId('group-new-severity'));
    const newSeverityRadios = newSeverityGroup.getRadioInputs();
    expect(newSeverityRadios).toHaveLength(2);
    expect(newSeverityRadios[0]).toBeChecked();
    expect(newSeverityGroup.getByName('newSeverity')).toBeDisabled();

    const taskGroup = within(screen.getByTestId('group-task'));
    const taskRadios = taskGroup.getRadioInputs();
    expect(taskRadios).toHaveLength(2);
    expect(taskRadios[0]).toBeChecked();
    expect(taskGroup.getByName('taskUuid')).toBeDisabled();

    const resultGroup = within(screen.getByTestId('group-result'));
    const resultRadios = resultGroup.getRadioInputs();
    expect(resultRadios).toHaveLength(2);
    expect(resultRadios[0]).toBeChecked();
    expect(resultGroup.getByName('resultUuid')).toBeDisabled();

    expect(screen.getByName('text')).toHaveValue('');

    fireEvent.click(screen.getDialogCloseButton());
    expect(onClose).toHaveBeenCalled();
  });

  test('should allow to save with default values', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(<OverrideDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      active: ACTIVE_YES_ALWAYS_VALUE,
      customSeverity: false,
      days: DEFAULT_DAYS,
      hosts: ANY,
      hostsManual: '',
      newSeverity: undefined,
      newSeverityFromList: SEVERITY_FALSE_POSITIVE,
      oid: DEFAULT_OID_VALUE,
      override: undefined,
      port: ANY,
      portManual: '',
      resultId: ANY,
      resultUuid: undefined,
      severity: undefined,
      taskId: ANY,
      taskName: undefined,
      tasks,
      taskUuid: undefined,
      text: '',
      id: undefined,
    });
  });

  test('should render fixed dialog with initial values and save', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <OverrideDialog
        active={ACTIVE_YES_FOR_NEXT_VALUE}
        fixed={true}
        hosts={MANUAL}
        hostsManual="host1, host2"
        newSeverityFromList={7}
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
    expect(screen.getByTestId('group-nvt')).toHaveTextContent('Test NVT');

    const activeRadios = within(
      screen.getByTestId('group-active'),
    ).getRadioInputs();
    expect(activeRadios).toHaveLength(3);
    expect(activeRadios[1]).toBeChecked();

    const hostsGroup = within(screen.getByTestId('group-hosts'));
    const hostsRadios = hostsGroup.getRadioInputs();
    expect(hostsRadios[1]).toBeChecked();
    expect(hostsGroup.getByName('hostsManual')).toHaveValue('host1, host2');

    const locationGroup = within(screen.getByTestId('group-location'));
    const locationRadios = locationGroup.getRadioInputs();
    expect(locationRadios[1]).toBeChecked();
    expect(locationGroup.getByName('portManual')).toHaveValue('1234');

    const severityRadios = within(
      screen.getByTestId('group-severity'),
    ).getRadioInputs();
    expect(severityRadios).toHaveLength(2);
    expect(severityRadios[1]).toBeChecked();

    const taskGroup = within(screen.getByTestId('group-task'));
    const taskRadios = taskGroup.getRadioInputs();
    expect(taskRadios[1]).toBeChecked();
    expect(taskGroup.getByName('taskUuid')).toHaveValue('task-1');

    const resultGroup = within(screen.getByTestId('group-result'));
    const resultRadios = resultGroup.getRadioInputs();
    expect(resultRadios[1]).toBeChecked();
    expect(resultGroup.queryByName('resultUuid')).not.toBeInTheDocument();
    expect(
      resultGroup.getByText('Only selected result (Test Result)'),
    ).toBeInTheDocument();

    expect(screen.getByName('text')).toHaveValue('foo bar');

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        active: ACTIVE_YES_FOR_NEXT_VALUE,
        hosts: MANUAL,
        hostsManual: 'host1, host2',
        oid: '1.2.3',
        port: MANUAL,
        portManual: '1234',
        resultId: MANUAL,
        taskId: MANUAL,
        taskName: 'Task 1',
        taskUuid: 'task-1',
        text: 'foo bar',
      }),
    );
  });

  test('should allow to change task selection', async () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(<OverrideDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    const taskGroup = within(screen.getByTestId('group-task'));
    fireEvent.click(taskGroup.getRadioInputs()[1]);

    const taskOptions = await getSelectItemElementsForSelect(
      taskGroup.getSelectElement(),
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

  test('should allow to toggle custom severity and save numeric value', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(<OverrideDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    const newSeverityGroup = within(screen.getByTestId('group-new-severity'));
    fireEvent.click(newSeverityGroup.getRadioInputs()[1]);

    const newSeverityInput = newSeverityGroup.getByName('newSeverity');
    expect(newSeverityInput).not.toBeDisabled();
    fireEvent.change(newSeverityInput, {target: {value: '8.1'}});

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        customSeverity: true,
        newSeverity: 8.1,
      }),
    );
  });

  test('should render severity list with critical on CVSSv3', async () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp({severityRating: SEVERITY_RATING_CVSS_3}),
    });

    render(<OverrideDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    const newSeverityGroup = within(screen.getByTestId('group-new-severity'));
    const options = await getSelectItemElementsForSelect(
      newSeverityGroup.getSelectElement(),
    );
    expect(options.map(option => option.textContent)).toEqual([
      'Critical',
      'High',
      'Medium',
      'Low',
      'Log',
      'False Positive',
    ]);
  });

  test('should render severity list without critical on CVSSv2', async () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({
      gmp: createGmp({severityRating: SEVERITY_RATING_CVSS_2}),
    });

    render(<OverrideDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    const newSeverityGroup = within(screen.getByTestId('group-new-severity'));
    const options = await getSelectItemElementsForSelect(
      newSeverityGroup.getSelectElement(),
    );
    expect(options.map(option => option.textContent)).toEqual([
      'High',
      'Medium',
      'Low',
      'Log',
      'False Positive',
    ]);
  });

  test('should render edit dialog and include until-active and edit severity list option', async () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const override = new Override({
      id: 'override-1',
      active: 1,
      endTime: date('2026-01-01T12:00:00Z'),
      text: 'existing override',
    });
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <OverrideDialog
        active={ACTIVE_YES_UNTIL_VALUE}
        id={override.id}
        nvtName="Existing NVT"
        oid="1.3.6.1.4.1.25623.1.0.100001"
        override={override}
        taskId={MANUAL}
        taskName="Task 1"
        taskUuid="task-1"
        tasks={tasks}
        onClose={onClose}
        onSave={onSave}
      />,
    );

    const nvtGroup = within(screen.getByTestId('group-nvt'));
    const nvtRadios = nvtGroup.getRadioInputs();
    expect(nvtRadios).toHaveLength(2);
    expect(nvtRadios[0]).toBeChecked();

    const oidInput = nvtGroup.getByRole('textbox');
    expect(oidInput).toBeDisabled();
    expect(oidInput).toHaveValue(DEFAULT_OID_VALUE);

    const activeGroup = within(screen.getByTestId('group-active'));
    const activeRadios = activeGroup.getRadioInputs();
    expect(activeRadios).toHaveLength(4);
    expect(activeRadios[1]).toBeChecked();
    expect(activeGroup.getAllByText('yes, until')).toHaveLength(2);

    const newSeverityGroup = within(screen.getByTestId('group-new-severity'));
    const options = await getSelectItemElementsForSelect(
      newSeverityGroup.getSelectElement(),
    );
    expect(options[0]).toHaveTextContent('--');

    fireEvent.click(nvtRadios[1]);
    expect(oidInput).not.toBeDisabled();

    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'override-1',
        oid: DEFAULT_OID_VALUE,
        taskId: MANUAL,
        taskUuid: 'task-1',
      }),
    );
  });

  test('should render DatePicker disabled by default and enabled when yes for next is selected', () => {
    const onClose = testing.fn();
    const onSave = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(<OverrideDialog tasks={tasks} onClose={onClose} onSave={onSave} />);

    const datePicker = screen.getByTestId('datepicker-input');
    expect(datePicker).toBeInTheDocument();
    expect(datePicker).toBeDisabled();

    const activeGroup = within(screen.getByTestId('group-active'));
    fireEvent.click(activeGroup.getRadioInputs()[1]);

    expect(datePicker).not.toBeDisabled();
  });
});
