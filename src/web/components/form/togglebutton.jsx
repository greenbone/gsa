/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

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

// vim: set ts=2 sw=2 tw=80:
