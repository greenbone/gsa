/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import glamorous from 'glamorous';

import {is_defined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

const Styled = glamorous.div({
  borderRadius: '8px',
  padding: '5px',
  userSelect: 'none',
}, ({
  checked = false,
  disabled = false,
  width = '32px',
}) => {
  let color;
  let backgroundColor;
  if (disabled) {
    backgroundColor = Theme.lightGray;
    color = Theme.mediumGray;
  }
  else if (checked) {
    backgroundColor = Theme.lightGreen;
    color = Theme.white;
  }
  else {
    backgroundColor = Theme.lightGray;
    color = Theme.darkGray;
  }
  return {
    backgroundColor,
    color,
    cursor: disabled ? 'default' : 'pointer',
    width,
  };
});

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
    onClick={!disabled && is_defined(onToggle) ?
      () => onToggle(!checked, name) : undefined}
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
