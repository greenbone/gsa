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

import SeverityClassLabel from 'web/components/label/severityclass';

import IconDivider from 'web/components/layout/icondivider';

import PropTypes from 'web/utils/proptypes';

class SeverityLevelsFilterGroup extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleLevelChange = this.handleLevelChange.bind(this);
  }

  handleLevelChange(value, level) {
    const {filter, onChange, onRemove} = this.props;
    let levels = filter.get('levels');

    if (!levels) {
      levels = '';
    }

    if (value && !levels.includes(level)) {
      levels += level;
      onChange(levels, 'levels');
    } else if (!value && levels.includes(level)) {
      levels = levels.replace(level, '');

      if (levels.trim().length === 0) {
        onRemove();
      } else {
        onChange(levels, 'levels');
      }
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
  onRemove: PropTypes.func.isRequired,
};

export default SeverityLevelsFilterGroup;

// vim: set ts=2 sw=2 tw=80:
