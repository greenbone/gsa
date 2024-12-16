/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import Theme from 'web/utils/theme';

import PropTypes from 'web/utils/proptypes';

const StyledDiv = styled.div`
  font-size: 16px;
  display: flex;
  align-items: start;
  flex-grow: 1;
  padding-left: 8px;
  padding-right: 8px;
  padding-bottom: 2px;
  padding-top: 2px;
  border-left: ${props =>
    props.$active
      ? '1px solid ' + Theme.dialogGray
      : '1px solid ' + Theme.white};
  border-right: 1px solid ${Theme.lightGray};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  background-color: ${props => (props.$active ? Theme.dialogGray : undefined)};
  border-bottom: ${props =>
    props.$active ? '1px solid ' + Theme.dialogGray : undefined};
  margin-bottom: ${props => (props.$active ? '-2px' : undefined)};
  border-top: ${props =>
    props.$active ? '2px solid ' + Theme.green : '2px solid ' + Theme.white};
  &:hover {
    border-top: ${props =>
      props.$active
        ? '2px solid ' + Theme.green
        : '2px solid ' + Theme.lightGray};
  }
  &:first-child {
    border-left: ${props =>
      props.$active
        ? '1px solid ' + Theme.lightGray
        : '1px solid ' + Theme.white};
  }
`;

const Tab = ({
  isActive = false,
  children,
  className,
  disabled = false,
  onActivate,
}) => (
  <StyledDiv
    $active={isActive}
    className={className}
    onClick={disabled ? undefined : onActivate}
  >
    {children}
  </StyledDiv>
);

Tab.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  isActive: PropTypes.bool,
  onActivate: PropTypes.func,
};

export default Tab;
