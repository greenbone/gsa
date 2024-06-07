/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';

import ManualLink from '../link/manuallink';

import MenuEntry from './menuentry';

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

// vim: set ts=2 sw=2 tw=80:
