/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ComponentType} from 'react';
import {type FilterType} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import {
  type LoaderRenderProps,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';

type DashboardDisplayComponentProps = Omit<
  DashboardDisplayProps,
  // filterId and onFilterIdChanged are omitted because they are managed
  // internally by the createDisplay function.
  'filterId' | 'onFilterIdChanged'
>;

/**
 * Props for a display component passed to the createDisplay function.
 */
export type DisplayProps<
  TData,
  TChartData extends object = {},
  TOtherProps extends object = {},
> = {
  filterTerm?: string;
  children?: (props: TChartData) => React.ReactNode;
  onSelectFilterClick?: () => void;
} & DashboardDisplayComponentProps &
  LoaderRenderProps<TData> &
  TOtherProps;

/**
 * Props for the createDisplay function, including the to be used display and
 * chart components, as well as loader and filter configurations.
 */
type CreateDisplayProps<
  TDisplayProps extends DisplayProps<TData, TChartProps, TOtherProps>,
  TData,
  TChartProps extends object = {},
  TOtherProps extends object = {},
> = {
  chartComponent?: ComponentType<TChartProps>;
  displayComponent: ComponentType<TDisplayProps>;
  displayId: string;
  displayName?: string;
  filterTerm?: string;
  filtersFilter: FilterType;
  loaderComponent: ComponentType<DisplayLoaderProps<TData>>;
} & TOtherProps;

/**
 * Creates a display component for the dashboard, to be rendered within a
 * DisplayView combining a display component, optional chart component, loader,
 * and filter selection.
 */
const createDisplay = <
  TDisplayProps extends DisplayProps<TData, TChartProps, TOtherProps>,
  TData,
  TChartProps extends object = {},
  TOtherProps extends object = {},
>({
  chartComponent: Chart,
  displayComponent: Display,
  displayId,
  displayName,
  filtersFilter,
  filterTerm,
  loaderComponent: Loader,
  ...other
}: CreateDisplayProps<TDisplayProps, TData, TChartProps, TOtherProps>) => {
  const DisplayComponent = ({
    showFilterSelection = false,
    filter,
    filterId,
    onFilterIdChanged,
    ...props
  }: DashboardDisplayProps) => {
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
          {loaderProps => {
            const displayProps: TDisplayProps = {
              ...props,
              ...loaderProps,
              ...other,
              filter: displayFilter,
              filterTerm,
              showFilterSelection,
              onSelectFilterClick: showFilterSelection
                ? selectFilter
                : undefined,
            } as TDisplayProps;
            return (
              <Display {...displayProps}>
                {isDefined(Chart)
                  ? (chartProps: TChartProps) => <Chart {...chartProps} />
                  : null}
              </Display>
            );
          }}
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
