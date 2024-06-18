/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback} from 'react';
import {isDefined} from 'gmp/utils/identity';
import PropTypes from 'web/utils/proptypes';

import styled from 'styled-components';

import Theme from 'web/utils/theme';

import withLayout from 'web/components/layout/withLayout';

import {DISABLED_OPACITY} from './field';
import ErrorMarker from './ErrorMarker';
import {styledExcludeProps} from 'web/utils/styledConfig';

const StyledTextArea = styledExcludeProps(styled.textarea, [
  'convert',
  'hasError',
])`
  display: block;
  height: auto;
  color: ${Theme.darkGray};
  background-color: ${Theme.white};
  background-image: none;
  border: 1px solid ${Theme.inputBorderGray};
  border-radius: 2px;
  padding: 4px 8px;
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

const TextArea = ({
  hasError = false,
  errorContent,
  title,
  value,
  name,
  onChange,
  disabled = false,
  ...props
}) => {
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
    <React.Fragment>
      <StyledTextArea
        {...props}
        disabled={disabled}
        hasError={hasError}
        name={name}
        title={hasError ? `${errorContent}` : title}
        value={value}
        onChange={handleChange}
      />
      <ErrorMarker isVisible={hasError}>×</ErrorMarker>
    </React.Fragment>
  );
};

TextArea.propTypes = {
  disabled: PropTypes.bool,
  errorContent: PropTypes.toString,
  hasError: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

export default withLayout()(TextArea);

// vim: set ts=2 sw=2 tw=80:
