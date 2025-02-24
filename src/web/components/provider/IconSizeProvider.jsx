/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import PropTypes from 'web/utils/PropTypes';

export const IconSizeContext = React.createContext();

const IconSizeProvider = ({size, ...props}) => (
  <IconSizeContext.Provider {...props} value={size} />
);

IconSizeProvider.propTypes = {
  size: PropTypes.iconSize.isRequired,
};

export default IconSizeProvider;
