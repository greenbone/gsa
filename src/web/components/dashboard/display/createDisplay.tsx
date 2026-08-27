/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ComponentType} from 'react';
import {type FilterType} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import {type LoaderRenderProps} from 'web/components/dashboard/display/Loader';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';

interface LoaderProps<TData> {
  filter?: FilterType;
  children?: (props: LoaderRenderProps<TData>) => React.ReactNode;
}

export type CreateDisplayProps<
  TDisplayProps extends object,
  TData,
  TChartData = unknown,
> = {
  chartComponent?: ComponentType<TChartData>;
  displayComponent: ComponentType<TDisplayProps>;
  displayId: string;
  displayName?: string;
  filterTerm?: string;
  filtersFilter: FilterType;
  loaderComponent: ComponentType<LoaderProps<TData>>;
} & TDisplayProps;

interface DisplayComponentProps {
  filter?: FilterType;
  filterId?: string;
  showFilterSelection?: boolean;
  onFilterIdChanged?: (filterId?: string) => void;
  onSelectFilterClick?: () => void;
}

const createDisplay = <
  TDisplayProps extends object,
  TData,
  TChartData = unknown,
>({
  chartComponent: Chart,
  displayComponent: Display,
  displayId,
  displayName,
  filtersFilter,
  filterTerm,
  loaderComponent: Loader,
  ...other
}: CreateDisplayProps<TDisplayProps, TData, TChartData>) => {
  const DisplayComponent = ({
    showFilterSelection = false,
    filter,
    filterId,
    onFilterIdChanged,
    ...props
  }: DisplayComponentProps) => {
    const {
      filter: selectedFilter,
      selectFilter,
      filterSelectionDialog,
    } = useFilterSelection({
      filterId,
      filtersFilter,
      onFilterIdChanged,
    });

    const displayFilter = showFilterSelection ? selectedFilter : filter;
    return (
      <>
        <Loader filter={displayFilter}>
          {loaderProps => (
            <Display
              {...(other as TDisplayProps)}
              {...loaderProps}
              {...props}
              filter={displayFilter}
              filterTerm={filterTerm}
              showFilterSelection={showFilterSelection}
              onSelectFilterClick={
                showFilterSelection ? selectFilter : undefined
              }
            >
              {isDefined(Chart)
                ? displayProps => <Chart {...displayProps} />
                : null}
            </Display>
          )}
        </Loader>
        {filterSelectionDialog}
      </>
    );
  };

  DisplayComponent.displayName = displayName;

  DisplayComponent.displayId = displayId;

  return DisplayComponent;
};

export default createDisplay;
