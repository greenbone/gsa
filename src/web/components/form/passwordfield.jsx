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

import {PasswordInput} from '@greenbone/opensight-ui-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import useValueChange from './useValueChange';

const PasswordField = ({
  autoComplete,
  disabled,
  errorContent,
  grow,
  name,
  placeholder,
  title,
  value,
  onChange,
  onKeyDown,
  ...props
}) => {
  const handleChange = useValueChange({onChange, name, disabled});
  return (
    <PasswordInput
      {...props}
      error={isDefined(errorContent) && `${errorContent}`}
      styles={{root: {flexGrow: grow}}}
      autoComplete={autoComplete}
      disabled={disabled}
      name={name}
      placeholder={placeholder}
      label={title}
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
    />
  );
};

PasswordField.propTypes = {
  autoComplete: PropTypes.string,
  disabled: PropTypes.bool,
  errorContent: PropTypes.toString,
  grow: PropTypes.numberOrNumberString,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
};

export default PasswordField;

// vim: set ts=2 sw=2 tw=80:
