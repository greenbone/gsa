/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {type SchedulerCronEntry} from 'gmp/models/scanner';
import NumberField from 'web/components/form/NumberField';
import SchedulerCronField from 'web/components/form/SchedulerCronField';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

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

interface SchedulerCronEntryFieldsProps {
  value: SchedulerCronEntry;
  activeCronExpression?: string;
  disabled?: boolean;
  name: string;
  maxDelayName?: string;
  scheduleNumber?: number;
  onChange: (value: SchedulerCronEntry) => void;
}

const SchedulerCronEntryFields = ({
  value,
  activeCronExpression,
  disabled = false,
  name,
  maxDelayName = `${name}-maxDelay`,
  scheduleNumber,
  onChange,
}: SchedulerCronEntryFieldsProps) => {
  const [_] = useTranslation();

  return (
    <Column flex={1} gap="xs" style={{minWidth: 0}}>
      {scheduleNumber !== undefined && (
        <ScheduleLabel>
          {_('Schedule {{number}}', {number: scheduleNumber})}
        </ScheduleLabel>
      )}
      <SchedulerCronField
        compact
        activeCronExpression={activeCronExpression}
        disabled={disabled}
        name={name}
        value={value.cron}
        onChange={cron => onChange({...value, cron})}
      />
      <NumberField
        allowEmpty={false}
        disabled={disabled}
        min={0}
        name={maxDelayName}
        title={_('Max delay (seconds)')}
        type="int"
        value={value.maxDelaySeconds}
        onChange={maxDelaySeconds => onChange({...value, maxDelaySeconds})}
      />
    </Column>
  );
};

export default SchedulerCronEntryFields;
