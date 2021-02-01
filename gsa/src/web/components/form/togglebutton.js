/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
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
