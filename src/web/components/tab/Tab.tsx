/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {type ReactNode, type MouseEvent} from 'react';
import styled from 'styled-components';
import Theme from 'web/utils/Theme';

export interface TabProps {
  isActiveTab?: boolean;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onActivateTab?: (event: MouseEvent<HTMLDivElement>) => void;
}

const StyledDiv = styled.div<{$activeTab?: boolean; disabled?: boolean}>`
  font-size: 16px;
  display: flex;
  align-items: center;
  flex-grow: 1;
  padding-left: 12px;
  padding-right: 12px;
  padding-bottom: 6px;
  padding-top: 6px;
  border-left: ${props =>
    props.$activeTab
      ? '1px solid ' + Theme.dialogGray
      : '1px solid ' + Theme.white};
  border-right: 1px solid ${Theme.lightGray};
  border-bottom: ${props =>
    props.$activeTab ? '1px solid ' + Theme.dialogGray : undefined};
  margin-bottom: ${props => (props.$activeTab ? '-2px' : undefined)};
  border-top: ${props =>
    props.$activeTab ? '2px solid ' + Theme.green : '2px solid ' + Theme.white};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  background-color: ${props =>
    props.$activeTab
      ? 'var(--app-navigation-link-active-background)'
      : 'transparent'};
  color: ${props =>
    props.$activeTab
      ? 'var(--app-navigation-link-active-color)'
      : 'var(--app-navigation-link-label-color)'};

  &:hover {
    border-top: ${props =>
      props.$activeTab
        ? '2px solid ' + Theme.green
        : '2px solid ' + Theme.lightGray};
    background-color: ${props =>
      props.$activeTab
        ? 'var(--app-navigation-link-active-background)'
        : 'var(--mantine-color-gray-1, Theme.white)'};
    color: ${props =>
      props.$activeTab
        ? 'var(--app-navigation-link-active-color)'
        : 'var(--app-navigation-link-label-color)'};
  }
  &:first-child {
    border-left: ${props =>
      props.$activeTab
        ? '1px solid ' + Theme.lightGray
        : '1px solid ' + Theme.white};
  }
`;

const Tab = ({
  isActiveTab = false,
  children,
  className,
  disabled = false,
  onActivateTab,
}: TabProps) => (
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
