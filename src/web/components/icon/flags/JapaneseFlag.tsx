/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import LanguageFlagFrame, {
  type LanguageFlagProps,
} from 'web/components/icon/flags/LanguageFlagFrame';

const JapaneseFlag = ({testId}: LanguageFlagProps) => (
  <LanguageFlagFrame testId={testId}>
    <rect fill="#fff" height="16" width="16" />
    <circle cx="8" cy="8" fill="#bc002d" r="4" />
  </LanguageFlagFrame>
);

export default JapaneseFlag;
