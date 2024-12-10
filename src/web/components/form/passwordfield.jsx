/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {PasswordInput} from '@greenbone/opensight-ui-components-mantinev7';

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
      data-testid="password-input"
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
