/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import 'core-js/fn/string/includes';

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import Checkbox from '../form/checkbox.js';
import FormGroup from '../form/formgroup.js';

import IconDivider from '../layout/icondivider.js';

import SeverityClassLabel from '../label/severityclass.js';

class SeverityLevelsFilterGroup extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleLevelChange = this.handleLevelChange.bind(this);
  }

  handleLevelChange(value, level) {
    const {filter, onChange} = this.props;
    let levels = filter.get('levels');

    if (!levels) {
      levels = '';
    }

    if (value && !levels.includes(level)) {
      levels += level;
      onChange(levels, 'levels');
    } else if (!value && levels.includes(level)) {
      levels = levels.replace(level, '');
      onChange(levels, 'levels');
    }
  }

  render() {
    const {filter} = this.props;

    let levels = filter.get('levels');

    if (!isDefined(levels)) {
      levels = '';
    }
    return (
      <FormGroup title={_('Severity (Class)')}>
        <IconDivider>
          <Checkbox
            checked={levels.includes('h')}
            name="h"
            onChange={this.handleLevelChange}
          >
            <SeverityClassLabel.High />
          </Checkbox>
          <Checkbox
            checked={levels.includes('m')}
            name="m"
            onChange={this.handleLevelChange}
          >
            <SeverityClassLabel.Medium />
          </Checkbox>
          <Checkbox
            checked={levels.includes('l')}
            name="l"
            onChange={this.handleLevelChange}
          >
            <SeverityClassLabel.Low />
          </Checkbox>
          <Checkbox
            checked={levels.includes('g')}
            name="g"
            onChange={this.handleLevelChange}
          >
            <SeverityClassLabel.Log />
          </Checkbox>
          <Checkbox
            checked={levels.includes('f')}
            name="f"
            onChange={this.handleLevelChange}
          >
            <SeverityClassLabel.FalsePositive />
          </Checkbox>
        </IconDivider>
      </FormGroup>
    );
  }
}

SeverityLevelsFilterGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SeverityLevelsFilterGroup;

// vim: set ts=2 sw=2 tw=80:
