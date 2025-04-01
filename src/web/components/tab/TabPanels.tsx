/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';

interface TabPanelsProps {
  active?: number;
  children: React.ReactNode;
}

const TabPanels: React.FC<TabPanelsProps> = ({
  active = 0,
  children,
}: TabPanelsProps) => {
  const child = React.Children.toArray(children)[active];
  return isDefined(child) ? child : null;
};

export default TabPanels;
