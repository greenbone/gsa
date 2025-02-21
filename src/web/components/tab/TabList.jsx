/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Layout from 'web/components/layout/Layout';
import PropTypes from 'web/utils/PropTypes';

const TabList = ({active = 0, children, onActivateTab, ...props}) => {
  children = React.Children.map(children, (child, index) => {
    if (child !== null && child.type !== Layout) {
      return React.cloneElement(child, {
        isActive: active === index,
        onActivate: () => onActivateTab(index),
      });
    }

    return child;
  });
  return <Layout {...props}>{children}</Layout>;
};

TabList.propTypes = {
  active: PropTypes.number,
  onActivateTab: PropTypes.func,
};

export default TabList;
