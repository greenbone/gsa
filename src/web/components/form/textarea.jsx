/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Textarea as GreenboneTextArea} from '@greenbone/opensight-ui-components-mantinev7';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
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
  classNames,
  ...props
}) => {
  const handleChange = useValueChange({disabled, name, onChange});

  return (
    <GreenboneTextArea
      {...props}
      autosize={autosize}
      classNames={{
        input: `default-input-class ${classNames?.input || ''}`,
      }}
      disabled={disabled}
      error={isDefined(errorContent) && `${errorContent}`}
      label={title}
      maxRows={maxRows}
      minRows={minRows}
      name={name}
      placeholder={placeholder}
      resize="vertical"
      value={value}
      onChange={handleChange}
    />
  );
};

TextArea.propTypes = {
  autosize: PropTypes.bool,
  disabled: PropTypes.bool,
  errorContent: PropTypes.toString,
  minRows: PropTypes.numberOrNumberString,
  maxRows: PropTypes.numberOrNumberString,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  classNames: PropTypes.object,
};

export default TextArea;
