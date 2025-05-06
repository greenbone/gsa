/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {PasswordInput} from '@greenbone/opensight-ui-components-mantinev7';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import useValueChange from 'web/components/form/useValueChange';
import PropTypes from 'web/utils/PropTypes';

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
      autoComplete={autoComplete}
      disabled={disabled}
      error={isDefined(errorContent) && `${errorContent}`}
      label={title}
      name={name}
      placeholder={placeholder}
      styles={{root: {flexGrow: grow}}}
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
