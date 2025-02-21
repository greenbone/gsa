/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import createLabel from 'web/components/label/Label';
import Theme from 'web/utils/Theme';

const HighLabel = createLabel(
  Theme.severityClassHigh,
  Theme.severityClassHigh,
  Theme.white,
  'severity-class-High',
  _l('High'),
);
const MediumLabel = createLabel(
  Theme.severityClassMedium,
  Theme.severityClassMedium,
  Theme.black,
  'severity-class-Medium',
  _l('Medium'),
);
const LowLabel = createLabel(
  Theme.severityClassLow,
  Theme.severityClassLow,
  Theme.white,
  'severity-class-Low',
  _l('Low'),
);
const LogLabel = createLabel(
  Theme.severityClassLog,
  Theme.severityClassLog,
  Theme.white,
  'severity-class-Log',
  _l('Log'),
);
const FalsePositiveLabel = createLabel(
  Theme.mediumGray,
  Theme.mediumGray,
  Theme.white,
  'severity-class-False-Positive',
  _l('False Pos.'),
);

export const SeverityClassLabels = {
  High: HighLabel,
  Medium: MediumLabel,
  Low: LowLabel,
  Log: LogLabel,
  FalsePositive: FalsePositiveLabel,
};

export default SeverityClassLabels;
