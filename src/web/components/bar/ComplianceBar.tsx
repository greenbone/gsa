/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {getTranslatableReportCompliance} from 'gmp/models/auditreport';
import {isDefined} from 'gmp/utils/identity';
import ProgressBar from 'web/components/bar/ProgressBar';
import Theme from 'web/utils/Theme';

const COMPLIANCE_STATE = {
  NO: 'no',
  INCOMPLETE: 'incomplete',
  YES: 'yes',
  UNDEFINED: 'undefined',
} as const;

export type ComplianceState =
  (typeof COMPLIANCE_STATE)[keyof typeof COMPLIANCE_STATE];

interface ComplianceBarProps {
  compliance?: ComplianceState;
  toolTip?: string;
}

const ComplianceBar = ({compliance, toolTip}: ComplianceBarProps) => {
  const title = getTranslatableReportCompliance(compliance);

  let background: string;
  if (compliance === COMPLIANCE_STATE.NO) {
    background = Theme.complianceNo;
  } else if (compliance === COMPLIANCE_STATE.INCOMPLETE) {
    background = Theme.complianceIncomplete;
  } else if (compliance === COMPLIANCE_STATE.YES) {
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
