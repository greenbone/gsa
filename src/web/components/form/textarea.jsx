/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import {Textarea as GreenboneTextArea} from '@greenbone/opensight-ui-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import useValueChange from './useValueChange';

const TextArea = ({
  autosize,
  disabled = false,
  errorContent,
  maxRows,
  minRows,
  name,
  onChange,
  placeholder,
  title,
  value,
  ...props
}) => {
  const handleChange = useValueChange({disabled, name, onChange});
  return (
    <GreenboneTextArea
      {...props}
      autosize={autosize}
      disabled={disabled}
      error={isDefined(errorContent) && `${errorContent}`}
      label={title}
      minRows={minRows}
      maxRows={maxRows}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

TextArea.propTypes = {
  autosize: PropTypes.bool,
  disabled: PropTypes.bool,
  errorContent: PropTypes.toString,
  maxRows: PropTypes.numberOrNumberString,
  minRows: PropTypes.numberOrNumberString,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default TextArea;

// vim: set ts=2 sw=2 tw=80:
