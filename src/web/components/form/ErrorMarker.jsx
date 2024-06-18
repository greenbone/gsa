/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import {styledExcludeProps} from 'web/utils/styledConfig';
import Theme from 'web/utils/theme';

const StyledMarker = styledExcludeProps(styled.div, ['isVisible'])`
  color: ${Theme.darkRed};
  color: ${props => props.color};
  font-weight: bold;
  font-size: 19px;
  padding-bottom: 1px;
  padding-left: 4px;
  display: ${props => (props.isVisible ? 'inline' : 'none')};
`;

const ErrorMarker = props => (
  <StyledMarker {...props} data-testid="error-marker">
    ×
  </StyledMarker>
);

export default ErrorMarker;
