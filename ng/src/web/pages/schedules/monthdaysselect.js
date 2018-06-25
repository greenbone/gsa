/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import 'core-js/fn/array/includes';

import React from 'react';

import _ from 'gmp/locale';

import {is_defined} from 'gmp/utils/identity';

import {parse_int} from 'gmp/parser';

import Divider from 'web/components/layout/divider';

import ToggleButton from 'web/components/form/togglebutton';

import PropTypes from 'web/utils/proptypes';

const RANGE = [1, 2, 3, 4, 5, 6, 7];
const ROWS = [0, 1, 2, 3];

class MonthDaysSelect extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(val, valname) {
    const {onChange, value = [], name} = this.props;

    if (!is_defined(onChange)) {
      return;
    }

    const day = parse_int(valname);

    let newValue;
    if (val && !value.includes(day)) {
      newValue = [
        ...value,
        day,
      ];
    }
    else if (!val && value.includes(day)) {
      newValue = value.filter(v => v !== day);
    }
    else {
      newValue = value;
    }

    if (newValue.length > 0) { // at least one day must be still selected
      onChange(newValue, name);
    }
  }

  render() {
    const {
      value = [],
      disabled,
    } = this.props;
    return (
      <Divider flex="column">
        {ROWS.map(j => (
          <Divider key={j}>
            {RANGE.map(i => {
              const k = j * 7 + i;
              return (
                <ToggleButton
                  name={'' + k}
                  key={k}
                  checked={value.includes(k)}
                  disabled={disabled}
                  onToggle={this.handleChange}
                >
                  {k}
                </ToggleButton>
              );
            })}
          </Divider>
        ))}
        <Divider>
          <ToggleButton
            name="29"
            checked={value.includes(29)}
            disabled={disabled}
            onToggle={this.handleChange}
          >
            29
          </ToggleButton>
          <ToggleButton
            name="30"
            checked={value.includes(30)}
            disabled={disabled}
            onToggle={this.handleChange}
          >
            30
          </ToggleButton>
          <ToggleButton
            name="31"
            checked={value.includes(31)}
            disabled={disabled}
            onToggle={this.handleChange}
          >
            31
          </ToggleButton>
          <ToggleButton
            name="-1"
            checked={value.includes(-1)}
            disabled={disabled}
            width="64px"
            onToggle={this.handleChange}
          >
            {_('Last Day')}
          </ToggleButton>
        </Divider>
      </Divider>
    );
  }
}

MonthDaysSelect.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  value: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func,
};

export default MonthDaysSelect;

// vim: set ts=2 sw=2 tw=80:
