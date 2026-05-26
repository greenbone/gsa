/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import AgentConfigurationSection, {
  DEFAULT_CRON_EXPRESSION,
  DEFAULT_HEARTBEAT_INTERVAL,
} from 'web/pages/agents/components/AgentConfigurationSection';
import {getSelectElement} from 'web/testing/custom-queries';

describe('AgentConfigurationSection tests', () => {
  const onValueChange = testing.fn();

  beforeEach(() => {
    onValueChange.mockClear();
  });

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

  test('should not render scheduler cron field when hideSchedulerCronField is true', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        hideSchedulerCronField={true}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByText('Configuration Details')).toBeInTheDocument();
    expect(screen.queryByText('Scheduler Options')).not.toBeInTheDocument();

    expect(
      screen.queryByText(
        "Choose from the dropdown of common schedules, or select 'Custom cron expression' in the list to enter your own cron schedule.",
      ),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('textbox', {
        name: /Custom cron expression/,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText('Heartbeat Interval (seconds)'),
    ).toBeInTheDocument();
  });

  test('should not render InfoTip when isEdit is false', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        isEdit={false}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {name: 'More information about scheduler'}),
    ).not.toBeInTheDocument();
  });

  test('should render InfoTip when isEdit is true', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        isEdit={true}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();

    const helpRegion = screen.getByRole('region', {
      name: 'More information about scheduler',
    });
    expect(helpRegion).toBeInTheDocument();
  });

  test('should not render InfoTip when scheduler cron field is hidden', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        hideSchedulerCronField={true}
        isEdit={true}
        onValueChange={onValueChange}
      />,
    );

    expect(screen.queryByText('Scheduler Options')).not.toBeInTheDocument();

    expect(
      screen.queryByRole('region', {
        name: 'More information about scheduler',
      }),
    ).not.toBeInTheDocument();
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
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        hidePort={true}
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
    const customCron = '0 5 * * *';
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        schedulerCronExpression={customCron}
        onValueChange={onValueChange}
      />,
    );

    expect(
      screen.getByRole('textbox', {
        name: /Custom cron expression More info about cron format/,
      }),
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

  test('should restore original custom cron when switching from predefined back to custom', () => {
    const originalCustomCron = '0 3 * * 1';
    const onValueChangeMock = testing.fn();
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={originalCustomCron}
        schedulerCronExpression="0 */12 * * *"
        onValueChange={onValueChangeMock}
      />,
    );

    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Every 12 hours')).toBeInTheDocument();

    const selectInput = getSelectElement();
    fireEvent.click(selectInput);

    const customOption = screen.getByText('Custom cron expression');
    fireEvent.click(customOption);

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

    expect(screen.getByText('Scheduler Options')).toBeInTheDocument();

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

  test('should not render heartbeat interval field when hideIntervalInSeconds is true', () => {
    const {render} = rendererWith({});

    render(
      <AgentConfigurationSection
        activeCronExpression={DEFAULT_CRON_EXPRESSION}
        hideIntervalInSeconds={true}
        onValueChange={onValueChange}
      />,
    );

    expect(
      screen.queryByText('Heartbeat Interval (seconds)'),
    ).not.toBeInTheDocument();
  });
});
