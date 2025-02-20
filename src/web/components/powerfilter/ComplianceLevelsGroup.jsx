/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import ComplianceStateLabels from 'web/components/label/ComplianceState';
import IconDivider from 'web/components/layout/IconDivider';
import useTranslation from 'web/hooks/useTranslation';
import PropTypes from 'web/utils/PropTypes';

const ComplianceLevelsFilterGroup = ({
  filter,
  onChange,
  onRemove,
  isResult = false,
}) => {
  const [_] = useTranslation();
  const handleComplianceChange = (value, level) => {
    const filterName = isResult
      ? 'compliance_levels'
      : 'report_compliance_levels';

    let compliance = filter.get(filterName);

    if (!compliance) {
      compliance = '';
    }

    if (value && !compliance.includes(level)) {
      compliance += level;
      onChange(compliance, filterName);
    } else if (!value && compliance.includes(level)) {
      compliance = compliance.replace(level, '');

      if (compliance.trim().length === 0) {
        onRemove();
      } else {
        onChange(compliance, filterName);
      }
    }
  };

  let complianceLevels = filter.get(
    isResult ? 'compliance_levels' : 'report_compliance_levels',
  );

  if (!isDefined(complianceLevels)) {
    complianceLevels = '';
  }
  return (
    <FormGroup
      data-testid="compliance-levels-filter-group"
      title={_('Compliance')}
    >
      <IconDivider>
        <Checkbox
          checked={complianceLevels.includes('y')}
          data-testid="compliance-checkbox-yes"
          name="y"
          onChange={handleComplianceChange}
        />
        <ComplianceStateLabels.Yes />
        <Checkbox
          checked={complianceLevels.includes('n')}
          data-testid="compliance-checkbox-no"
          name="n"
          onChange={handleComplianceChange}
        />
        <ComplianceStateLabels.No />
        <Checkbox
          checked={complianceLevels.includes('i')}
          data-testid="compliance-checkbox-incomplete"
          name="i"
          onChange={handleComplianceChange}
        />
        <ComplianceStateLabels.Incomplete />
        <Checkbox
          checked={complianceLevels.includes('u')}
          data-testid="compliance-checkbox-undefined"
          name="u"
          onChange={handleComplianceChange}
        />
        <ComplianceStateLabels.Undefined />
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
