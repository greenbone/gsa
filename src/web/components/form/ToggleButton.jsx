/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'web/utils/PropTypes';
import Theme from 'web/utils/Theme';

const Styled = styled.div`
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
}) => (
  <Styled
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

ToggleButton.propTypes = {
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  onToggle: PropTypes.func,
};

export default ToggleButton;
