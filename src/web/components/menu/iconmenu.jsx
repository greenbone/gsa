/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import Icon from 'web/components/icon/icon';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const IconMenu = styled.span`
  display: inline-flex;
  flex-direction: column;
`;

const Div = styled.div`
  position: relative;
  display: none;

  ${IconMenu}:hover & {
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

const IconMenuContainer = ({children, icon, ...other}) => {
  const menuentries = React.Children.map(children, child => (
    <Entry>{child}</Entry>
  ));
  return (
    <IconMenu>
      {isDefined(icon) ? icon : <Icon {...other} />}
      <Div>
        <List>{menuentries}</List>
      </Div>
    </IconMenu>
  );
};

IconMenuContainer.propTypes = {
  icon: PropTypes.element,
};

export default IconMenuContainer;
