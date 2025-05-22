/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Filter from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import Checkbox from 'web/components/form/Checkbox';
import FormGroup from 'web/components/form/FormGroup';
import ComplianceStateLabels from 'web/components/label/ComplianceState';
import IconDivider from 'web/components/layout/IconDivider';
import useTranslation from 'web/hooks/useTranslation';

interface ComplianceLevelsFilterGroupProps {
  filter: Filter;
  onChange: (value: string, field: string) => void;
  onRemove: () => void;
  isResult?: boolean;
}

const ComplianceLevelsFilterGroup = ({
  filter,
  onChange,
  onRemove,
  isResult = false,
}: ComplianceLevelsFilterGroupProps) => {
  const [_] = useTranslation();
  const handleComplianceChange = (
    value: boolean,
    level: string | undefined,
  ) => {
    const filterName = isResult
      ? 'compliance_levels'
      : 'report_compliance_levels';

    let compliance = filter.get(filterName) as string | undefined;

    if (!compliance) {
      compliance = '';
    }

    const includesLevel = compliance.includes(level as string);

    if (value && !includesLevel) {
      compliance += level;
      onChange(compliance, filterName);
    } else if (!value && includesLevel) {
      compliance = compliance.replace(level as string, '');

      if (compliance.trim().length === 0) {
        onRemove();
      } else {
        onChange(compliance, filterName);
      }
    }
  };

  let complianceLevels = filter.get(
    isResult ? 'compliance_levels' : 'report_compliance_levels',
  ) as string | undefined;

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

export default ComplianceLevelsFilterGroup;
