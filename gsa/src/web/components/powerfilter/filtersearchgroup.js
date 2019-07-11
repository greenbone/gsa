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

/* this is experimental. trying to consolidate all filter terms whose
 * method should be ~'value' into one. */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';

const FILTER_TITLE = {
  comment: 'Comment',
  host: 'Host (IP)',
  location: 'Location (eg. port/protocol)',
  owner: 'Owner',
  vulnerability: 'Vulnerability',
};

const FilterSearchGroup = ({name, filter, onChange}) => {
  const formTitle = FILTER_TITLE[name];
  let filterVal;

  if (!isDefined(filterVal) && isDefined(filter)) {
    filterVal = filter.get(name);
  }

  return (
    <FormGroup title={_(formTitle)}>
      <TextField name={name} value={filterVal} onChange={onChange} />
    </FormGroup>
  );
};

FilterSearchGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default FilterSearchGroup;
