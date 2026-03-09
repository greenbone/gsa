/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import FormGroup from 'web/components/form/FormGroup';
import Select from 'web/components/form/Select';
import TextField from 'web/components/form/TextField';
import ComponentWithInfoTip from 'web/components/info-tip/ComponentWithInfoTip';
import InfoTip from 'web/components/info-tip/InfoTip';
import Column from 'web/components/layout/Column';
import useTranslation from 'web/hooks/useTranslation';

interface SchedulerCronFieldProps {
  activeCronExpression?: string;
  name?: string;
  title?: React.ReactNode;
  infoTip?: React.ReactNode;
  infoTipAriaLabel?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const SchedulerCronField = ({
  activeCronExpression,
  name = 'schedulerCronTime',
  title,
  infoTip,
  infoTipAriaLabel,
  value,
  onChange,
  disabled = false,
}: SchedulerCronFieldProps) => {
  const [_] = useTranslation();

  const cronScheduleItems = [
    {label: _('Every hour'), value: '0 * * * *'},
    {label: _('Every 2 hours'), value: '0 */2 * * *'},
    {label: _('Every 4 hours'), value: '0 */4 * * *'},
    {label: _('Every 6 hours'), value: '0 */6 * * *'},
    {label: _('Every 8 hours'), value: '0 */8 * * *'},
    {label: _('Every 12 hours'), value: '0 */12 * * *'},
    {label: _('Daily at midnight'), value: '0 0 * * *'},
    {label: _('Daily at noon'), value: '0 12 * * *'},
    {label: _('Daily at 6 AM and 6 PM'), value: '0 6,18 * * *'},
    {label: _('Weekly (Sunday at midnight)'), value: '0 0 * * 0'},
    {label: _('Monthly (1st day at midnight)'), value: '0 0 1 * *'},
    {label: _('Every 2nd day at midnight and noon'), value: '0 0,12 1 */2 *'},
    {label: _('Custom cron expression'), value: '__custom__'},
  ];

  const isCurrentValueCustom = !cronScheduleItems.some(
    item => item.value === value && item.value !== '__custom__',
  );

  const isActiveCronCustom = activeCronExpression
    ? !cronScheduleItems.some(
        item =>
          item.value === activeCronExpression && item.value !== '__custom__',
      )
    : false;

  const handleSelectChange = (selectedValue: string): void => {
    if (selectedValue === '__custom__') {
      if (!isCurrentValueCustom) {
        const restoredValue = isActiveCronCustom ? activeCronExpression : '';
        onChange(restoredValue || '');
      }
    } else {
      onChange(selectedValue);
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
    <Column gap="md">
      <FormGroup
        title={
          title ? (
            <>
              {title}
              {infoTip && (
                <InfoTip ariaLabel={infoTipAriaLabel ?? _('More information')}>
                  {infoTip}
                </InfoTip>
              )}
            </>
          ) : (
            <>{_('Scheduler Options')}</>
          )
        }
      >
        <Select
          description={_(
            "Choose from the dropdown of common schedules, or select 'Custom cron expression' in the list to enter your own cron schedule.",
          )}
          disabled={disabled}
          items={cronScheduleItems}
          name={name}
          placeholder={_('Select a schedule')}
          value={isCurrentValueCustom ? '__custom__' : value}
          onChange={handleSelectChange}
        />
      </FormGroup>
      {isCurrentValueCustom && (
        <ComponentWithInfoTip
          dataTestId="cron-help-infotip"
          helpAriaLabel={_('More info about cron format')}
          helpContent={cronHelp}
          slot={
            <TextField
              disabled={disabled}
              name={name}
              placeholder="0 0,12 1 */2 *"
              title={_('Custom cron expression')}
              value={value}
              onChange={onChange}
            />
          }
        />
      )}
    </Column>
  );
};

export default SchedulerCronField;
