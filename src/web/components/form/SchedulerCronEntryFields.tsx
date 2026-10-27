/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactNode} from 'react';
import {type SchedulerCronEntry} from 'gmp/models/scanner';
import NumberField from 'web/components/form/NumberField';
import SchedulerCronField from 'web/components/form/SchedulerCronField';
import SchedulerCronLabel from 'web/components/form/SchedulerCronLabel';
import HighlightBox from 'web/components/highlight-box';
import Column from 'web/components/layout/Column';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';

export const SchedulerCronCard = ({children}: {children: ReactNode}) => (
  <HighlightBox>
    <Row align="center" gap="sm">
      {children}
    </Row>
  </HighlightBox>
);

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
        <SchedulerCronLabel number={scheduleNumber} />
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
