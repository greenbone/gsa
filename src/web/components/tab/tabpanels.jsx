/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';

import PropTypes from '../../utils/proptypes';

const TabPanels = ({active = 0, children}) => {
  const child = React.Children.toArray(children)[active];
  return isDefined(child) ? child : null;
};

TabPanels.propTypes = {
  active: PropTypes.number,
};

export default TabPanels;
