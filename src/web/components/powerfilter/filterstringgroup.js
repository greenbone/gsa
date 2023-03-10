/* Copyright (C) 2020-2022 Greenbone AG
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

import _ from 'gmp/locale';

import {isString} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import FormGroup from '../form/formgroup.js';
import TextField from '../form/textfield.js';

const FilterStringGroup = ({filter, onChange, name = 'filter'}) => {
  const filterstring = isString(filter)
    ? filter
    : filter.toFilterCriteriaString();
  return (
    <FormGroup title={_('Filter')}>
      <TextField
        name={name}
        grow="1"
        value={filterstring}
        size="30"
        onChange={onChange}
      />
    </FormGroup>
  );
};

FilterStringGroup.propTypes = {
  filter: PropTypes.oneOfType([PropTypes.string, PropTypes.filter]).isRequired,
  name: PropTypes.string,
  onChange: PropTypes.func,
};

export default FilterStringGroup;

// vim: set ts=2 sw=2 tw=80:

