/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import PropTypes from 'web/utils/proptypes';

const BlankLink = ({to, children, ...props}) => (
  <a
    {...props}
    href={to}
    target="_blank"
    rel="noopener noreferrer" // https://mathiasbynens.github.io/rel-noopener
  >
    {children}
  </a>
);

BlankLink.propTypes = {
  to: PropTypes.string,
};

export default BlankLink;

// vim: set ts=2 sw=2 tw=80:
