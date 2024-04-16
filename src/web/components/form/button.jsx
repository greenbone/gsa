/* Copyright (C) 2016-2022 Greenbone AG
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

import {Button as OpenSightButton} from '@greenbone/opensight-ui-components';

import PropTypes from 'web/utils/proptypes';

import useValueChange from './useValueChange';

const Button = ({
  title,
  children = title,
  convert,
  disabled,
  isLoading = false,
  name,
  value,
  onClick,
  ...other
}) => {
  const handleChange = useValueChange({
    disabled,
    onChange: onClick,
    convert,
    name,
  });
  return (
    <OpenSightButton
      {...other}
      disabled={disabled}
      name={name}
      loading={isLoading}
      value={value}
      onClick={handleChange}
    >
      {children}
    </OpenSightButton>
  );
};

Button.propTypes = {
  convert: PropTypes.func,
  disabled: PropTypes.bool,
  isLoading: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.any,
  onClick: PropTypes.func,
};

export default Button;

// vim: set ts=2 sw=2 tw=80:
