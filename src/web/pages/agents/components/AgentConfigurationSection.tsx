/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';

import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import NumberField from 'web/components/form/NumberField';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import Column from 'web/components/layout/Column';
import Section from 'web/components/section/Section';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/Theme';

interface AgentConfigurationSectionProps {
  hidePort?: boolean;
  port?: number;
  schedulerCronExpression?: string;
  useAdvancedCron?: boolean;
  intervalInSeconds?: number;
  activeCronExpression?: string;
  onValueChange: (value: string | number | boolean, name?: string) => void;
}

export const DEFAULT_HEARTBEAT_INTERVAL = 300; // 5 minutes
export const DEFAULT_CRON_EXPRESSION = '0 */12 * * *';

const ActiveExpressionContainer = styled.div`
  margin-top: 8px;
  padding: 8px;
  background-color: ${Theme.lightGray};
  border: 1px solid ${Theme.mediumGray};
  border-radius: 4px;
`;

const ActiveExpressionCode = styled.code`
  background-color: ${Theme.white};
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
`;

const AgentConfigurationSection = ({
  activeCronExpression,
  hidePort = false,
  intervalInSeconds = DEFAULT_HEARTBEAT_INTERVAL,
  port,
  schedulerCronExpression = DEFAULT_CRON_EXPRESSION,
  useAdvancedCron = false,
  onValueChange,
}: AgentConfigurationSectionProps) => {
  const [_] = useTranslation();

  const cronScheduleItems = [
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

        {/* Scheduler Cron Time */}
        <FormGroup title={_('Scheduler Settings')}>
          <Column gap="md">
            <Checkbox
              checked={useAdvancedCron}
              name="useAdvancedCron"
              title={_('Use advanced cron expression')}
              onChange={onValueChange}
            />
            <ActiveExpressionContainer>
              <strong>{_('Active Scheduler Cron Expression')}:</strong>
              <ActiveExpressionCode>
                {activeCronExpression}
              </ActiveExpressionCode>
            </ActiveExpressionContainer>
            {!useAdvancedCron ? (
              <>
                <Select
                  description={_(
                    'Choose from common scheduling options above, or enable advanced mode for custom expressions.',
                  )}
                  items={cronScheduleItems}
                  label="Scheduler Cron Expression"
                  name="schedulerCronExpression"
                  placeholder={_('Select a schedule')}
                  title={_('Schedule')}
                  value={schedulerCronExpression}
                  onChange={onValueChange}
                />
              </>
            ) : (
              <TextField
                description={
                  <>
                    {_(
                      'Enter a custom cron expression. Format: minute hour day month weekday',
                    )}
                    <br />• {_('Example')}: 0 0,12 1 */2 * (at midnight and noon
                    on the 1st day of every 2nd month)
                    <br />• {_('Minute')}: 0-59, {_('Hour')}: 0-23, {_('Day')}:
                    1-31, {_('Month')}: 1-12, {_('Weekday')}: 0-7
                    <br />• * = {_('any value')}, , = {_('list separator')}, - ={' '}
                    {_('range')}, / = {_('step values')}
                  </>
                }
                name="schedulerCronExpression"
                placeholder="0 0,12 1 */2 *"
                title={_('Custom Cron Expression')}
                value={schedulerCronExpression}
                onChange={onValueChange}
              />
            )}
          </Column>
        </FormGroup>

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
