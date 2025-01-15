/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import createLabel from 'web/components/label/label';
import Theme from 'web/utils/theme';

const YesLabel = createLabel(
  Theme.complianceYes,
  Theme.complianceYes,
  Theme.white,
  'compliance-state-yes',
  // _('Yes')
  'Yes',
);

const NoLabel = createLabel(
  Theme.complianceNo,
  Theme.complianceNo,
  Theme.white,
  'compliance-state-no',
  // _('No')
  'No',
);
const IncompleteLabel = createLabel(
  Theme.complianceIncomplete,
  Theme.complianceIncomplete,
  Theme.white,
  'compliance-state-incomplete',
  // _('Incomplete')
  'Incomplete',
);
const UndefinedLabel = createLabel(
  Theme.complianceUndefined,
  Theme.complianceUndefined,
  Theme.white,
  'compliance-state-undefined',
  // _('Undefined')
  'Undefined',
);

export const ComplianceStateLabels = {
  Yes: YesLabel,
  No: NoLabel,
  Incomplete: IncompleteLabel,
  Undefined: UndefinedLabel,
};

export default ComplianceStateLabels;
