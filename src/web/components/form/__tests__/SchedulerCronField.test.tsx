/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import SchedulerCronField from 'web/components/form/SchedulerCronField';
import {getSelectElement} from 'web/testing/custom-queries';

describe('SchedulerCronField tests', () => {
  test('should render with predefined schedule', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});

    render(<SchedulerCronField value="0 * * * *" onChange={onChange} />);

    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Every hour')).toBeInTheDocument();
    expect(
      screen.queryByRole('textbox', {name: /Custom cron expression/}),
    ).not.toBeInTheDocument();
  });

  test('should render with custom cron expression', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});

    const customCron = '0 5 * * *'; // 5 AM daily - not in predefined list

    render(<SchedulerCronField value={customCron} onChange={onChange} />);

    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();
    expect(
      screen.getByDisplayValue('Custom cron expression'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: /Custom cron expression More info about cron format/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(customCron)).toBeInTheDocument();
  });

  test('should show help info for custom cron expression', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});

    render(<SchedulerCronField value="0 5 * * *" onChange={onChange} />);

    const helpRegion = screen.getByRole('region', {
      name: 'More info about cron format',
    });
    expect(helpRegion).toBeInTheDocument();
  });

  test('should call onChange when selecting a predefined schedule', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});

    render(<SchedulerCronField value="0 * * * *" onChange={onChange} />);

    const selectInput = getSelectElement();
    fireEvent.click(selectInput);

    const option = screen.getByText('Every 2 hours');
    fireEvent.click(option);

    expect(onChange).toHaveBeenCalledWith('0 */2 * * *');
  });

  test('should switch to custom cron input when selecting custom option', () => {
    const onChange = testing.fn();
    const activeCronExpression = '0 3 * * 1'; // Original custom cron
    const {render} = rendererWith({});

    render(
      <SchedulerCronField
        activeCronExpression={activeCronExpression}
        value="0 * * * *"
        onChange={onChange}
      />,
    );

    // Initially should show predefined schedule
    expect(screen.getByDisplayValue('Every hour')).toBeInTheDocument();

    const selectInput = getSelectElement();
    fireEvent.click(selectInput);

    const customOption = screen.getByText('Custom cron expression');
    fireEvent.click(customOption);

    // Should restore original custom cron
    expect(onChange).toHaveBeenCalledWith(activeCronExpression);
  });

  test('should restore empty string when switching to custom without activeCronExpression', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});

    render(<SchedulerCronField value="0 * * * *" onChange={onChange} />);

    const selectInput = getSelectElement();
    fireEvent.click(selectInput);

    const customOptions = screen.getAllByText('Custom cron expression');
    const customOption = customOptions.at(-1);
    if (!customOption) {
      throw new Error('Custom option not found');
    }
    fireEvent.click(customOption);

    expect(onChange).toHaveBeenCalledWith('');
  });

  test('should call onChange when typing in custom cron field', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});

    render(<SchedulerCronField value="0 5 * * *" onChange={onChange} />);

    const textField = screen.getByRole('textbox', {
      name: /Custom cron expression/,
    });
    fireEvent.change(textField, {target: {value: '0 3 * * 1'}});

    // TextField passes both value and name to onChange
    expect(onChange).toHaveBeenCalledWith('0 3 * * 1', 'schedulerCronTime');
  });

  test('should render disabled state', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});

    render(
      <SchedulerCronField disabled value="0 * * * *" onChange={onChange} />,
    );

    const selectInput = getSelectElement();
    expect(selectInput).toBeDisabled();
  });

  test('should render disabled custom cron field', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});

    render(
      <SchedulerCronField disabled value="0 5 * * *" onChange={onChange} />,
    );

    const textField = screen.getByRole('textbox', {
      name: /Custom cron expression/,
    });
    expect(textField).toBeDisabled();
  });

  test('should render with custom name and title', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});

    render(
      <SchedulerCronField
        name="customName"
        title="Custom Schedule Title"
        value="0 * * * *"
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Custom Schedule Title')).toBeInTheDocument();
  });

  test('should render all predefined schedules in dropdown', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});

    render(<SchedulerCronField value="0 * * * *" onChange={onChange} />);

    const selectInput = getSelectElement();
    fireEvent.click(selectInput);

    // Check for all predefined schedule labels
    expect(screen.getByText('Every hour')).toBeInTheDocument();
    expect(screen.getByText('Every 2 hours')).toBeInTheDocument();
    expect(screen.getByText('Every 4 hours')).toBeInTheDocument();
    expect(screen.getByText('Every 6 hours')).toBeInTheDocument();
    expect(screen.getByText('Every 8 hours')).toBeInTheDocument();
    expect(screen.getByText('Every 12 hours')).toBeInTheDocument();
    expect(screen.getByText('Daily at midnight')).toBeInTheDocument();
    expect(screen.getByText('Daily at noon')).toBeInTheDocument();
    expect(screen.getByText('Daily at 6 AM and 6 PM')).toBeInTheDocument();
    expect(screen.getByText('Weekly (Sunday at midnight)')).toBeInTheDocument();
    expect(
      screen.getByText('Monthly (1st day at midnight)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Every 2nd day at midnight and noon'),
    ).toBeInTheDocument();
    expect(screen.getByText('Custom cron expression')).toBeInTheDocument();
  });

  test('should not call onChange when switching to custom if already custom', () => {
    const onChange = testing.fn();
    const activeCronExpression = '0 3 * * 1';
    const {render} = rendererWith({});

    render(
      <SchedulerCronField
        activeCronExpression={activeCronExpression}
        value={activeCronExpression}
        onChange={onChange}
      />,
    );

    // Should show custom input already
    expect(
      screen.getByRole('textbox', {
        name: /Custom cron expression/,
      }),
    ).toBeInTheDocument();

    const selectInput = getSelectElement();
    fireEvent.click(selectInput);

    const customOptions = screen.getAllByText('Custom cron expression');
    const customOption = customOptions.at(-1);
    if (!customOption) {
      throw new Error('Custom option not found');
    }
    fireEvent.click(customOption);

    // onChange should not be called because value is already custom
    expect(onChange).not.toHaveBeenCalled();
  });

  test('should display help content with cron format information', () => {
    const onChange = testing.fn();
    const {render} = rendererWith({});

    render(<SchedulerCronField value="0 5 * * *" onChange={onChange} />);

    const helpRegion = screen.getByRole('region', {
      name: 'More info about cron format',
    });
    expect(helpRegion).toBeInTheDocument();

    // The help content is in the InfoTip component
    expect(helpRegion).toBeVisible();
  });
});
