/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes';

const TabPanels = ({active = 0, children}) => {
  const child = React.Children.toArray(children)[active];
  return isDefined(child) ? child : null;
};

TabPanels.propTypes = {
  active: PropTypes.number,
};

export default TabPanels;

// vim: set ts=2 sw=2 tw=80:
