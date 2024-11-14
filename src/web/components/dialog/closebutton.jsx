/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import Theme from 'web/utils/theme';

import PropTypes from 'web/utils/proptypes';
import useIconSize from 'web/hooks/useIconSize';

const StyledCloseButton = styled.div`
  display: flex;
  font-weight: bold;
  font-size: 12px;
  font-family: ${Theme.Font.default};
  color: ${Theme.darkGreen};
  cursor: pointer;
  border-radius: 2px;
  padding: 0;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: ${props => props.$width};
  height: ${props => props.$height};
  line-height: ${props => props.$lineHeight};
  :hover {
    border: 1px solid ${Theme.darkGreen};
  }
  & * {
    height: inherit;
    width: inherit;
  }
`;

const CloseButton = ({title = _('Close'), size = 'medium', ...props}) => {
  const {width, height} = useIconSize(size);

  return (
    <StyledCloseButton
      data-testid="close-button"
      $width={width}
      $height={height}
      $lineHeight={height}
      title={title}
      {...props}
    >
      ×{/* Javascript unicode: \u00D7 */}
    </StyledCloseButton>
  );
};

CloseButton.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
};

export default CloseButton;
