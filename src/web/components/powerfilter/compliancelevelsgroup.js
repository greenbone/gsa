/* Copyright (C) 2024 Greenbone AG
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

import PropTypes from '../../utils/proptypes.js';

import Checkbox from '../form/checkbox.js';
import FormGroup from '../form/formgroup.js';

import IconDivider from '../layout/icondivider.js';

import ComplianceStateLabels from '../label/compliancestate.js';

class ComplianceLevelsFilterGroup extends React.Component {
  constructor(...args) {
    super(...args);

    this.handleComplianceChange = this.handleComplianceChange.bind(this);
  }

  handleComplianceChange(value, level) {
    const {filter, onChange, onRemove, isResult = false} = this.props;

    const filter_name = isResult
      ? 'compliance_levels'
      : 'report_compliance_levels';

    let compliance = filter.get(filter_name);

    if (!compliance) {
      compliance = '';
    }

    if (value && !compliance.includes(level)) {
      compliance += level;
      onChange(compliance, filter_name);
    } else if (!value && compliance.includes(level)) {
      compliance = compliance.replace(level, '');

      if (compliance.trim().length === 0) {
        onRemove();
      } else {
        onChange(compliance, filter_name);
      }
    }
  }

  render() {
    const {filter, isResult} = this.props;

    let compliance_levels = filter.get(
      isResult ? 'compliance_levels' : 'report_compliance_levels',
    );

    if (!isDefined(compliance_levels)) {
      compliance_levels = '';
    }
    return (
      <FormGroup title={_('Compliance (Status)')}>
        <IconDivider>
          <Checkbox
            checked={compliance_levels.includes('y')}
            name="y"
            onChange={this.handleComplianceChange}
          >
            <ComplianceStateLabels.Yes />
          </Checkbox>
          <Checkbox
            checked={compliance_levels.includes('n')}
            name="n"
            onChange={this.handleComplianceChange}
          >
            <ComplianceStateLabels.No />
          </Checkbox>
          <Checkbox
            checked={compliance_levels.includes('i')}
            name="i"
            onChange={this.handleComplianceChange}
          >
            <ComplianceStateLabels.Incomplete />
          </Checkbox>
          <Checkbox
            checked={compliance_levels.includes('u')}
            name="u"
            onChange={this.handleComplianceChange}
          >
            <ComplianceStateLabels.Undefined />
          </Checkbox>
        </IconDivider>
      </FormGroup>
    );
  }
}

ComplianceLevelsFilterGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  isResult: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default ComplianceLevelsFilterGroup;

// vim: set ts=2 sw=2 tw=80:
