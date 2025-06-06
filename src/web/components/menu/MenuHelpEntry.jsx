/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import ManualLink from 'web/components/link/manuallink';
import MenuEntry from 'web/components/menu/MenuEntry';
import PropTypes from 'web/utils/PropTypes';

const StyledManualLink = styled(ManualLink)`
  height: 100%;
`;

const MenuHelpEntry = ({title, ...props}) => (
  <MenuEntry {...props} caps="help">
    <StyledManualLink page="index" title={title}>
      {title}
    </StyledManualLink>
  </MenuEntry>
);

MenuHelpEntry.propTypes = {
  title: PropTypes.string,
};

export default MenuHelpEntry;
