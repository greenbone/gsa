/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode, useState} from 'react';
import styled from 'styled-components';
import {type SchedulerCronEntry} from 'gmp/models/scanner';
import SchedulerCronEntryFields, {
  SchedulerCronCard,
} from 'web/components/form/SchedulerCronEntryFields';
import SchedulerCronGroup from 'web/components/form/SchedulerCronGroup';
import {PlusIcon, XIcon} from 'web/components/icon';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

interface SchedulerCronFieldsProps {
  value: SchedulerCronEntry[];
  activeCronExpressions?: string[];
  onChange: (value: SchedulerCronEntry[]) => void;
  disabled?: boolean;
  name?: string;
  title?: ReactNode;
  infoTip?: ReactNode;
  infoTipAriaLabel?: string;
}

interface SchedulerCronRow {
  id: number;
  activeCronExpression: string | undefined;
}

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

  const handleChange = (index: number, newValue: SchedulerCronEntry) => {
    onChange(
      value.map((entry, entryIndex) =>
        entryIndex === index ? newValue : entry,
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
    <SchedulerCronGroup
      infoTip={infoTip}
      infoTipAriaLabel={infoTipAriaLabel}
      title={title}
    >
      <Column gap="sm">
        {displayedRows.map((row, index) => (
          <SchedulerCronCard key={row.id}>
            <SchedulerCronEntryFields
              activeCronExpression={row.activeCronExpression}
              disabled={disabled}
              maxDelayName={`${name}-maxDelay-${row.id}`}
              name={`${name}-${row.id}`}
              scheduleNumber={index + 1}
              value={value[index]}
              onChange={newValue => handleChange(index, newValue)}
            />
            <XIcon
              aria-label={_('Remove schedule {{number}}', {
                number: index + 1,
              })}
              disabled={disabled || value.length <= 1}
              title={_('Remove schedule')}
              onClick={() => handleRemove(index)}
            />
          </SchedulerCronCard>
        ))}
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
      </Column>
    </SchedulerCronGroup>
  );
};

export default SchedulerCronFields;
