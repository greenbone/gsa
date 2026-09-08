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
        transform="translate(4.3 4.3) scale(1.7)"
      />
      <path
        d={FIVE_POINT_STAR_PATH}
        transform="translate(6.6 2.6) rotate(25) scale(.55)"
      />
      <path
        d={FIVE_POINT_STAR_PATH}
        transform="translate(7.4 3.8) rotate(50) scale(.55)"
      />
      <path
        d={FIVE_POINT_STAR_PATH}
        transform="translate(6.9 5.2) rotate(75) scale(.55)"
      />
      <path
        d={FIVE_POINT_STAR_PATH}
        transform="translate(5.8 6.3) rotate(100) scale(.55)"
      />
    </g>
  </LanguageFlagFrame>
);

export default SimplifiedChineseFlag;
