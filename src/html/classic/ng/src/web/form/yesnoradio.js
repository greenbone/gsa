/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import _ from '../../locale.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import Radio from './radio.js';

export const YES_VALUE = '1';
export const NO_VALUE = '0';

const YesNoRadio = ({
    disabled,
    value,
    name,
    yesValue = YES_VALUE,
    noValue = NO_VALUE,
    onChange,
    ...other,
  }) => {
  return (
    <Layout {...other} flex>
      <Radio
        title={_('Yes')}
        value={yesValue}
        name={name}
        checked={value === yesValue}
        onChange={onChange}
        disabled={disabled}/>
      <Radio
        title={_('No')}
        value={noValue}
        name={name}
        checked={value === noValue}
        onChange={onChange}
        disabled={disabled}/>
    </Layout>
  );
};

YesNoRadio.propTypes = {
  disabled: PropTypes.bool,
  name: PropTypes.string,
  value: PropTypes.any,
  yesValue: PropTypes.any,
  noValue: PropTypes.any,
  onChange: PropTypes.func,
};

export default YesNoRadio;

// vim: set ts=2 sw=2 tw=80:
