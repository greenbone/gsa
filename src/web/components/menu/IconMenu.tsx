/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import Theme from 'web/utils/Theme';

interface IconMenuProps {
  children: React.ReactNode | React.ReactNode[];
  icon?: React.ReactNode;
}

const Span = styled.span`
  display: inline-flex;
  flex-direction: column;
`;

const Div = styled.div`
  position: relative;
  display: none;

  ${Span}:hover & {
    display: block;
  }
`;

const List = styled.ul`
  position: absolute;
  margin: 0;
  padding: 0;
  left: 0;
  top: 0;
  z-index: ${Theme.Layers.onTop};
  list-style: none;
  font-size: 10px;
  width: 255px;
`;

const Entry = styled.li`
  height: 22px;
  width: 255px;
  border-left: 1px solid ${Theme.mediumGray};
  border-right: 1px solid ${Theme.mediumGray};
  display: flex;
  align-items: stretch;
  background-color: ${Theme.white};
  font-weight: bold;
  text-indent: 12px;
  text-align: left;

  &:first-child {
    border-top: 1px solid ${Theme.mediumGray};
  }
  &:last-child {
    border-bottom: 1px solid ${Theme.mediumGray};
  }
  &:hover {
    background: ${Theme.green};
    color: ${Theme.white};
  }

  & div {
    display: flex;
    align-items: center;
    flex-grow: 1;
    cursor: pointer;
  }
`;

const IconMenu = ({children, icon}: IconMenuProps) => {
  const menuEntries = React.Children.map(children, child => (
    <Entry>{child}</Entry>
  ));
  return (
    <Span>
      {isDefined(icon) ? icon : null}
      <Div>
        <List>{menuEntries}</List>
      </Div>
    </Span>
  );
};

export default IconMenu;
