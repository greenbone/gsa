/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import PropTypes from 'web/utils/PropTypes';

export interface BlankLinkProps
  extends Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'href' | 'target' | 'rel'
  > {
  to: string;
  children?: React.ReactNode;
  'data-testid'?: string;
}

const BlankLink = ({to, children, ...props}: BlankLinkProps) => (
  <a
    {...props}
    href={to}
    rel="noopener noreferrer" // https://mathiasbynens.github.io/rel-noopener
    target="_blank"
  >
    {children}
  </a>
);

BlankLink.propTypes = {
  to: PropTypes.string,
};

export default BlankLink;
