/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import createLabel from 'web/components/label/Label';
import Theme from 'web/utils/Theme';

const YesLabel = createLabel(
  Theme.complianceYes,
  Theme.complianceYes,
  Theme.white,
  'compliance-state-yes',
  _l('Yes'),
);

const NoLabel = createLabel(
  Theme.complianceNo,
  Theme.complianceNo,
  Theme.white,
  'compliance-state-no',
  _l('No'),
);
const IncompleteLabel = createLabel(
  Theme.complianceIncomplete,
  Theme.complianceIncomplete,
  Theme.white,
  'compliance-state-incomplete',
  _l('Incomplete'),
);
const UndefinedLabel = createLabel(
  Theme.complianceUndefined,
  Theme.complianceUndefined,
  Theme.white,
  'compliance-state-undefined',
  _l('Undefined'),
);

export const ComplianceStateLabels = {
  Yes: YesLabel,
  No: NoLabel,
  Incomplete: IncompleteLabel,
  Undefined: UndefinedLabel,
};

export default ComplianceStateLabels;
