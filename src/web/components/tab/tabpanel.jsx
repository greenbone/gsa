/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

const TabPanel = ({children}) => {
  if (React.Children.count(children) > 1) {
    return <React.Fragment>{children}</React.Fragment>;
  }
  return children;
};

export default TabPanel;
