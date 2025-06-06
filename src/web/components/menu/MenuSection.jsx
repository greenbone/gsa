/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {hasValue} from 'gmp/utils/identity';
import {StyledMenuEntry} from 'web/components/menu/Menu';
import Theme from 'web/utils/Theme';

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
