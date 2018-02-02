/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import {is_defined} from 'gmp/utils.js';

import compose from '../../utils/compose.js';
import PropTypes from '../../utils/proptypes.js';

import {StyledElement, StyledInput, StyledTitle} from './radio.js';

import Divider from '../layout/divider.js';
import withLayout from '../layout/withLayout.js';

import withChangeHandler from './withChangeHandler.js';

const convert_checked = (value, props) => {
  const {checkedValue, unCheckedValue} = props;

  if (value && is_defined(checkedValue)) {
    value = checkedValue;
  }
  else if (!value && is_defined(unCheckedValue)) {
    value = unCheckedValue;
  }
  return value;
};

const CheckboxComponent = ({
    title,
    children,
    disabled,
    checkedValue,
    unCheckedValue,
    ...other
  }) => {

  return (
    <StyledElement>
      <Divider>
        <StyledInput
          {...other}
          disabled={disabled}
          type="checkbox"
        />
        {is_defined(title) &&
          <StyledTitle disabled={disabled}>
            {title}
          </StyledTitle>
        }
      </Divider>
      {children}
    </StyledElement>
  );
};

CheckboxComponent.propTypes = {
  checkedValue: PropTypes.any,
  disabled: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  unCheckedValue: PropTypes.any,
  onChange: PropTypes.func,
};

export default compose(
  withLayout(),
  withChangeHandler({
    convert_func: convert_checked,
    value_func: event => event.target.checked,
  }),
)(CheckboxComponent);

// vim: set ts=2 sw=2 tw=80:
