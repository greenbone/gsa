/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {Button as OpenSightButton} from '@greenbone/opensight-ui-components-mantinev7';

import PropTypes from 'web/utils/proptypes';

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
      name={name}
      loading={isLoading}
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

// vim: set ts=2 sw=2 tw=80:
