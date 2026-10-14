/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ComponentProps, useState} from 'react';
import {Text} from '@mantine/core';
import FormGroup from 'web/components/form/FormGroup';
import SchedulerCronField from 'web/components/form/SchedulerCronField';
import {PlusIcon, XIcon} from 'web/components/icon';
import InfoTip from 'web/components/info-tip/InfoTip';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';

interface SchedulerCronFieldsProps extends Omit<
  ComponentProps<typeof SchedulerCronField>,
  'value' | 'onChange' | 'activeCronExpression' | 'compact'
> {
  value: string[];
  activeCronExpressions?: string[];
  onChange: (value: string[]) => void;
}

interface SchedulerCronRow {
  id: number;
  activeCronExpression: string | undefined;
}

const SchedulerCronFields = ({
  value,
  activeCronExpressions = [],
  onChange,
  disabled = false,
  name = 'schedulerCronTimes',
  title,
  infoTip,
  infoTipAriaLabel,
}: SchedulerCronFieldsProps) => {
  const [_] = useTranslation();

  const [rows, setRows] = useState<SchedulerCronRow[]>(() =>
    value.map((_, index) => ({
      id: index,
      activeCronExpression: activeCronExpressions[index],
    })),
  );

  let nextRowId = Math.max(-1, ...rows.map(row => row.id)) + 1;
  const displayedRows = value.map(
    (_, index) =>
      rows[index] ?? {
        id: nextRowId++,
        activeCronExpression: activeCronExpressions[index],
      },
  );

  const handleChange = (index: number, newValue: string) => {
    onChange(
      value.map((cron, cronIndex) => (cronIndex === index ? newValue : cron)),
    );
  };

  const handleRemove = (index: number) => {
    setRows(displayedRows.filter((_, rowIndex) => rowIndex !== index));
    onChange(value.filter((_, cronIndex) => cronIndex !== index));
  };

  const handleAdd = () => {
    setRows([
      ...displayedRows,
      {
        id: nextRowId,
        activeCronExpression: undefined,
      },
    ]);
    onChange([...value, '0 * * * *']);
  };

  return (
    <FormGroup
      gap="xs"
      title={
        <>
          {title || _('Scheduler Options')}
          {infoTip && (
            <InfoTip ariaLabel={infoTipAriaLabel ?? _('More information')}>
              {infoTip}
            </InfoTip>
          )}
        </>
      }
    >
      <Text c="dimmed" size="xs">
        {_(
          "Choose from the dropdown of common schedules, or select 'Custom cron expression' in the list to enter your own cron schedule.",
        )}
      </Text>
      <Column gap="sm">
        {displayedRows.map((row, index) => (
          <Row key={row.id} align="flex-start" gap="sm">
            <Column flex={1} style={{minWidth: 0}}>
              <SchedulerCronField
                compact
                activeCronExpression={row.activeCronExpression}
                disabled={disabled}
                name={`${name}-${row.id}`}
                value={value[index] ?? ''}
                onChange={newValue => handleChange(index, newValue)}
              />
            </Column>
            <XIcon
              aria-label={_('Remove schedule {{number}}', {number: index + 1})}
              disabled={disabled || value.length <= 1}
              mt={8}
              title={_('Remove schedule')}
              onClick={() => handleRemove(index)}
            />
          </Row>
        ))}
        <Row>
          <PlusIcon
            aria-label={_('Add schedule')}
            disabled={disabled}
            title={_('Add schedule')}
            onClick={handleAdd}
          />
        </Row>
      </Column>
    </FormGroup>
  );
};

export default SchedulerCronFields;
