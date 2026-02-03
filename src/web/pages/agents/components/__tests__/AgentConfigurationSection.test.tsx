/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import AgentConfigurationSection, {
  DEFAULT_CRON_EXPRESSION,
  DEFAULT_HEARTBEAT_INTERVAL,
} from 'web/pages/agents/components/AgentConfigurationSection';
import {getSelectElement} from 'web/testing/custom-queries';

describe('AgentConfigurationSection tests', () => {
  const onValueChange = testing.fn();

  test('should render with default values', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByText('Configuration Details')).toBeInTheDocument();
    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();
    expect(
      screen.getByText('Heartbeat Interval (seconds)'),
    ).toBeInTheDocument();
    expect(
      screen.getByDisplayValue(DEFAULT_HEARTBEAT_INTERVAL),
    ).toBeInTheDocument();
  });

  test('should render port field when hidePort is false', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        port={4442}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByText('Port')).toBeInTheDocument();
    expect(screen.getByDisplayValue('4442')).toBeInTheDocument();
  });

  test('should not render port field when hidePort is true', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        hidePort
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        port={4442}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.queryByText('Port')).not.toBeInTheDocument();
  });

  test('should show Select dropdown with predefined schedules', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        schedulerCronExpression="0 */12 * * *"
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();
    expect(
      screen.getByText(
        "Choose from the dropdown of common schedules, or select 'Custom cron expression' in the list to enter your own cron schedule.",
      ),
    ).toBeInTheDocument();
  });

  test('should show TextField when a custom cron expression is set', () => {
    const customCron = '0 5 * * *'; // Custom cron not in predefined list
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        schedulerCronExpression={customCron}
        onValueChange={onValueChange}
      />,
    );

    // Check the TextField input is rendered (not the Select option)
    expect(
      screen.getByRole('textbox', {
        name: 'Custom cron expression Help Icon',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Enter a custom cron expression/),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('0 0,12 1 */2 *')).toBeInTheDocument();
    expect(screen.getByDisplayValue(customCron)).toBeInTheDocument();
  });

  test('should call onValueChange when heartbeat interval is changed', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        intervalInSeconds={300}
        onValueChange={onValueChange}
      />,
    );

    const input = screen.getByDisplayValue('300');
    fireEvent.change(input, {target: {value: '600'}});

    expect(onValueChange).toHaveBeenCalled();
  });

  test('should render custom cron expression in TextField when schedulerCronExpression is custom', () => {
    const customCron = '0 5 * * *'; // 5 AM daily - not in predefined list
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        schedulerCronExpression={customCron}
        onValueChange={onValueChange}
      />,
    );

    // When schedulerCronExpression is custom, both Select and TextField are shown
    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', {
        name: 'Custom cron expression Help Icon',
      }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(customCron)).toBeInTheDocument();
  });

  test('should restore original custom cron when switching from predefined back to custom', () => {
    const originalCustomCron = '0 3 * * 1'; // 3 AM on Mondays - not in predefined list
    const {render} = rendererWith({});

    const onValueChangeMock = testing.fn();

    render(
      <AgentConfigurationSection
        activeCronExpression={originalCustomCron}
        schedulerCronExpression="0 */12 * * *"
        onValueChange={onValueChangeMock}
      />,
    );

    // Verify we're showing the predefined schedule dropdown
    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Every 12 hours')).toBeInTheDocument();

    // Find the dropdown and select the custom option
    const selectInput = getSelectElement();
    fireEvent.click(selectInput);

    // Find and click the "Custom cron expression" option
    const customOption = screen.getByText('Custom cron expression');
    fireEvent.click(customOption);

    // Verify that onValueChange was called with the original custom cron expression
    expect(onValueChangeMock).toHaveBeenCalledWith(
      originalCustomCron,
      'schedulerCronExpression',
    );
  });

  test('should render predefined schedule when schedulerCronExpression matches a predefined value', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression="30 4 * * *"
        schedulerCronExpression="0 */12 * * *"
        onValueChange={onValueChange}
      />,
    );

    // When schedulerCronExpression matches a predefined schedule, show the Select
    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();
    // The custom TextField input should not be rendered (only the Select dropdown option exists)
    expect(
      screen.queryByRole('textbox', {name: 'Custom cron expression'}),
    ).not.toBeInTheDocument();
  });

  test('should render with custom heartbeat interval value', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        intervalInSeconds={600}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByDisplayValue('600')).toBeInTheDocument();
  });
});
