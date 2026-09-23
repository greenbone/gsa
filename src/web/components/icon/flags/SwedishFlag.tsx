/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import LanguageFlagFrame, {
  type LanguageFlagProps,
} from 'web/components/icon/flags/LanguageFlagFrame';

const SwedishFlag = ({testId}: LanguageFlagProps) => (
  <LanguageFlagFrame testId={testId}>
    <rect fill="#005293" height="16" width="16" />
    <rect fill="#fecb00" height="3.2" width="16" y="6.4" />
    <rect fill="#fecb00" height="16" width="3.2" x="4.19" />
  </LanguageFlagFrame>
);

export default SwedishFlag;
