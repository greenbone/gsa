/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import {StyledElement, StyledInput, StyledTitle} from './radio';

import Divider from 'web/components/layout/divider';
import withLayout from 'web/components/layout/withLayout';

const convertChecked = (value, props) => {
  const {checkedValue, unCheckedValue} = props;
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

const CheckboxComponent = ({
  title,
  children,
  disabled,
  checkedValue,
  toolTipTitle,
  unCheckedValue,
  ...other
}) => {
  const notifyChange = val => {
    const {name, onChange} = other;

    if (isDefined(onChange) && !disabled) {
      onChange(val, name);
    }
  };

  const getCheckboxValues = () => {
    return {checkedValue, unCheckedValue};
  };

  const handleChange = event => {
    const val = convertChecked(valueFunc(event), getCheckboxValues());

    notifyChange(val);
  };

  return (
    <StyledElement>
      <Divider title={toolTipTitle}>
        <StyledInput
          {...other}
          disabled={disabled}
          type="checkbox"
          onChange={handleChange}
        />
        {isDefined(title) && (
          <StyledTitle data-testid="checkbox-title" disabled={disabled}>
            {title}
          </StyledTitle>
        )}
        {children}
      </Divider>
    </StyledElement>
  );
};

CheckboxComponent.propTypes = {
  checkedValue: PropTypes.any,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  toolTipTitle: PropTypes.string,
  unCheckedValue: PropTypes.any,
  onChange: PropTypes.func,
};

export default withLayout()(CheckboxComponent);

// vim: set ts=2 sw=2 tw=80:
