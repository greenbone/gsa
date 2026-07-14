/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import date from 'gmp/models/date';
import {
  ACTIVE_NO_VALUE,
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_FOR_NEXT_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
} from 'gmp/models/override';
import {createSession} from 'gmp/testing';
import ActiveFormGroup, {
  computeDaysUntil,
  handleEndDateChange,
} from 'web/pages/overrides/ActiveFormGroup';

const createGmp = () => ({
  session: createSession({timezone: 'UTC'}),
});

const createItem = ({
  active = true,
  endTime,
}: {active?: boolean; endTime?: ReturnType<typeof date>} = {}) => ({
  isActive: () => active,
  endTime,
});

describe('computeDaysUntil', () => {
  test('should return 1 for tomorrow', () => {
    const tomorrow = date().add(1, 'day');
    expect(computeDaysUntil(tomorrow)).toBe(1);
  });

  test('should return 30 for 30 days from now', () => {
    const future = date().add(30, 'day');
    expect(computeDaysUntil(future)).toBe(30);
  });

  test('should return 1 for today', () => {
    expect(computeDaysUntil(date())).toBe(1);
  });

  test('should return 1 for a past date', () => {
    const past = date().subtract(5, 'day');
    expect(computeDaysUntil(past)).toBe(1);
  });
});

describe('handleEndDateChange', () => {
  test('should update the end date and propagate computed days', () => {
    const setEndDate = testing.fn();
    const onValueChange = testing.fn();
    const newDate = date().add(5, 'day');

    handleEndDateChange(newDate, setEndDate, onValueChange);

    expect(setEndDate).toHaveBeenCalledWith(newDate);
    expect(onValueChange).toHaveBeenCalledWith(5, 'days');
  });
});

describe('ActiveFormGroup tests', () => {
  test('should render three radios when not editing', () => {
    const onValueChange = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ActiveFormGroup
        active={ACTIVE_YES_ALWAYS_VALUE}
        onValueChange={onValueChange}
      />,
    );

    const activeGroup = within(screen.getByTestId('group-active'));
    const radios = activeGroup.getRadioInputs();
    expect(radios).toHaveLength(3);
    expect(radios[0]).toBeChecked();
  });

  test('should not render the until radio when editing an inactive item', () => {
    const onValueChange = testing.fn();
    const item = createItem({active: false, endTime: date()});
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ActiveFormGroup
        active={ACTIVE_YES_ALWAYS_VALUE}
        isEdit={true}
        item={item}
        onValueChange={onValueChange}
      />,
    );

    const activeGroup = within(screen.getByTestId('group-active'));
    expect(activeGroup.getRadioInputs()).toHaveLength(3);
  });

  test('should not render the until radio when the item has no end time', () => {
    const onValueChange = testing.fn();
    const item = createItem({active: true, endTime: undefined});
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ActiveFormGroup
        active={ACTIVE_YES_ALWAYS_VALUE}
        isEdit={true}
        item={item}
        onValueChange={onValueChange}
      />,
    );

    const activeGroup = within(screen.getByTestId('group-active'));
    expect(activeGroup.getRadioInputs()).toHaveLength(3);
  });

  test('should render the until radio and end time when editing an active item with an end time', () => {
    const onValueChange = testing.fn();
    const endTime = date('2026-01-01T12:00:00Z');
    const item = createItem({active: true, endTime});
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ActiveFormGroup
        active={ACTIVE_YES_UNTIL_VALUE}
        isEdit={true}
        item={item}
        onValueChange={onValueChange}
      />,
    );

    const activeGroup = within(screen.getByTestId('group-active'));
    const radios = activeGroup.getRadioInputs();
    expect(radios).toHaveLength(4);
    expect(radios[1]).toBeChecked();
    expect(activeGroup.getByText(/2026/)).toBeInTheDocument();
  });

  test('should render the DatePicker disabled by default and enabled when yes for next is selected', () => {
    const onValueChange = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ActiveFormGroup
        active={ACTIVE_YES_ALWAYS_VALUE}
        onValueChange={onValueChange}
      />,
    );

    const datePicker = screen.getByTestId('datepicker-input');
    expect(datePicker).toBeDisabled();

    fireEvent.click(
      within(screen.getByTestId('group-active')).getRadioInputs()[1],
    );

    expect(onValueChange).toHaveBeenCalledWith(
      ACTIVE_YES_FOR_NEXT_VALUE,
      'active',
    );
  });

  test('should enable the DatePicker when active is yes for next', () => {
    const onValueChange = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ActiveFormGroup
        active={ACTIVE_YES_FOR_NEXT_VALUE}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByTestId('datepicker-input')).not.toBeDisabled();
  });

  test('should call onValueChange when the no radio is clicked', () => {
    const onValueChange = testing.fn();
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ActiveFormGroup
        active={ACTIVE_YES_ALWAYS_VALUE}
        onValueChange={onValueChange}
      />,
    );

    const radios = within(screen.getByTestId('group-active')).getRadioInputs();
    fireEvent.click(radios[2]);

    expect(onValueChange).toHaveBeenCalledWith(ACTIVE_NO_VALUE, 'active');
  });
});
