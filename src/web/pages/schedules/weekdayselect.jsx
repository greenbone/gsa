/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {WeekDays} from 'gmp/models/event';
import {isDefined} from 'gmp/utils/identity';
import React, {useCallback} from 'react';
import ToggleButton from 'web/components/form/togglebutton';
import Divider from 'web/components/layout/divider';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/proptypes';

export const WeekDaysPropType = PropTypes.instanceOf(WeekDays);

const WeekDaySelect = ({name, value, onChange}) => {
  const [_] = useTranslation();
  const handleChange = useCallback(
    (val, valName) => {
      if (!isDefined(onChange)) {
        return;
      }

      const newValue = value.setWeekDay(valName, val);

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
        checked={value.monday}
        name="monday"
        title={_('Monday')}
        onToggle={handleChange}
      >
        {_('Mo.')}
      </ToggleButton>
      <ToggleButton
        checked={value.tuesday}
        name="tuesday"
        title={_('Tuesday')}
        onToggle={handleChange}
      >
        {_('Tu.')}
      </ToggleButton>
      <ToggleButton
        checked={value.wednesday}
        name="wednesday"
        title={_('Wednesday')}
        onToggle={handleChange}
      >
        {_('We.')}
      </ToggleButton>
      <ToggleButton
        checked={value.thursday}
        name="thursday"
        title={_('Thursday')}
        onToggle={handleChange}
      >
        {_('Th.')}
      </ToggleButton>
      <ToggleButton
        checked={value.friday}
        name="friday"
        title={_('Friday')}
        onToggle={handleChange}
      >
        {_('Fr.')}
      </ToggleButton>
      <ToggleButton
        checked={value.saturday}
        name="saturday"
        title={_('Saturday')}
        onToggle={handleChange}
      >
        {_('Sa.')}
      </ToggleButton>
      <ToggleButton
        checked={value.sunday}
        name="sunday"
        title={_('Sunday')}
        onToggle={handleChange}
      >
        {_('Su.')}
      </ToggleButton>
    </Divider>
  );
};

WeekDaySelect.propTypes = {
  name: PropTypes.string,
  value: WeekDaysPropType,
  onChange: PropTypes.func,
};

export default WeekDaySelect;
