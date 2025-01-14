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
  'Yes',
);

const NoLabel = createLabel(
  Theme.complianceNo,
  Theme.complianceNo,
  Theme.white,
  'compliance-state-no',
  'No',
);
const IncompleteLabel = createLabel(
  Theme.complianceIncomplete,
  Theme.complianceIncomplete,
  Theme.white,
  'compliance-state-incomplete',
  'Incomplete',
);
const UndefinedLabel = createLabel(
  Theme.complianceUndefined,
  Theme.complianceUndefined,
  Theme.white,
  'compliance-state-undefined',
  'Undefined',
);

export const ComplianceStateLabels = {
  Yes: YesLabel,
  No: NoLabel,
  Incomplete: IncompleteLabel,
  Undefined: UndefinedLabel,
};

export default ComplianceStateLabels;
