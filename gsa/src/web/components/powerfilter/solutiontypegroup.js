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

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import Radio from 'web/components/form/radio';
import FormGroup from 'web/components/form/formgroup';

import SolutionTypeIcon from 'web/components/icon/solutiontypeicon';

class SolutionTypesFilterGroup extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleSolutionTypeChange = this.handleSolutionTypeChange.bind(this);
  }

  handleSolutionTypeChange(value, solutionType) {
    const {filter, onChange} = this.props;
    const filteredSolutionType = filter.get('solution_type');

    if (!isDefined(solutionType) || solutionType === 'All') {
      onChange(filter.delete('solution_type'));
    } else if (solutionType !== filteredSolutionType) {
      onChange(filter.set('solution_type', solutionType));
    }
  }

  render() {
    const {filter} = this.props;

    const solutionType = filter.get('solution_type');

    return (
      <FormGroup title={_('Solution Type')}>
        <Radio
          checked={!isDefined(solutionType) || solutionType === 'All'}
          name="All"
          onChange={this.handleSolutionTypeChange}
        >
          <span>{_('All')}</span>
        </Radio>
        <Radio
          checked={solutionType === 'Workaround'}
          name="Workaround"
          onChange={this.handleSolutionTypeChange}
        >
          <SolutionTypeIcon type="Workaround" />
          <span>{_('Workaround')}</span>
        </Radio>
        <Radio
          checked={solutionType === 'Mitigation'}
          name="Mitigation"
          onChange={this.handleSolutionTypeChange}
        >
          <SolutionTypeIcon type="Mitigation" />
          <span>{_('Mitigation')}</span>
        </Radio>
        <Radio
          checked={solutionType === 'VendorFix'}
          name="VendorFix"
          onChange={this.handleSolutionTypeChange}
        >
          <SolutionTypeIcon type="VendorFix" />
          <span>{_('Vendor fix')}</span>
        </Radio>
        <Radio
          checked={solutionType === 'NoneAvailable'}
          name="NoneAvailable"
          onChange={this.handleSolutionTypeChange}
        >
          <SolutionTypeIcon type="NoneAvailable" />
          <span>{_('None available')}</span>
        </Radio>
        <Radio
          checked={solutionType === 'WillNotFix'}
          name="WillNotFix"
          onChange={this.handleSolutionTypeChange}
        >
          <SolutionTypeIcon type="WillNotFix" />
          <span>{_('Will not fix')}</span>
        </Radio>
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
