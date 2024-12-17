/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {hasValue} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import {StyledMenuEntry} from 'web/components/menu/menu';
import Theme from 'web/utils/theme';

const MSection = styled.ul`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  border-top: 1px solid ${Theme.lightGray};
  padding: 0;
`;

const MenuSection = ({children}) => (
  <MSection>
    {React.Children.map(children, child =>
      hasValue(child) ? <StyledMenuEntry>{child}</StyledMenuEntry> : child,
    )}
  </MSection>
);

export default MenuSection;

// vim: set ts=2 sw=2 tw=80:
