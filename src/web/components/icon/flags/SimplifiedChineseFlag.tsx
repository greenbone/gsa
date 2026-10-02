/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import LanguageFlagFrame, {
  type LanguageFlagProps,
} from 'web/components/icon/flags/LanguageFlagFrame';

const FIVE_POINT_STAR_PATH =
  'M 0,-1 L 0.2245,-0.309 L 0.9511,-0.309 L 0.3633,0.118 L 0.5878,0.809 L 0,0.382 L -0.5878,0.809 L -0.3633,0.118 L -0.9511,-0.309 L -0.2245,-0.309 Z';

const SimplifiedChineseFlag = ({testId}: LanguageFlagProps) => (
  <LanguageFlagFrame testId={testId}>
    <rect fill="#de2910" height="16" width="16" />
    <g fill="#ffde00">
      <path
        d={FIVE_POINT_STAR_PATH}
        transform="translate(4.1 4.1) scale(2.05)"
      />
      <path
        d={FIVE_POINT_STAR_PATH}
        transform="translate(7.7 2.45) rotate(28) scale(.62)"
      />
      <path
        d={FIVE_POINT_STAR_PATH}
        transform="translate(8.55 4.05) rotate(52) scale(.62)"
      />
      <path
        d={FIVE_POINT_STAR_PATH}
        transform="translate(8.2 5.85) rotate(78) scale(.62)"
      />
      <path
        d={FIVE_POINT_STAR_PATH}
        transform="translate(6.75 7.15) rotate(105) scale(.62)"
      />
    </g>
  </LanguageFlagFrame>
);

export default SimplifiedChineseFlag;
