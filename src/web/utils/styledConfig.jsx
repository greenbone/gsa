/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


const excludePropsConfig = excludedProps => {
  return {
    shouldForwardProp: prop => {
      return !excludedProps.includes(prop);
    },
  };
};

export const styledExcludeProps = (styledComponent, excludedProps) =>
  styledComponent.withConfig(excludePropsConfig(excludedProps));
