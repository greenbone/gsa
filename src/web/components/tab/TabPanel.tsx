/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {type ReactNode} from 'react';

interface TabPanelProps {
  children?: ReactNode;
}

const TabPanel = ({children}: TabPanelProps) => {
  if (React.Children.count(children) > 1) {
    return <>{children}</>;
  }
  return children;
};

export default TabPanel;
