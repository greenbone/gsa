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

import PropTypes from 'web/utils/proptypes';

import Checkbox from 'web/components/form/checkbox';
import FormGroup from 'web/components/form/formgroup';

import IconDivider from 'web/components/layout/icondivider';

import ComplianceStateLabels from 'web/components/label/compliancestate';

const ComplianceLevelsFilterGroup = ({
  filter,
  onChange,
  onRemove,
  isResult = false,
}) => {
  const handleComplianceChange = (value, level) => {
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
  };

  let compliance_levels = filter.get(
    isResult ? 'compliance_levels' : 'report_compliance_levels',
  );

  if (!isDefined(compliance_levels)) {
    compliance_levels = '';
  }
  return (
    <FormGroup title={_('Compliance')}>
      <IconDivider>
        <Checkbox
          checked={compliance_levels.includes('y')}
          name="y"
          onChange={handleComplianceChange}
        >
          <ComplianceStateLabels.Yes />
        </Checkbox>
        <Checkbox
          checked={compliance_levels.includes('n')}
          name="n"
          onChange={handleComplianceChange}
        >
          <ComplianceStateLabels.No />
        </Checkbox>
        <Checkbox
          checked={compliance_levels.includes('i')}
          name="i"
          onChange={handleComplianceChange}
        >
          <ComplianceStateLabels.Incomplete />
        </Checkbox>
        <Checkbox
          checked={compliance_levels.includes('u')}
          name="u"
          onChange={handleComplianceChange}
        >
          <ComplianceStateLabels.Undefined />
        </Checkbox>
      </IconDivider>
    </FormGroup>
  );
};

ComplianceLevelsFilterGroup.propTypes = {
  filter: PropTypes.filter.isRequired,
  isResult: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default ComplianceLevelsFilterGroup;

// vim: set ts=2 sw=2 tw=80:
