/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React, {useCallback} from 'react';
import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';

import styled from 'styled-components';

import {styledExcludeProps} from 'web/utils/styledConfig';
import Theme from 'web/utils/theme';

import withLayout from 'web/components/layout/withLayout';

export const DISABLED_OPACITY = 0.65;

const StyledInput = styledExcludeProps(styled.input, ['convert', 'hasError'])`
  /* use font and line settings from parents not from browser default */
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  display: block;
  height: 22px;
  color: ${Theme.darkGray};
  background-color: ${Theme.white};
  background-image: none;
  border: 1px solid ${Theme.inputBorderGray};
  border-radius: 2px;
  padding: 1px 8px;
  /* "hack" to overshadow default color in Chrome's autofilled input fields */
  &:-webkit-autofill {
    box-shadow: 0 0 0 1000px white inset;
  }
  cursor: ${props => (props.disabled ? 'not-allowed' : undefined)};
  background-color: ${props => {
    if (props.hasError) {
      return Theme.lightRed;
    } else if (props.disabled) {
      return Theme.dialogGray;
    }
  }};
  opacity: ${props => (props.disabled ? DISABLED_OPACITY : undefined)};
`;

const Field = ({name, onChange, disabled = false, value, ...other}) => {
  const notifyChange = useCallback(
    val => {
      if (isDefined(onChange) && !disabled) {
        onChange(val, name);
      }
    },
    [disabled, name, onChange],
  );

  const handleChange = useCallback(
    event => {
      const val = event.target.value;

      notifyChange(val);
    },
    [notifyChange],
  );

  return (
    <StyledInput
      {...other}
      name={name}
      disabled={disabled}
      value={value}
      onChange={handleChange}
    />
  );
};

Field.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export default withLayout()(Field);

// vim: set ts=2 sw=2 tw=80:
