/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import type {WeekDays} from 'gmp/models/event';
import {isDefined} from 'gmp/utils/identity';
import ToggleButton from 'web/components/form/ToggleButton';
import Divider from 'web/components/layout/Divider';
import useTranslation from 'web/hooks/useTranslation';

type WeekDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

interface WeekDaySelectProps {
  name?: string;
  value: WeekDays;
  onChange?: (value: WeekDays, name?: string) => void;
}

const WeekDaySelect = ({name, value, onChange}: WeekDaySelectProps) => {
  const [_] = useTranslation();

  const handleChange = useCallback(
    (val: boolean, valName?: string) => {
      if (!isDefined(onChange)) {
        return;
      }

      const newValue = value.setWeekDay(valName as WeekDay, val);

      if (!newValue.isDefault()) {
        // at least one day must be still selected
        onChange(newValue, name);
      }
    },
    [name, value, onChange],
  );

  return (
    <Divider>
      <ToggleButton
        checked={Boolean(value.monday)}
        name="monday"
        title={_('Monday')}
        onToggle={handleChange}
      >
        {_('Mo.')}
      </ToggleButton>
      <ToggleButton
        checked={Boolean(value.tuesday)}
        name="tuesday"
        title={_('Tuesday')}
        onToggle={handleChange}
      >
        {_('Tu.')}
      </ToggleButton>
      <ToggleButton
        checked={Boolean(value.wednesday)}
        name="wednesday"
        title={_('Wednesday')}
        onToggle={handleChange}
      >
        {_('We.')}
      </ToggleButton>
      <ToggleButton
        checked={Boolean(value.thursday)}
        name="thursday"
        title={_('Thursday')}
        onToggle={handleChange}
      >
        {_('Th.')}
      </ToggleButton>
      <ToggleButton
        checked={Boolean(value.friday)}
        name="friday"
        title={_('Friday')}
        onToggle={handleChange}
      >
        {_('Fr.')}
      </ToggleButton>
      <ToggleButton
        checked={Boolean(value.saturday)}
        name="saturday"
        title={_('Saturday')}
        onToggle={handleChange}
      >
        {_('Sa.')}
      </ToggleButton>
      <ToggleButton
        checked={Boolean(value.sunday)}
        name="sunday"
        title={_('Sunday')}
        onToggle={handleChange}
      >
        {_('Su.')}
      </ToggleButton>
    </Divider>
  );
};

export default WeekDaySelect;
