/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
