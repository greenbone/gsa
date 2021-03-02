/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';

import Divider from 'web/components/layout/divider';

import PropTypes from 'web/utils/proptypes';

class DeltaStatesFilterGroup extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleDeltaStatesChange = this.handleDeltaStatesChange.bind(this);
  }

  handleDeltaStatesChange(value, state) {
    const {filter, onChange} = this.props;
    let delta_states = filter.get('delta_states');

    if (!delta_states) {
      delta_states = '';
    }

    if (value && !delta_states.includes(state)) {
      delta_states += state;
      onChange(delta_states, 'delta_states');
    } else if (!value && delta_states.includes(state)) {
      delta_states = delta_states.replace(state, '');
      onChange(delta_states, 'delta_states');
    }
  }

  render() {
    const {filter} = this.props;

    let delta_states = filter.get('delta_states');

    if (!isDefined(delta_states)) {
      delta_states = '';
    }
    return (
      <FormGroup title={_('Delta Results')}>
        <Divider>
          <Checkbox
            checked={delta_states.includes('s')}
            name="s"
            onChange={this.handleDeltaStatesChange}
          >
            {_('Same')}
          </Checkbox>
          <Checkbox
            checked={delta_states.includes('n')}
            name="n"
            onChange={this.handleDeltaStatesChange}
          >
            {_('New')}
          </Checkbox>
          <Checkbox
            checked={delta_states.includes('g')}
            name="g"
            onChange={this.handleDeltaStatesChange}
          >
            {_('Gone')}
          </Checkbox>
          <Checkbox
            checked={delta_states.includes('c')}
            name="c"
            onChange={this.handleDeltaStatesChange}
          >
            {_('Changed')}
          </Checkbox>
        </Divider>
      </FormGroup>
    );
  }
}

DeltaStatesFilterGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default DeltaStatesFilterGroup;

// vim: set ts=2 sw=2 tw=80:
