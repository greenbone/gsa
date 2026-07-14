/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import date, {type Date} from 'gmp/models/date';
import {
  ACTIVE_NO_VALUE,
  ACTIVE_YES_ALWAYS_VALUE,
  ACTIVE_YES_FOR_NEXT_VALUE,
  ACTIVE_YES_UNTIL_VALUE,
  DEFAULT_DAYS,
  type Active,
} from 'gmp/models/override';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import DatePicker from 'web/components/form/DatePicker';
import FormGroup from 'web/components/form/FormGroup';
import Radio from 'web/components/form/Radio';
import Row from 'web/components/layout/Row';
import useTranslation from 'web/hooks/useTranslation';

export interface ActiveItem {
  endTime?: Date;
  isActive: () => boolean;
}

interface ActiveFormGroupProps {
  active?: Active;
  isEdit?: boolean;
  item?: ActiveItem;
  onValueChange: (value: string | number, name?: string) => void;
}

export const computeDaysUntil = (targetDate: Date): number =>
  Math.max(1, targetDate.startOf('day').diff(date().startOf('day'), 'day'));

export const handleEndDateChange = (
  newDate: Date,
  setEndDate: (date: Date) => void,
  onValueChange: (value: number, name: string) => void,
) => {
  setEndDate(newDate);
  onValueChange(computeDaysUntil(newDate), 'days');
};

const ActiveFormGroup = ({
  active,
  isEdit = false,
  item,
  onValueChange,
}: ActiveFormGroupProps) => {
  const [_] = useTranslation();

  const [endDate, setEndDate] = useState(() =>
    isDefined(item?.endTime) ? item.endTime : date().add(DEFAULT_DAYS, 'day'),
  );

  return (
    <FormGroup data-testid="group-active" title={_('Active')}>
      <Radio
        checked={active === ACTIVE_YES_ALWAYS_VALUE}
        name="active"
        title={_('yes, always')}
        value={ACTIVE_YES_ALWAYS_VALUE}
        onChange={onValueChange}
      />
      {isEdit &&
        isDefined(item) &&
        item.isActive() &&
        isDefined(item.endTime) && (
          <Row>
            <Radio
              checked={active === ACTIVE_YES_UNTIL_VALUE}
              name="active"
              title={_('yes, until')}
              value={ACTIVE_YES_UNTIL_VALUE}
              onChange={onValueChange}
            />
            <DateTime date={item.endTime} />
          </Row>
        )}
      <Row>
        <Radio
          checked={active === ACTIVE_YES_FOR_NEXT_VALUE}
          name="active"
          title={_('yes, until')}
          value={ACTIVE_YES_FOR_NEXT_VALUE}
          onChange={onValueChange}
        />
        <DatePicker
          disabled={active !== ACTIVE_YES_FOR_NEXT_VALUE}
          minDate={date()}
          name="endDate"
          value={endDate}
          onChange={newDate =>
            handleEndDateChange(newDate, setEndDate, onValueChange)
          }
        />
      </Row>
      <Radio
        checked={active === ACTIVE_NO_VALUE}
        name="active"
        title={_('no')}
        value={ACTIVE_NO_VALUE}
        onChange={onValueChange}
      />
    </FormGroup>
  );
};

export default ActiveFormGroup;
