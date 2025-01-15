/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import createLabel from 'web/components/label/label';
import Theme from 'web/utils/theme';

const HighLabel = createLabel(
  Theme.errorRed,
  Theme.errorRed,
  Theme.white,
  'severity-class-High',
  // _('High')
  'High',
);
const MediumLabel = createLabel(
  Theme.severityWarnYellow,
  Theme.severityWarnYellow,
  Theme.black,
  'severity-class-Medium',
  // _('Medium')
  'Medium',
);
const LowLabel = createLabel(
  Theme.severityLowBlue,
  Theme.severityLowBlue,
  Theme.white,
  'severity-class-Low',
  // _('Low')
  'Low',
);
const LogLabel = createLabel(
  Theme.mediumGray,
  Theme.mediumGray,
  Theme.white,
  'severity-class-Log',
  // _('Log')
  'Log',
);
const FalsePositiveLabel = createLabel(
  Theme.mediumGray,
  Theme.mediumGray,
  Theme.white,
  'severity-class-False-Positive',
  // _('False Pos.')
  'False Pos.',
);

export const SeverityClassLabels = {
  High: HighLabel,
  Medium: MediumLabel,
  Low: LowLabel,
  Log: LogLabel,
  FalsePositive: FalsePositiveLabel,
};

export default SeverityClassLabels;
