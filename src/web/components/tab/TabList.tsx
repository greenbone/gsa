/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {ReactNode} from 'react';
import Layout from 'web/components/layout/Layout';
import {useTab} from 'web/components/tab/TabContext';

interface TabListProps {
  children: ReactNode;
  [key: string]: unknown;
}

const TabList = ({children, ...props}: TabListProps) => {
  const {activeTab, setActiveTab} = useTab();

  const mappedChildren = React.Children.map(children, (child, index) => {
    if (
      child !== null &&
      typeof child === 'object' &&
      'type' in child &&
      child.type !== Layout
    ) {
      return React.cloneElement(
        child as React.ReactElement<{
          isActiveTab: boolean;
          onActivateTab: () => void;
        }>,
        {
          isActiveTab: activeTab === index,
          onActivateTab: () => setActiveTab(index),
        },
      );
    }
    return child;
  });
  return <Layout {...props}>{mappedChildren}</Layout>;
};

export default TabList;
