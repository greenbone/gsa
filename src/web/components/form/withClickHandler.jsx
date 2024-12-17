/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';
import PropTypes from 'web/utils/proptypes';

const props_value = (event, props) => props.value;
const noop_convert = value => value;

const withClickHandler = (options = {}) => Component => {
  const {convert_func = noop_convert, value_func = props_value} = options;

  const ClickHandler = ({onClick, convert = convert_func, ...props}) => {
    const handleClick = event => {
      if (onClick) {
        onClick(convert(value_func(event, props), props), props.name);
      }
    };

    return <Component {...props} onClick={handleClick} />;
  };

  ClickHandler.propTypes = {
    convert: PropTypes.func,
    name: PropTypes.string,
    onClick: PropTypes.func,
  };

  return ClickHandler;
};

export default withClickHandler;

// vim: set ts=2 sw=2 tw=80:
