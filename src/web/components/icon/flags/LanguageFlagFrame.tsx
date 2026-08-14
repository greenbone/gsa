/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

type LanguageFlagProps = {
  testId: string;
};

const LanguageFlagFrame = ({
  children,
  testId,
}: React.PropsWithChildren<LanguageFlagProps>) => (
  <svg
    aria-hidden="true"
    data-testid={testId}
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath={`url(#${testId}-clip)`}>{children}</g>
    <rect height="15" rx="7.5" stroke="#fff" width="15" x="0.5" y="0.5" />
    <defs>
      <clipPath id={`${testId}-clip`}>
        <rect fill="#fff" height="16" rx="8" width="16" />
      </clipPath>
    </defs>
  </svg>
);

export type {LanguageFlagProps};
export default LanguageFlagFrame;
