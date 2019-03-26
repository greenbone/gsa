/* Copyright (C) 2016-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';

import Layout from 'web/components/layout/layout';

const ScrollableContent = styled.div`
  overflow: auto;
  padding: 0 15px;
  width: 100%;
  height: 100%;
  max-height: ${props => props.maxHeight};
`;

const StyledLayout = styled(Layout)`
  overflow: hidden; /* fix for adjusting the content while resizing in firefox */
  height: 100%; /* needs to be set for Chrome */
`;

const ScrollableContentLayout = ({children, maxHeight, ...props}) => (
  <StyledLayout flex="column" align={['center', 'start']} grow="1">
    <ScrollableContent maxHeight={maxHeight} {...props}>
      {children}
    </ScrollableContent>
  </StyledLayout>
);

ScrollableContentLayout.propTypes = {
  maxHeight: PropTypes.string,
};

export default ScrollableContentLayout;

// vim: set ts=2 sw=2 tw=80:
