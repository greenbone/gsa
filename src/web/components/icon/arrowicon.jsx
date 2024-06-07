/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import PropTypes from 'web/utils/proptypes';

import withIconSize, {
  ICON_SIZE_SMALL_PIXELS,
} from 'web/components/icon/withIconSize';

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
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
`;

const Loading = styled.span`
  height: ${ICON_SIZE_SMALL_PIXELS + 'px'};
  width: ${ICON_SIZE_SMALL_PIXELS + 'px'};
  background: url(/img/loading.gif) center center no-repeat;
`;

const ArrowIcon = ({down = false, isLoading = false, ...props}) => (
  <Styled {...props}>{isLoading ? <Loading /> : down ? '▼' : '▲'}</Styled>
);

ArrowIcon.propTypes = {
  down: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default withIconSize()(ArrowIcon);

// vim: set ts=2 sw=2 tw=80:
