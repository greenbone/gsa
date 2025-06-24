/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {useTab} from 'web/components/tab/TabContext';
import TabList from 'web/components/tab/TabList';
import TabPanels from 'web/components/tab/TabPanels';

/*
 * Tabs and its sub components are using the "compound components" pattern
 *
 * A detailed explanation of this pattern can bee seen at
 * https://www.youtube.com/watch?v=hEGg-3pIHlE
 */

interface TabProps {
  children: React.ReactNode;
}

const Tabs = (props: TabProps) => {
  const {activeTab} = useTab();
  const children = React.Children.map(props.children, child => {
    if (child && typeof child === 'object' && 'type' in child) {
      if (child.type === TabPanels) {
        return React.cloneElement(child, {activeTab});
      } else if (child.type === TabList) {
        return child;
      }
    }
    return child;
  });
  return <>{children}</>;
};

export default Tabs;
