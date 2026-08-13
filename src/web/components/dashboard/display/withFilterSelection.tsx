/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import hoistStatics from 'hoist-non-react-statics';
import type FilterType from 'gmp/models/filter/filter-type';
import useFilterSelection, {
  type UseFilterSelectionProps,
} from 'web/components/dashboard/display/useFilterSelection';
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
    }: WithFilterSelectionProps<TProps>) => {
      const {filterId, onFilterIdChanged} = props as TProps &
        UseFilterSelectionProps;
      const {filter, selectFilter, filterSelectionDialog} = useFilterSelection({
        filterId,
        filtersFilter,
        onFilterIdChanged,
      });

      return (
        <>
          <Component
            {...(props as TProps)}
            {...(showFilterSelection
              ? {
                  filter,
                  onSelectFilterClick: selectFilter,
                }
              : {})}
            showFilterSelection={showFilterSelection}
          />
          {filterSelectionDialog}
        </>
      );
    };

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
