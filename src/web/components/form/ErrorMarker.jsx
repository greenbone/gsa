/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const StyledMarker = styled.div`
  color: ${Theme.darkRed};
  font-weight: bold;
  font-size: 19px;
  padding-bottom: 1px;
  padding-left: 4px;
  display: ${props => (props.$isVisible ? 'inline' : 'none')};
`;

const ErrorMarker = ({isVisible}) => (
  <StyledMarker $isVisible={isVisible} data-testid="error-marker">
    ×
  </StyledMarker>
);

ErrorMarker.propTypes = {
  isVisible: PropTypes.bool,
};

export default ErrorMarker;
