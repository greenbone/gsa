/* Copyright (C) 2016-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import Divider from 'web/components/layout/divider';
import withLayout from 'web/components/layout/withLayout';

import PropTypes from 'web/utils/proptypes';

import {StyledElement, StyledInput, StyledTitle} from './radio';

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
