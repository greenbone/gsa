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

import {parse_int} from '../../utils.js';
import _ from '../../locale.js';

import Layout from '../layout.js';

import Radio from './radio.js';

export const YesNoRadio = ({disabled, onChange, value, name, ...other}) => {
  value = parse_int(value);
  return (
    <Layout {...other} flex>
      <Radio
        title={_('Yes')}
        value="1"
        checked={value === 1}
        convert={parse_int}
        onChange={onChange}
        disabled={disabled}/>
      <Radio
        title={_('No')}
        value="0"
        convert={parse_int}
        checked={value === 0}
        onChange={onChange}
        disabled={disabled}/>
    </Layout>
  );
};

YesNoRadio.propTypes = {
  name: React.PropTypes.string,
  onChange: React.PropTypes.func,
  disabled: React.PropTypes.bool,
  value: React.PropTypes.number,
};

export default YesNoRadio;

// vim: set ts=2 sw=2 tw=80:
