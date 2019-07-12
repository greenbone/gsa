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

const OwnerGroup = ({owner, filter, onChange, name = 'owner'}) => {
  if (!isDefined(owner) && isDefined(filter)) {
    owner = filter.get('owner');
  }

  return (
    <FormGroup title={_('Owner')}>
      <TextField name={name} value={owner} onChange={onChange} />
    </FormGroup>
  );
};

OwnerGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  owner: PropTypes.string,
  onChange: PropTypes.func,
};

export default OwnerGroup;

// vim: set ts=2 sw=2 tw=80:
