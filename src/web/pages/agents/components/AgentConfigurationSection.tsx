/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import NumberField from 'web/components/form/NumberField';
import SchedulerCronField from 'web/components/form/SchedulerCronField';
import Column from 'web/components/layout/Column';
import Section from 'web/components/section/Section';
import useTranslation from 'web/hooks/useTranslation';

interface AgentConfigurationSectionProps {
  activeCronExpression: string;
  hidePort?: boolean;
  isEdit?: boolean;
  port?: number;
  schedulerCronExpression?: string;
  intervalInSeconds?: number;
  hideIntervalInSeconds?: boolean;
  onValueChange: (value: string | number | boolean, name?: string) => void;
}

export const DEFAULT_HEARTBEAT_INTERVAL = 300; // 5 minutes
export const DEFAULT_CRON_EXPRESSION = '0 */12 * * *';

const AgentConfigurationSection = ({
  activeCronExpression,
  hidePort = false,
  isEdit = false,
  intervalInSeconds = DEFAULT_HEARTBEAT_INTERVAL,
  hideIntervalInSeconds = false,
  port,
  schedulerCronExpression = DEFAULT_CRON_EXPRESSION,
  onValueChange,
}: AgentConfigurationSectionProps) => {
  const [_] = useTranslation();

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
        <SchedulerCronField
          activeCronExpression={activeCronExpression}
          infoTip={
            isEdit
              ? _(
                  'This will set when the Agents scan the systems.\nA report is not automatically generated and needs to be set up as a "New Agent Task".',
                )
              : undefined
          }
          infoTipAriaLabel={_('More information about scheduler')}
          name="schedulerCronExpression"
          title={_('Scheduler Options')}
          value={schedulerCronExpression ?? ''}
          onChange={value => onValueChange(value, 'schedulerCronExpression')}
        />

        {/* Heartbeat Configuration */}
        {!hideIntervalInSeconds && (
          <NumberField
            min={1}
            name="intervalInSeconds"
            title={_('Heartbeat Interval (seconds)')}
            type="int"
            value={intervalInSeconds}
            onChange={onValueChange}
          />
        )}
      </Column>
    </Section>
  );
};

export default AgentConfigurationSection;
