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

import React, {useCallback} from 'react';

import styled from 'styled-components';

import withLayout from 'web/components/layout/withLayout';

import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';
import Theme from 'web/utils/theme';

export const DISABLED_OPACITY = 0.65;

const StyledInput = styled.input`
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
