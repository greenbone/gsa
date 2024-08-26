/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback} from 'react';

import {isDefined} from 'gmp/utils/identity';

import {WeekDays} from 'gmp/models/event';

import Divider from 'web/components/layout/divider';

import ToggleButton from 'web/components/form/togglebutton';

import PropTypes from 'web/utils/proptypes';

import useTranslation from 'web/hooks/useTranslation';

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
        name="monday"
        title={_('Monday')}
        checked={value.monday}
        onToggle={handleChange}
      >
        {_('Mo.')}
      </ToggleButton>
      <ToggleButton
        name="tuesday"
        title={_('Tuesday')}
        checked={value.tuesday}
        onToggle={handleChange}
      >
        {_('Tu.')}
      </ToggleButton>
      <ToggleButton
        name="wednesday"
        title={_('Wednesday')}
        checked={value.wednesday}
        onToggle={handleChange}
      >
        {_('We.')}
      </ToggleButton>
      <ToggleButton
        name="thursday"
        title={_('Thursday')}
        checked={value.thursday}
        onToggle={handleChange}
      >
        {_('Th.')}
      </ToggleButton>
      <ToggleButton
        name="friday"
        title={_('Friday')}
        checked={value.friday}
        onToggle={handleChange}
      >
        {_('Fr.')}
      </ToggleButton>
      <ToggleButton
        name="saturday"
        title={_('Saturday')}
        checked={value.saturday}
        onToggle={handleChange}
      >
        {_('Sa.')}
      </ToggleButton>
      <ToggleButton
        name="sunday"
        title={_('Sunday')}
        checked={value.sunday}
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

// vim: set ts=2 sw=2 tw=80:
