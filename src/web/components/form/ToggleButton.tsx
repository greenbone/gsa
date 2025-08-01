/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import Theme from 'web/utils/Theme';

interface StyledProps extends React.HTMLAttributes<HTMLDivElement> {
  checked?: boolean;
  disabled?: boolean;
  width?: string;
}

interface ToggleButtonProps extends StyledProps {
  name?: string;
  checked?: boolean;
  disabled?: boolean;
  onToggle?: (checked: boolean, name?: string) => void;
}

const Styled = styled.div<StyledProps>`
  border-radius: 2px;
  padding: 5px;
  user-select: none;
  ${props => {
    const {checked = false, disabled = false, width = '32px'} = props;

    let color;
    let backgroundColor;
    if (disabled) {
      backgroundColor = Theme.lightGray;
      color = Theme.mediumGray;
    } else if (checked) {
      backgroundColor = Theme.lightGreen;
      color = Theme.white;
    } else {
      backgroundColor = Theme.lightGray;
      color = Theme.darkGray;
    }
    return {
      backgroundColor,
      color,
      cursor: disabled ? 'default' : 'pointer',
      width,
    };
  }}
`;

const ToggleButton = ({
  name,
  checked = false,
  disabled,
  onToggle,
  ...props
}: ToggleButtonProps) => (
  <Styled
    data-testid="toggle-button"
    {...props}
    checked={checked}
    disabled={disabled}
    onClick={
      !disabled && isDefined(onToggle)
        ? () => onToggle(!checked, name)
        : undefined
    }
  />
);

export default ToggleButton;
