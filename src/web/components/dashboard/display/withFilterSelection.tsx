/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import type FilterType from 'gmp/models/filter/filter-type';
import FilterSelection from 'web/components/dashboard/display/FilterSelection';
import {updateDisplayName} from 'web/utils/display-name';

export interface WithFilterSelectionInjectedProps {
  filter?: FilterType;
  onSelectFilterClick?: () => void;
}

export interface WithFilterSelectionControlProps {
  showFilterSelection?: boolean;
}

export interface WithFilterSelectionConfig {
  filtersFilter: FilterType;
}

type WithFilterSelectionProps<TProps> = Omit<
  TProps,
  keyof WithFilterSelectionInjectedProps
> &
  WithFilterSelectionControlProps;

const withFilterSelection =
  ({filtersFilter}: WithFilterSelectionConfig) =>
  <TProps extends WithFilterSelectionInjectedProps>(
    Component: React.ComponentType<TProps>,
  ) => {
    const FilterSelectionWrapper = ({
      showFilterSelection = false,
      ...props
    }: WithFilterSelectionProps<TProps>) =>
      showFilterSelection ? (
        <FilterSelection filtersFilter={filtersFilter}>
          {({filter, selectFilter}) => (
            <Component
              {...(props as TProps)}
              filter={filter}
              showFilterSelection={showFilterSelection}
              onSelectFilterClick={selectFilter}
            />
          )}
        </FilterSelection>
      ) : (
        <Component
          {...(props as TProps)}
          showFilterSelection={showFilterSelection}
        />
      );

    return hoistStatics(
      updateDisplayName(
        FilterSelectionWrapper,
        Component,
        'withFilterSelection',
      ),
      Component,
    );
  };

export default withFilterSelection;
