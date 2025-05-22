/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Theme from 'web/utils/Theme';

interface StyledMarkerProps {
  $isVisible?: boolean;
}

const StyledMarker = styled.div<StyledMarkerProps>`
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

export default ErrorMarker;
