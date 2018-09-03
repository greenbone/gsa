/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';

import SolutionTypeIcon from 'web/components/icon/solutiontypeicon';

import IconDivider from 'web/components/layout/icondivider';

class SolutionTypesFilterGroup extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleSolutionTypeChange = this.handleSolutionTypeChange.bind(this);
  }

  handleSolutionTypeChange(value, solutionType) {
    const {filter, onChange} = this.props;
    const filteredSolutionType = filter.get('solution_type');

    if (!value && solutionType === filteredSolutionType) {
      onChange(filter.delete('solution_type'));
    }
    else if (value && solutionType !== filteredSolutionType) {
      onChange(filter.set('solution_type', solutionType));
    };

  }

  render() {
    const {
      filter,
    } = this.props;

    const solutionType = filter.get('solution_type');

    return (
      <FormGroup title={_('Solution Type')}>
        <IconDivider>
          <Checkbox
            checked={solutionType === 'Workaround'}
            name="Workaround"
            onChange={this.handleSolutionTypeChange}
          >
            <IconDivider>
              <SolutionTypeIcon type="Workaround"/>
              <span>
                {_('Workaround')}
              </span>
            </IconDivider>
          </Checkbox>
          <Checkbox
            checked={solutionType === 'Mitigation'}
            name="Mitigation"
            onChange={this.handleSolutionTypeChange}
          >
            <IconDivider>
              <SolutionTypeIcon type="Mitigation"/>
              <span>
                {_('Mitigation')}
              </span>
            </IconDivider>
          </Checkbox>
          <Checkbox
            checked={solutionType === 'VendorFix'}
            name="VendorFix"
            onChange={this.handleSolutionTypeChange}
          >
            <IconDivider>
              <SolutionTypeIcon type="VendorFix"/>
              <span>
                {_('Vendor fix')}
              </span>
            </IconDivider>
          </Checkbox>
          <Checkbox
            checked={solutionType === 'NoneAvailable'}
            name="NoneAvailable"
            onChange={this.handleSolutionTypeChange}
          >
            <IconDivider>
              <SolutionTypeIcon type="NoneAvailable"/>
              <span>
                {_('None available')}
              </span>
            </IconDivider>
          </Checkbox>
          <Checkbox
            checked={solutionType === 'WillNotFix'}
            name="WillNotFix"
            onChange={this.handleSolutionTypeChange}
          >
            <IconDivider>
              <SolutionTypeIcon type="WillNotFix"/>
              <span>
                {_('Will not fix')}
              </span>
            </IconDivider>
          </Checkbox>
        </IconDivider>
      </FormGroup>
    );
  }
}

SolutionTypesFilterGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SolutionTypesFilterGroup;

// vim: set ts=2 sw=2 tw=80:
