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
import React, {useState} from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import Divider from 'web/components/layout/divider';
import withLayout from 'web/components/layout/withLayout';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';

export const StyledElement = styled.label`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
  ${props => (props.disabled ? {cursor: 'not-allowed'} : undefined)};
`;

export const StyledInput = styled.input`
  /* use font and line settings from parents not from browser default */
  font-family: inherit;
  font-size: inherit;

  padding: 0;
  margin: 0;
  margin-left: 10px;
  line-height: normal;
  width: auto;
  height: auto;
  ${props =>
    props.disabled
      ? {
          cursor: 'not-allowed',
          opacity: 0.7,
        }
      : undefined};
`;

export const StyledTitle = styled.span`
  cursor: ${props => (props.disabled ? 'not-allowed' : '')};
  opacity: ${props => (props.disabled ? '0.5' : '1')};
`;

const RadioComponent = ({title, children, disabled, ...other}) => {
  const {value: initVal, convert} = other;
  const [val, setVal] = useState(initVal);

  const notifyChange = value => {
    const {name, onChange} = other;

    if (isDefined(onChange) && !disabled) {
      onChange(value, name);
    }
  };

  const handleChange = event => {
    let newVal;
    if (isDefined(convert)) {
      newVal = convert(event.target.value);
    } else {
      newVal = event.target.value;
    }
    setVal(newVal);
    notifyChange(newVal);
  };

  return (
    <StyledElement disabled={disabled}>
      <Divider>
        <StyledInput
          {...other}
          disabled={disabled}
          type="radio"
          value={val}
          data-testid="radio-input"
          onChange={handleChange}
        />
        {isDefined(title) && (
          <StyledTitle data-testid="radio-title" disabled={disabled}>
            {title}
          </StyledTitle>
        )}
        {children}
      </Divider>
    </StyledElement>
  );
};

RadioComponent.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default compose(
  withLayout({
    align: ['start', 'center'],
    flex: 'row',
  }),
)(RadioComponent);

// vim: set ts=2 sw=2 tw=80:
