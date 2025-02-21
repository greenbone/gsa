/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import PropTypes from 'web/utils/PropTypes';

const InnerLink = ({children, to, ...props}) => {
  return (
    <a {...props} href={'#' + to}>
      {children}
    </a>
  );
};

InnerLink.propTypes = {
  to: PropTypes.string.isRequired,
};

export default InnerLink;
