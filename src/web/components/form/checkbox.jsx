/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback} from 'react';

import {Checkbox as OpenSightCheckbox} from '@greenbone/opensight-ui-components-mantinev7';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

const convertChecked = (value, checkedValue, unCheckedValue) => {
  let val;
  if (value && isDefined(checkedValue)) {
    val = checkedValue;
  } else if (!value && isDefined(unCheckedValue)) {
    val = unCheckedValue;
  } else {
    val = value;
  }
  return val;
};

const valueFunc = event => event.target.checked;

const Checkbox = ({
  title,
  name,
  disabled,
  checkedValue,
  unCheckedValue,
  toolTipTitle,
  onChange,
  ...props
}) => {
  const handleChange = useCallback(
    event => {
      const newValue = convertChecked(
        valueFunc(event),
        checkedValue,
        unCheckedValue,
      );
      if (!disabled && onChange) {
        onChange(newValue, name);
      }
    },
    [onChange, disabled, name, checkedValue, unCheckedValue],
  );
  return (
    <OpenSightCheckbox
      {...props}
      label={title}
      title={toolTipTitle}
      disabled={disabled}
      onChange={handleChange}
    />
  );
};

Checkbox.propTypes = {
  checkedValue: PropTypes.any,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  toolTipTitle: PropTypes.string,
  unCheckedValue: PropTypes.any,
  onChange: PropTypes.func,
};

export default Checkbox;

// vim: set ts=2 sw=2 tw=80:
