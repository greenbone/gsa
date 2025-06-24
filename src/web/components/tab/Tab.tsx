/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {ReactNode, MouseEvent} from 'react';
import styled from 'styled-components';
import Theme from 'web/utils/Theme';

interface TabProps {
  isActiveTab?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onActivateTab?: (event: MouseEvent<HTMLDivElement>) => void;
}

const StyledDiv = styled.div<{$activeTab?: boolean; disabled?: boolean}>`
  font-size: 16px;
  display: flex;
  align-items: start;
  flex-grow: 1;
  padding-left: 8px;
  padding-right: 8px;
  padding-bottom: 2px;
  padding-top: 2px;
  border-left: ${props =>
    props.$activeTab
      ? '1px solid ' + Theme.dialogGray
      : '1px solid ' + Theme.white};
  border-right: 1px solid ${Theme.lightGray};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  background-color: ${props =>
    props.$activeTab ? Theme.dialogGray : undefined};
  border-bottom: ${props =>
    props.$activeTab ? '1px solid ' + Theme.dialogGray : undefined};
  margin-bottom: ${props => (props.$activeTab ? '-2px' : undefined)};
  border-top: ${props =>
    props.$activeTab ? '2px solid ' + Theme.green : '2px solid ' + Theme.white};
  &:hover {
    border-top: ${props =>
      props.$activeTab
        ? '2px solid ' + Theme.green
        : '2px solid ' + Theme.lightGray};
  }
  &:first-child {
    border-left: ${props =>
      props.$activeTab
        ? '1px solid ' + Theme.lightGray
        : '1px solid ' + Theme.white};
  }
`;

const Tab: React.FC<TabProps> = ({
  isActiveTab = false,
  children,
  className,
  disabled = false,
  onActivateTab,
}) => (
  <StyledDiv
    $activeTab={isActiveTab}
    aria-selected={isActiveTab}
    className={className}
    disabled={disabled}
    role="tab"
    onClick={disabled ? undefined : onActivateTab}
  >
    {children}
  </StyledDiv>
);

export default Tab;
