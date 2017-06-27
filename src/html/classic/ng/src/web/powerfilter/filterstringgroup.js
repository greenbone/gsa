/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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
import {is_string} from '../../utils.js';

import PropTypes from '../proptypes.js';

import FormGroup from '../components/form/formgroup.js';
import TextField from '../components/form/textfield.js';

const FilterStringGroup = ({filter, onChange, name = 'filter'}) => {
  let filterstring = is_string(filter) ?
    filter : filter.toFilterCriteriaString();
  return (
    <FormGroup title={_('Filter')} flex>
      <TextField
        name={name}
        grow="1"
        value={filterstring} size="30"
        onChange={onChange}
        maxLength="80"/>
    </FormGroup>
  );
};

FilterStringGroup.propTypes = {
  name: PropTypes.string,
  filter: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.filter,
  ]).isRequired,
  onChange: PropTypes.func,
};

export default FilterStringGroup;

// vim: set ts=2 sw=2 tw=80:
