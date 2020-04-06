/* Copyright (C) 2016-2020 Greenbone Networks GmbH
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

import React, {useState, useEffect} from 'react';
import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';

import styled from 'styled-components';

import Theme from 'web/utils/theme';

import withLayout from 'web/components/layout/withLayout';

export const DISABLED_OPACTIY = 0.65;

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
  background-color: ${props => (props.disabled ? Theme.dialogGray : undefined)};
  opacity: ${props => (props.disabled ? DISABLED_OPACTIY : undefined)};
`;

const Field = props => {
  const [value, setValue] = useState(props.value);

  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  const notifyChange = val => {
    const {name, onChange, disabled = false} = props;

    if (isDefined(onChange) && !disabled) {
      onChange(val, name);
    }
  };
  const handleChange = event => {
    const val = event.target.value;

    setValue(val);

    notifyChange(val);
  };

  return <StyledInput {...props} value={value} onChange={handleChange} />;
};

Field.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
};

export default withLayout()(Field);

// vim: set ts=2 sw=2 tw=80:
