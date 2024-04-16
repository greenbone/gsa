/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {RadioButton as GreenboneRadio} from '@greenbone/opensight-ui-components';

import PropTypes from 'web/utils/proptypes';

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
      label={title}
      checked={checked}
      name={name}
      value={value}
      disabled={disabled}
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
