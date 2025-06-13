/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Layout from 'web/components/layout/Layout';
import {useTab} from 'web/components/tab/TabContext';
import PropTypes from 'web/utils/PropTypes';

const TabList = ({children, ...props}) => {
  const {activeTab, setActiveTab} = useTab();

  children = React.Children.map(children, (child, index) => {
    if (child !== null && child.type !== Layout) {
      return React.cloneElement(child, {
        isActive: activeTab === index,
        onActivate: () => setActiveTab(index),
      });
    }
    return child;
  });
  return <Layout {...props}>{children}</Layout>;
};

TabList.propTypes = {
  children: PropTypes.node.isRequired,
};

export default TabList;
