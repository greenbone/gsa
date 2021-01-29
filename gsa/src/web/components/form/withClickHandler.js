/* Copyright (C) 2017-2021 Greenbone Networks GmbH
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
