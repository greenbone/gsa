/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import {WeekDays} from 'gmp/models/event';

import Divider from 'web/components/layout/divider';

import ToggleButton from 'web/components/form/togglebutton';

import PropTypes from 'web/utils/proptypes';

export const WeekDaysPropType = PropTypes.instanceOf(WeekDays);

class WeekDaySelect extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(val, valname) {
    const {onChange, value, name} = this.props;

    if (!isDefined(onChange)) {
      return;
    }

    const newValue = value.setWeekDay(valname, val);

    if (!newValue.isDefault()) {
      // at least one day must be still selected
      onChange(newValue, name);
    }
  }

  render() {
    const {value} = this.props;
    return (
      <Divider>
        <ToggleButton
          name="monday"
          title={_('Monday')}
          checked={value.monday}
          onToggle={this.handleChange}
        >
          {_('Mo.')}
        </ToggleButton>
        <ToggleButton
          name="tuesday"
          title={_('Tuesday')}
          checked={value.tuesday}
          onToggle={this.handleChange}
        >
          {_('Tu.')}
        </ToggleButton>
        <ToggleButton
          name="wednesday"
          title={_('Wednesday')}
          checked={value.wednesday}
          onToggle={this.handleChange}
        >
          {_('We.')}
        </ToggleButton>
        <ToggleButton
          name="thursday"
          title={_('Thursday')}
          checked={value.thursday}
          onToggle={this.handleChange}
        >
          {_('Th.')}
        </ToggleButton>
        <ToggleButton
          name="friday"
          title={_('Friday')}
          checked={value.friday}
          onToggle={this.handleChange}
        >
          {_('Fr.')}
        </ToggleButton>
        <ToggleButton
          name="saturday"
          title={_('Saturday')}
          checked={value.saturday}
          onToggle={this.handleChange}
        >
          {_('Sa.')}
        </ToggleButton>
        <ToggleButton
          name="sunday"
          title={_('Sunday')}
          checked={value.sunday}
          onToggle={this.handleChange}
        >
          {_('Su.')}
        </ToggleButton>
      </Divider>
    );
  }
}

WeekDaySelect.propTypes = {
  name: PropTypes.string,
  value: WeekDaysPropType,
  onChange: PropTypes.func,
};

export default WeekDaySelect;

// vim: set ts=2 sw=2 tw=80:
