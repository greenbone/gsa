/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import Divider from 'web/components/layout/Divider';
import PropTypes from 'web/utils/PropTypes';

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
            title={_('Same')}
            onChange={this.handleDeltaStatesChange}
          />

          <Checkbox
            checked={delta_states.includes('n')}
            name="n"
            title={_('New')}
            onChange={this.handleDeltaStatesChange}
          />

          <Checkbox
            checked={delta_states.includes('g')}
            name="g"
            title={_('Gone')}
            onChange={this.handleDeltaStatesChange}
          />

          <Checkbox
            checked={delta_states.includes('c')}
            name="c"
            title={_('Changed')}
            onChange={this.handleDeltaStatesChange}
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
