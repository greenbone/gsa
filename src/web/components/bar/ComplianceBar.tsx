/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  COMPLIANCE,
  type ComplianceType,
  getTranslatableReportCompliance,
} from 'gmp/models/compliance';
import {isDefined} from 'gmp/utils/identity';
import ProgressBar from 'web/components/bar/ProgressBar';
import Theme from 'web/utils/Theme';

interface ComplianceBarProps {
  compliance?: ComplianceType;
  toolTip?: string;
}

const ComplianceBar = ({
  compliance = COMPLIANCE.UNDEFINED,
  toolTip,
}: ComplianceBarProps) => {
  const title = getTranslatableReportCompliance(compliance);

  let background: string;
  if (compliance === COMPLIANCE.NO) {
    background = Theme.complianceNo;
  } else if (compliance === COMPLIANCE.INCOMPLETE) {
    background = Theme.complianceIncomplete;
  } else if (compliance === COMPLIANCE.YES) {
    background = Theme.complianceYes;
  } else {
    background = Theme.complianceUndefined;
  }

  const toolTipText = isDefined(toolTip) ? toolTip : title;

  return (
    <ProgressBar background={background} progress={100} title={toolTipText}>
      {title}
    </ProgressBar>
  );
};

export default ComplianceBar;
