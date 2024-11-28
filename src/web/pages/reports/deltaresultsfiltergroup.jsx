/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';

import Divider from 'web/components/layout/divider';

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
            title={_('Same')}
          />

          <Checkbox
            checked={delta_states.includes('n')}
            name="n"
            onChange={this.handleDeltaStatesChange}
            title={_('New')}
          />

          <Checkbox
            checked={delta_states.includes('g')}
            name="g"
            onChange={this.handleDeltaStatesChange}
            title={_('Gone')}
          />

          <Checkbox
            checked={delta_states.includes('c')}
            name="c"
            onChange={this.handleDeltaStatesChange}
            title={_('Changed')}
          />
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
