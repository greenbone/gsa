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
