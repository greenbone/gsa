/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import LanguageFlagFrame, {
  type LanguageFlagProps,
} from 'web/components/icon/flags/LanguageFlagFrame';

const ItalianFlag = ({testId}: LanguageFlagProps) => (
  <LanguageFlagFrame testId={testId}>
    <rect fill="#009246" height="16" width="5.33" />
    <rect fill="#ffffff" height="16" width="5.34" x="5.33" />
    <rect fill="#ce2b37" height="16" width="5.33" x="10.67" />
  </LanguageFlagFrame>
);

export default ItalianFlag;
