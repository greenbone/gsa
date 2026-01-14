/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {Menu, Button} from '@mantine/core';
import {isDefined} from 'gmp/utils/identity';

interface IconMenuProps {
  children: React.ReactNode | React.ReactNode[];
  icon?: React.ReactNode;
  title?: string;
}

const IconMenu = ({children, icon, title}: IconMenuProps) => {
  const menuEntries = React.Children.map(children, child => {
    if (!child) return undefined;
    return <Menu.Item>{child}</Menu.Item>;
  })?.filter(Boolean);

  return (
    <Menu>
      <Menu.Target>
        <Button
          style={{padding: 0, minWidth: 'auto'}}
          title={title}
          variant="transparent"
        >
          {isDefined(icon) ? icon : 'Menu'}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>{menuEntries}</Menu.Dropdown>
    </Menu>
  );
};

export default IconMenu;
