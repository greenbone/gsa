/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';

import useIconSize, {ICON_SIZE_SMALL_PIXELS} from 'web/hooks/useIconSize';

const Styled = styled.span`
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  margin: 1px;
  user-select: none;
  width: ${props => props.$width};
  height: ${props => props.$height};
  line-height: ${props => props.$lineHeight};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  & * {
    height: inherit;
    width: inherit;
  }
`;

const Loading = styled.span`
  height: ${ICON_SIZE_SMALL_PIXELS + 'px'};
  width: ${ICON_SIZE_SMALL_PIXELS + 'px'};
  background: url(/img/loading.gif) center center no-repeat;
`;

const ArrowIcon = ({down = false, isLoading = false, size, ...props}) => {
  const {width, height} = useIconSize(size);
  let icon = down ? '▼' : '▲';
  if (isLoading) {
    icon = <Loading />;
  }
  return (
    <Styled $height={height} $width={width} $lineHeight={height} {...props} data-testid="arrow-icon">
      {icon}
    </Styled>
  );
};

ArrowIcon.propTypes = {
  down: PropTypes.bool,
  isLoading: PropTypes.bool,
  size: PropTypes.oneOf(['tiny', 'small', 'medium', 'large']),
};

export default ArrowIcon;
