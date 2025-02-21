/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {parseInt} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import React, {useCallback} from 'react';
import ToggleButton from 'web/components/form/ToggleButton';
import Divider from 'web/components/layout/Divider';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const RANGE = [1, 2, 3, 4, 5, 6, 7];
const ROWS = [0, 1, 2, 3];

const MonthDaysSelect = ({disabled, onChange, value = [], name}) => {
  const [_] = useTranslation();

  const handleChange = useCallback(
    (val, valName) => {
      if (!isDefined(onChange)) {
        return;
      }

      const day = parseInt(valName);

      let newValue;
      if (val && !value.includes(day)) {
        newValue = [...value, day];
      } else if (!val && value.includes(day)) {
        newValue = value.filter(v => v !== day);
      } else {
        newValue = value;
      }

      if (newValue.length > 0) {
        // at least one day must be still selected
        onChange(newValue, name);
      }
    },
    [name, value, onChange],
  );

  return (
    <Divider flex="column">
      {ROWS.map(j => (
        <Divider key={j}>
          {RANGE.map(i => {
            const k = j * 7 + i;
            return (
              <ToggleButton
                key={k}
                checked={value.includes(k)}
                disabled={disabled}
                name={'' + k}
                onToggle={handleChange}
              >
                {k}
              </ToggleButton>
            );
          })}
        </Divider>
      ))}
      <Divider>
        <ToggleButton
          checked={value.includes(29)}
          disabled={disabled}
          name="29"
          onToggle={handleChange}
        >
          29
        </ToggleButton>
        <ToggleButton
          checked={value.includes(30)}
          disabled={disabled}
          name="30"
          onToggle={handleChange}
        >
          30
        </ToggleButton>
        <ToggleButton
          checked={value.includes(31)}
          disabled={disabled}
          name="31"
          onToggle={handleChange}
        >
          31
        </ToggleButton>
        <ToggleButton
          checked={value.includes(-1)}
          disabled={disabled}
          name="-1"
          width="64px"
          onToggle={handleChange}
        >
          {_('Last Day')}
        </ToggleButton>
      </Divider>
    </Divider>
  );
};

MonthDaysSelect.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func,
};

export default MonthDaysSelect;
