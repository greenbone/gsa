/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import FormGroup from '../form/formgroup.js';
import Spinner from '../form/spinner.js';

const FirstResultGroup = ({first, filter, onChange, name = 'first'}) => {
  if (isDefined(filter)) {
    first = filter.get('first');
  }
  return (
    <FormGroup title={_('First result')}>
      <Spinner
        type="int"
        name={name}
        value={first}
        size="5"
        onChange={onChange}
      />
    </FormGroup>
  );
};

FirstResultGroup.propTypes = {
  filter: PropTypes.filter,
  first: PropTypes.number,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default FirstResultGroup;

// vim: set ts=2 sw=2 tw=80:
