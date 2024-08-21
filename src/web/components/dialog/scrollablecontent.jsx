/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';
import {styledExcludeProps} from 'web/utils/styledConfig';

import Layout from 'web/components/layout/layout';

const ScrollableContent = styledExcludeProps(styled.div, ['maxHeight'])`
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
