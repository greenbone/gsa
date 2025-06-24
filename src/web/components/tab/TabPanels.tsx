/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect} from 'react';
import {isDefined} from 'gmp/utils/identity';
import {useTab} from 'web/components/tab/TabContext';

interface TabPanelsProps {
  children: React.ReactNode;
}

const TabPanels = ({children}: TabPanelsProps) => {
  const {activeTab, setTabCount} = useTab();

  useEffect(() => {
    setTabCount(React.Children.toArray(children).length);
  }, [children, setTabCount]);

  const child = React.Children.toArray(children)[activeTab];
  return isDefined(child) ? child : null;
};

export default TabPanels;
