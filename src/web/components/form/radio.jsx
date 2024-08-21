/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useState} from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import compose from 'web/utils/compose';
import PropTypes from 'web/utils/proptypes';
import {styledExcludeProps} from 'web/utils/styledConfig';

import Divider from 'web/components/layout/divider';
import withLayout from 'web/components/layout/withLayout';

export const StyledElement = styled.label`
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  font-weight: normal;
  cursor: pointer;
  ${props => (props.disabled ? {cursor: 'not-allowed'} : undefined)};
`;

export const StyledInput = styledExcludeProps(styled.input, ['convert'])`
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
