/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {FileInput} from '@greenbone/opensight-ui-components-mantinev7';
import {isDefined} from 'gmp/utils/identity';
import React, {useCallback} from 'react';
import PropTypes from 'web/utils/proptypes';

const FileField = ({disabled, grow, name, title, onChange, ...props}) => {
  const handleChange = useCallback(
    file => {
      if (!disabled && isDefined(onChange)) {
        onChange(file, name);
      }
    },
    [onChange, disabled, name],
  );

  return (
    <FileInput
      data-testid="file-input"
      {...props}
      disabled={disabled}
      label={title}
      name={name}
      styles={{root: {flexGrow: grow}}}
      onChange={handleChange}
    />
  );
};

FileField.propTypes = {
  disabled: PropTypes.bool,
  grow: PropTypes.numberOrNumberString,
  name: PropTypes.string,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default FileField;

// vim: set ts=2 sw=2 tw=80:
