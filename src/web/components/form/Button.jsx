/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Button as OpenSightButton} from '@greenbone/opensight-ui-components-mantinev7';
import React from 'react';
import PropTypes from 'web/utils/PropTypes';

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
      data-testid="opensight-button"
      {...other}
      disabled={disabled}
      loading={isLoading}
      name={name}
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
