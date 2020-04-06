/* Copyright (C) 2018-2020 Greenbone Networks GmbH
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

import hoistStatics from 'hoist-non-react-statics';

import PropTypes from 'web/utils/proptypes';

import FilterSelection from './filterselection';

const withFilterSelection = ({filtersFilter}) => Component => {
  const FilterSelectionWrapper = ({showFilterSelection = false, ...props}) =>
    showFilterSelection ? (
      <FilterSelection {...props} filtersFilter={filtersFilter}>
        {({filter, selectFilter}) => (
          <Component
            {...props}
            filter={filter}
            showFilterSelection={showFilterSelection}
            onSelectFilterClick={selectFilter}
          />
        )}
      </FilterSelection>
    ) : (
      <Component {...props} showFilterSelection={showFilterSelection} />
    );

  FilterSelectionWrapper.propTypes = {
    showFilterSelection: PropTypes.bool,
  };

  return hoistStatics(FilterSelectionWrapper, Component);
};

export default withFilterSelection;

// vim: set ts=2 sw=2 tw=80:
