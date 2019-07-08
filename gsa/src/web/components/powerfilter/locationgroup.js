/* Copyright (C) 2017-2019  Greenbone Networks GmbH
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
import TextField from '../form/textfield.js';

const LocationGroup = ({loc, filter, onChange, name = 'location'}) => {
  if (!isDefined(loc) && isDefined(filter)) {
    loc = filter.get('location');
  }

  return (
    <FormGroup title={_('Port and Protocol')}>
      <TextField name={name} value={loc} onChange={onChange} />
    </FormGroup>
  );
};

LocationGroup.propTypes = {
  filter: PropTypes.filter,
  loc: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default LocationGroup;

// vim: set ts=2 sw=2 tw=80:
