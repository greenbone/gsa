/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import PropTypes from 'web/utils/proptypes';

const InnerLink = ({children, to, ...props}) => {
  return (
    <a {...props} href={'#' + to} data-testid="innerlink">
      {children}
    </a>
  );
};

InnerLink.propTypes = {
  to: PropTypes.string.isRequired,
};

export default InnerLink;

// vim: set ts=2 sw=2 tw=80:
