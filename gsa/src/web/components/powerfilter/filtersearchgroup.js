/* Copyright (C) 2017-2020  Greenbone Networks GmbH
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

/* this is experimental. trying to consolidate all filter terms whose
 * method should be ~'value' into one. */

import 'core-js/features/string/starts-with';

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes.js';

import FormGroup from 'web/components/form/formgroup.js';
import TextField from 'web/components/form/textfield.js';

const FilterSearchGroup = ({name, filter, title, onChange}) => {
  let filterVal;

  if (!isDefined(filterVal) && isDefined(filter)) {
    filterVal = filter.get(name);
    if (isDefined(filterVal)) {
      if (filterVal.startsWith('"')) {
        filterVal = filterVal.slice(1);
      }
      if (filterVal.endsWith('"')) {
        filterVal = filterVal.slice(0, -1);
      }
    }
  }

  return (
    <FormGroup title={title}>
      <TextField name={name} value={filterVal} onChange={onChange} />
    </FormGroup>
  );
};

FilterSearchGroup.propTypes = {
  filter: PropTypes.filter,
  name: PropTypes.string,
  title: PropTypes.string,
  onChange: PropTypes.func,
};

export default FilterSearchGroup;
