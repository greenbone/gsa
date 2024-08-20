/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import {Input} from '@greenbone/opensight-ui-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import useValueChange from './useValueChange';

const TextField = ({
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
  const handleChange = useValueChange({onChange, disabled, name});
  return (
    <Input
      {...props}
      styles={{root: {flexGrow: grow}}}
      autoComplete={autoComplete}
      disabled={disabled}
      error={isDefined(errorContent) && `${errorContent}`}
      label={title}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
    />
  );
};

TextField.propTypes = {
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

export default TextField;

// vim: set ts=2 sw=2 tw=80:
