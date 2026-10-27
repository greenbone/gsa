/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import styled from 'styled-components';
import {type SchedulerCronEntry} from 'gmp/models/scanner';
import FormGroup from 'web/components/form/FormGroup';
import NumberField from 'web/components/form/NumberField';
import SchedulerCronField, {
  type SchedulerCronFieldProps,
} from 'web/components/form/SchedulerCronField';
import {PlusIcon, XIcon} from 'web/components/icon';
import InfoTip from 'web/components/info-tip/InfoTip';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

interface SchedulerCronFieldsProps extends Omit<
  SchedulerCronFieldProps,
  'value' | 'onChange' | 'activeCronExpression' | 'compact'
> {
  value: SchedulerCronEntry[];
  activeCronExpressions?: string[];
  onChange: (value: SchedulerCronEntry[]) => void;
  allowMultipleSchedules?: boolean;
}

interface SchedulerCronRow {
  id: number;
  activeCronExpression: string | undefined;
}

const Description = styled.p`
  margin: 0;
  color: ${Theme.mediumGray};
  font-size: var(--mantine-font-size-xs);
`;

export const SchedulerCronCard = styled(Row)`
  align-items: center;
  gap: var(--mantine-spacing-sm);
  padding: var(--mantine-spacing-sm);
  border: 1px solid var(--mantine-color-gray-3);
  border-radius: 4px;
  background: var(--mantine-color-gray-0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
`;

const ScheduleLabel = styled.div`
  margin-bottom: 2px;
  color: ${Theme.mediumGray};
  font-size: var(--mantine-font-size-xs);
  font-weight: 500;
`;

const AddScheduleButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: 1px solid ${Theme.inputBorderGray};
  border-radius: 4px;
  background: ${Theme.white};
  color: ${Theme.darkGray};
  font: inherit;
  font-size: var(--mantine-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    border-color 120ms ease;

  &:hover {
    border-color: ${Theme.green};
    background: ${Theme.dialogGray};
  }

  &:focus-visible {
    outline: 2px solid ${Theme.blue};
    outline-offset: 2px;
  }

  &:disabled {
    border-color: ${Theme.lightGray};
    background: ${Theme.dialogGray};
    color: ${Theme.mediumGray};
    cursor: not-allowed;
  }
`;

const SchedulerCronFields = ({
  value,
  activeCronExpressions = [],
  onChange,
  disabled = false,
  name = 'schedulerCronTimes',
  title,
  infoTip,
  infoTipAriaLabel,
  allowMultipleSchedules = true,
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
      value.map((entry, entryIndex) =>
        entryIndex === index ? {...entry, cron: newValue} : entry,
      ),
    );
  };

  const handleMaxDelayChange = (index: number, newValue: number) => {
    onChange(
      value.map((entry, entryIndex) =>
        entryIndex === index ? {...entry, maxDelaySeconds: newValue} : entry,
      ),
    );
  };

  const handleRemove = (index: number) => {
    setRows(displayedRows.filter((_, rowIndex) => rowIndex !== index));
    onChange(value.filter((_, entryIndex) => entryIndex !== index));
  };

  const handleAdd = () => {
    setRows([
      ...displayedRows,
      {
        id: nextRowId,
        activeCronExpression: undefined,
      },
    ]);
    onChange([...value, {cron: '0 * * * *', maxDelaySeconds: 0}]);
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
      <Description>
        {_(
          "Choose from the dropdown of common schedules, or select 'Custom cron expression' in the list to enter your own cron schedule.",
        )}
      </Description>
      <Column gap="sm">
        {displayedRows.map((row, index) => (
          <SchedulerCronCard key={row.id}>
            <Column flex={1} gap="xs" style={{minWidth: 0}}>
              <ScheduleLabel>
                {_('Schedule {{number}}', {number: index + 1})}
              </ScheduleLabel>
              <SchedulerCronField
                compact
                activeCronExpression={row.activeCronExpression}
                disabled={disabled}
                name={`${name}-${row.id}`}
                value={value[index]?.cron ?? ''}
                onChange={newValue => handleChange(index, newValue)}
              />
              <NumberField
                allowEmpty={false}
                disabled={disabled}
                min={0}
                name={`${name}-maxDelay-${row.id}`}
                title={_('Max delay (seconds)')}
                type="int"
                value={value[index]?.maxDelaySeconds ?? 0}
                onChange={newValue => handleMaxDelayChange(index, newValue)}
              />
            </Column>
            {allowMultipleSchedules && (
              <XIcon
                aria-label={_('Remove schedule {{number}}', {
                  number: index + 1,
                })}
                disabled={disabled || value.length <= 1}
                title={_('Remove schedule')}
                onClick={() => handleRemove(index)}
              />
            )}
          </SchedulerCronCard>
        ))}
        {allowMultipleSchedules && (
          <Row justify="center" style={{marginTop: 4}}>
            <AddScheduleButton
              aria-label={_('Add schedule')}
              disabled={disabled}
              title={_('Add schedule')}
              type="button"
              onClick={handleAdd}
            >
              <PlusIcon size={['16px', '16px']} />
              {_('Add another schedule')}
            </AddScheduleButton>
          </Row>
        )}
      </Column>
    </FormGroup>
  );
};

export default SchedulerCronFields;
