/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import LanguageFlagFrame, {
  type LanguageFlagProps,
} from 'web/components/icon/flags/LanguageFlagFrame';

const TraditionalChineseFlag = ({testId}: LanguageFlagProps) => (
  <LanguageFlagFrame testId={testId}>
    <rect fill="#fe0000" height="16" width="16" />
    <rect fill="#000095" height="8" width="8" />
    <g fill="#fff" stroke="#fff" strokeLinejoin="round" strokeWidth="0.12">
      <path d="M4 1l.4 3-.4 3-.4-3z" />
      <path d="M1.8 4l2.2 .6 2.8-.6-2.2-.6z" />
      <g transform="rotate(30 4 4)">
        <path d="M4 1l.4 3-.4 3-.4-3z" />
        <path d="M1.8 4l2.2 .6 2.8-.6-2.2-.6z" />
      </g>
      <g transform="rotate(60 4 4)">
        <path d="M4 1l.4 3-.4 3-.4-3z" />
        <path d="M1.8 4l2.2 .6 2.8-.6-2.2-.6z" />
      </g>
    </g>
    <circle
      cx="4"
      cy="4"
      fill="#fff"
      r="1.067"
      stroke="#000095"
      strokeWidth="0.2"
    />
  </LanguageFlagFrame>
);

export default TraditionalChineseFlag;
