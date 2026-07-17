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
  wait,
  within,
} from 'web/testing';
import Override, {
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_FOR_NEXT_VALUE,
  ANY,
  DEFAULT_DAYS,
  DEFAULT_OID_VALUE,
  MANUAL,
  SEVERITY_FALSE_POSITIVE,
} from 'gmp/models/override';
import {createSession} from 'gmp/testing';
import {
  SEVERITY_RATING_CVSS_2,
  SEVERITY_RATING_CVSS_3,
} from 'gmp/utils/severity';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import OverrideComponent from 'web/pages/overrides/OverrideComponent';

const createTask = (id = 'task-1', name = 'Task 1') => ({
  name,
  id,
});

const createGmp = ({
  getTasks = testing.fn().mockResolvedValue({
    data: [createTask()],
  }),
  create = testing.fn().mockResolvedValue({}),
  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse),
  severityRating = SEVERITY_RATING_CVSS_3,
} = {}) => ({
  user: {currentSettings},
  tasks: {getAll: getTasks},
  override: {create},
  session: createSession(),
  settings: {severityRating},
});

describe('OverrideComponent', () => {
  test('should render create override dialog', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(
      <OverrideComponent>
        {({create}) => (
          <button data-testid="button" onClick={() => create({})}>
            Create Override
          </button>
        )}
      </OverrideComponent>,
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
    expect(severityRadioInputs).toHaveLength(4);

    const newSeverityFormGroup = within(
      screen.getByTestId('group-new-severity'),
    );
    const newSeverityRadioInputs = newSeverityFormGroup.getRadioInputs();
    expect(newSeverityRadioInputs).toHaveLength(2);
    expect(newSeverityRadioInputs[0]).toBeChecked();
    expect(newSeverityFormGroup.getByName('newSeverity')).toBeDisabled();

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

    expect(gmp.override.create).toHaveBeenCalledWith({
      active: ACTIVE_YES_ALWAYS_VALUE,
      customSeverity: false,
      days: DEFAULT_DAYS,
      hosts: ANY,
      hostsManual: '',
      id: undefined,
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
      tasks: [],
      taskUuid: undefined,
      text: '',
    });
  });

  test('should render create override dialog with initial values', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    render(
      <OverrideComponent>
        {({create}) => (
          <button
            data-testid="button"
            onClick={() =>
              create({
                active: ACTIVE_YES_FOR_NEXT_VALUE,
                hosts: MANUAL,
                hostsManual: 'host1, host2',
                newSeverityFromList: 7,
                nvtName: 'Test NVT',
                oid: '1.2.3',
                port: MANUAL,
                portManual: '1234',
                resultId: MANUAL,
                resultName: 'Test Result',
                severity: 9.9,
                taskId: MANUAL,
                taskUuid: 'task-1',
                text: 'foo bar',
              })
            }
          >
            Create Override
          </button>
        )}
      </OverrideComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    const dialog = screen.getDialog();
    expect(dialog).toBeInTheDocument();

    await wait();

    // Check text and OID
    expect(screen.getByName('text')).toHaveValue('foo bar');
    expect(screen.getByName('oid')).toHaveValue('1.2.3');

    // Check active: "yes, for the next"
    const activeFormGroup = within(screen.getByTestId('group-active'));
    const activeRadios = activeFormGroup.getRadioInputs();
    expect(activeRadios[1]).toBeChecked();

    // Check hosts: MANUAL with manual input
    const hostsFormGroup = within(screen.getByTestId('group-hosts'));
    const hostsRadios = hostsFormGroup.getRadioInputs();
    expect(hostsRadios[1]).toBeChecked();
    expect(hostsFormGroup.getByName('hostsManual')).toHaveValue('host1, host2');

    // Check location/port: MANUAL with manual input
    const locationFormGroup = within(screen.getByTestId('group-location'));
    const locationRadios = locationFormGroup.getRadioInputs();
    expect(locationRadios[1]).toBeChecked();
    expect(screen.getByName('portManual')).toHaveValue('1234');

    // Check severity
    const severityFormGroup = within(screen.getByTestId('group-severity'));
    const severityRadios = severityFormGroup.getRadioInputs();
    expect(severityRadios[1]).toBeChecked();

    // Check new severity: predefined list (7 is in the list)
    const newSeverityFormGroup = within(
      screen.getByTestId('group-new-severity'),
    );
    const newSeverityRadios = newSeverityFormGroup.getRadioInputs();
    expect(newSeverityRadios[0]).toBeChecked();
    // Select shows "High" (label), not the numeric value
    expect(newSeverityFormGroup.getSelectElement()).toHaveValue('High');

    // Check task: MANUAL with selected task
    const taskFormGroup = within(screen.getByTestId('group-task'));
    const taskRadios = taskFormGroup.getRadioInputs();
    expect(taskRadios[1]).toBeChecked();
    expect(taskFormGroup.getSelectElement()).toHaveValue('Task 1');

    // Check result: MANUAL with result name
    const resultFormGroup = within(screen.getByTestId('group-result'));
    const resultRadios = resultFormGroup.getRadioInputs();
    expect(resultRadios[1]).toBeChecked();
    expect(
      resultFormGroup.getByText('Only selected result (Test Result)'),
    ).toBeInTheDocument();

    const saveButton = screen.getDialogSaveButton();
    fireEvent.click(saveButton);

    expect(gmp.override.create).toHaveBeenCalled();
  });

  test('should detect custom severity when newSeverity is not in the list', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    const override = new Override({
      id: 'override-1',
      text: 'existing',
      newSeverity: 8.1, // Not in standard list, should be custom
    });

    render(
      <OverrideComponent>
        {({edit}) => (
          <button data-testid="button" onClick={() => edit(override)}>
            Edit Override
          </button>
        )}
      </OverrideComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    await wait();

    const newSeverityFormGroup = within(
      screen.getByTestId('group-new-severity'),
    );
    const newSeverityRadios = newSeverityFormGroup.getRadioInputs();

    // Should have custom severity toggle selected
    expect(newSeverityRadios[1]).toBeChecked();

    const newSeverityInput = newSeverityFormGroup.getByName('newSeverity');
    expect(newSeverityInput).toHaveValue('8.1');
  });

  test('should use predefined severity from list when available', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({gmp});

    // 9 is HIGH value in CVSS3
    const override = new Override({
      id: 'override-1',
      text: 'existing',
      newSeverity: 9,
    });

    render(
      <OverrideComponent>
        {({edit}) => (
          <button data-testid="button" onClick={() => edit(override)}>
            Edit Override
          </button>
        )}
      </OverrideComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    await wait();

    const newSeverityFormGroup = within(
      screen.getByTestId('group-new-severity'),
    );
    const newSeverityRadios = newSeverityFormGroup.getRadioInputs();

    // Should have predefined list option selected
    expect(newSeverityRadios[0]).toBeChecked();
  });

  test('should include critical severity boundary for CVSSv3', async () => {
    const gmp = createGmp({severityRating: SEVERITY_RATING_CVSS_3});
    const {render} = rendererWith({gmp});

    render(
      <OverrideComponent>
        {({create}) => (
          <button data-testid="button" onClick={() => create({})}>
            Create Override
          </button>
        )}
      </OverrideComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    await wait();

    const newSeverityFormGroup = within(
      screen.getByTestId('group-new-severity'),
    );
    const selectElement = newSeverityFormGroup.getSelectElement();

    expect(selectElement).toBeInTheDocument();

    // Get the select items
    const items = await getSelectItemElementsForSelect(selectElement);

    // CVSSv3 should include Critical in the options
    const criticalItem = items.find(item =>
      item.textContent?.includes('Critical'),
    );
    expect(criticalItem).toBeDefined();
  });

  test('should exclude critical severity boundary for CVSSv2', async () => {
    const gmp = createGmp({severityRating: SEVERITY_RATING_CVSS_2});
    const {render} = rendererWith({gmp});

    render(
      <OverrideComponent>
        {({create}) => (
          <button data-testid="button" onClick={() => create({})}>
            Create Override
          </button>
        )}
      </OverrideComponent>,
    );

    const button = screen.getByTestId('button');
    fireEvent.click(button);

    await wait();

    const newSeverityFormGroup = within(
      screen.getByTestId('group-new-severity'),
    );
    const selectElement = newSeverityFormGroup.getSelectElement();

    expect(selectElement).toBeInTheDocument();

    // Get the select items
    const items = await getSelectItemElementsForSelect(selectElement);

    // CVSSv2 should NOT include Critical in the options
    const criticalItem = items.find(item =>
      item.textContent?.includes('Critical'),
    );
    expect(criticalItem).toBeUndefined();
  });
});
