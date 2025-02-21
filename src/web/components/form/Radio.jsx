/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {RadioButton as GreenboneRadio} from '@greenbone/opensight-ui-components-mantinev7';
import React from 'react';
import PropTypes from 'web/utils/PropTypes';

import useValueChange from './useValueChange';

const Radio = ({
  checked,
  disabled,
  name,
  title,
  value,
  convert,
  onChange,
  ...props
}) => {
  const handleChange = useValueChange({
    onChange,
    convert,
    name,
    disabled,
  });
  return (
    <GreenboneRadio
      {...props}
      checked={checked}
      disabled={disabled}
      label={title}
      name={name}
      value={value}
      onChange={handleChange}
    />
  );
};

Radio.propTypes = {
  checked: PropTypes.bool,
  convert: PropTypes.func,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export default Radio;
