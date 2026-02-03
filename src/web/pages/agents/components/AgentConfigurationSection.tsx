/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import NumberField from 'web/components/form/NumberField';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import Column from 'web/components/layout/Column';
import Section from 'web/components/section/Section';
import ComponentWithToggletip from 'web/components/toggletip/ComponentWithToggletip';
import useTranslation from 'web/hooks/useTranslation';

interface AgentConfigurationSectionProps {
  activeCronExpression: string;
  hidePort?: boolean;
  port?: number;
  schedulerCronExpression?: string;
  intervalInSeconds?: number;
  onValueChange: (value: string | number | boolean, name?: string) => void;
}

export const DEFAULT_HEARTBEAT_INTERVAL = 300; // 5 minutes
export const DEFAULT_CRON_EXPRESSION = '0 */12 * * *';

const AgentConfigurationSection = ({
  activeCronExpression,
  hidePort = false,
  intervalInSeconds = DEFAULT_HEARTBEAT_INTERVAL,
  port,
  schedulerCronExpression = DEFAULT_CRON_EXPRESSION,
  onValueChange,
}: AgentConfigurationSectionProps) => {
  const [_] = useTranslation();

  const PREDEFINED_CRON_SCHEDULES = [
    {
      label: _('Every hour'),
      value: '0 * * * *',
    },
    {
      label: _('Every 2 hours'),
      value: '0 */2 * * *',
    },
    {
      label: _('Every 4 hours'),
      value: '0 */4 * * *',
    },
    {
      label: _('Every 6 hours'),
      value: '0 */6 * * *',
    },
    {
      label: _('Every 8 hours'),
      value: '0 */8 * * *',
    },
    {
      label: _('Every 12 hours'),
      value: '0 */12 * * *',
    },
    {
      label: _('Daily at midnight'),
      value: '0 0 * * *',
    },
    {
      label: _('Daily at noon'),
      value: '0 12 * * *',
    },
    {
      label: _('Daily at 6 AM and 6 PM'),
      value: '0 6,18 * * *',
    },
    {
      label: _('Weekly (Sunday at midnight)'),
      value: '0 0 * * 0',
    },
    {
      label: _('Monthly (1st day at midnight)'),
      value: '0 0 1 * *',
    },
    {
      label: _('Every 2nd day at midnight and noon'),
      value: '0 0,12 1 */2 *',
    },
  ];

  const cronScheduleItems = [
    ...PREDEFINED_CRON_SCHEDULES,
    {
      label: _('Custom cron expression'),
      value: '__custom__',
    },
  ];

  const isCurrentValueCustom = !PREDEFINED_CRON_SCHEDULES.some(
    item => item.value === schedulerCronExpression,
  );

  const isActiveCronCustom = !PREDEFINED_CRON_SCHEDULES.some(
    item => item.value === activeCronExpression,
  );

  const handleSelectChange = (value, name) => {
    if (value === '__custom__') {
      // When selecting custom, restore the original custom value if it exists
      // This preserves the user's custom cron expression when switching back from predefined
      if (!isCurrentValueCustom) {
        // If the active/original value was custom, restore it; otherwise use empty string
        const restoredValue = isActiveCronCustom ? activeCronExpression : '';
        onValueChange(restoredValue, name);
      }
      // If already custom, do nothing - TextField will show with current value
    } else {
      // User selected a predefined schedule, update the value
      onValueChange(value, name);
    }
  };

  const cronHelp = [
    `${_('Enter a custom cron expression.')}`,
    `${_('Format: minute hour day month weekday')}  `,
    `${_('Example')}: 0 0,12 1 */2 * (at midnight and noon on the 1st day of every 2nd month)`,
    `${_('Minute')}: 0-59, ${_('Hour')}: 0-23, ${_('Day')}: 1-31, ${_('Month')}: 1-12, ${_('Weekday')}: 0-7`,
    `* = ${_('any value')}, , = ${_('list separator')}, - = ${_('range')}, / = ${_('step values')}`,
  ].join('\n');

  return (
    <Section title={_('Configuration Details')}>
      <Column gap="lg">
        {/* Port configuration */}
        {!hidePort && (
          <NumberField
            disabled
            max={65535}
            min={1}
            name="port"
            title={_('Port')}
            type="int"
            value={port}
            onChange={onValueChange}
          />
        )}

        {/* Scheduler Options */}
        <Column gap="md">
          <Select
            description={_(
              "Choose from the dropdown of common schedules, or select 'Custom cron expression' in the list to enter your own cron schedule.",
            )}
            items={cronScheduleItems}
            label="Scheduler Options"
            name="schedulerCronExpression"
            placeholder={_('Select a schedule')}
            title={_('Schedule')}
            value={
              isCurrentValueCustom ? '__custom__' : schedulerCronExpression
            }
            onChange={handleSelectChange}
          />

          {isCurrentValueCustom && (
            <ComponentWithToggletip
              dataTestId="cron-help-toggletip"
              helpAriaLabel={_('More info about cron format')}
              helpContent={cronHelp}
              slot={
                <TextField
                  name="schedulerCronExpression"
                  placeholder="0 0,12 1 */2 *"
                  title={_('Custom cron expression')}
                  value={schedulerCronExpression}
                  onChange={onValueChange}
                />
              }
            />
          )}
        </Column>

        {/* Heartbeat Configuration */}
        <NumberField
          min={1}
          name="intervalInSeconds"
          title={_('Heartbeat Interval (seconds)')}
          type="int"
          value={intervalInSeconds}
          onChange={onValueChange}
        />
      </Column>
    </Section>
  );
};

export default AgentConfigurationSection;
