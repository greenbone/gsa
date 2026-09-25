/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {parseFloat} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {isEmpty} from 'gmp/utils/string';
import WordCloudChart from 'web/components/chart/WordCloudChart';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
import {randomColor} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  OverridesWordCountLoader,
  type OverrideWordCloudData,
} from 'web/pages/overrides/dashboard/OverrideLoaders';

interface TransformedWordCloudDataItem {
  value: number;
  label: string;
  color: string;
  filterValue: string;
}

type TransformedWordCloudData = TransformedWordCloudDataItem[];

type OverrideWordCloudDataDisplayProps = DataDisplayProps<
  OverrideWordCloudData,
  TransformedWordCloudData
>;

type OverrideWordCloudDisplayProps = DashboardDisplayProps;

const transformWordCountData = (
  data: OverrideWordCloudData = {},
): TransformedWordCloudData => {
  const {groups = []} = data;
  const transformedData = groups.map(group => {
    const {count, value} = group;
    return {
      value: parseFloat(count),
      label: value,
      color: randomColor(),
      filterValue: value,
    } as TransformedWordCloudDataItem;
  });
  return transformedData;
};

export const OverridesWordCloudDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterChanged,
  onFilterIdChanged,
  ...props
}: OverrideWordCloudDisplayProps) => {
  const {
    filter: selectedFilter,
    selectFilter,
    filterSelectionDialog,
  } = useFilterSelection({
    filterId,
    filtersFilter: OVERRIDES_FILTER_FILTER,
    onFilterIdChanged,
  });

  const displayFilter = showFilterSelection ? selectedFilter : filter;

  const handleDataClick = (filterValue: string) => {
    if (!isDefined(onFilterChanged) || isEmpty(filterValue)) {
      return;
    }

    const wordTerm = FilterTerm.fromString(`text~"${filterValue}"`);

    if (isDefined(filter) && filter.hasTerm(wordTerm)) {
      return;
    }
    const wordFilter = QueryFilter.fromTerm(wordTerm);
    const newFilter = isDefined(displayFilter)
      ? displayFilter.and(wordFilter)
      : wordFilter;

    onFilterChanged(newFilter);
  };

  return (
    <>
      <OverridesWordCountLoader filter={displayFilter}>
        {loaderProps => (
          <DataDisplay<
            OverrideWordCloudData,
            OverrideWordCloudDataDisplayProps,
            TransformedWordCloudData
          >
            {...props}
            {...loaderProps}
            dataTransform={transformWordCountData}
            filter={displayFilter}
            showToggleLegend={false}
            title={() => _('Overrides Text Word Cloud')}
            onSelectFilterClick={showFilterSelection ? selectFilter : undefined}
          >
            {({width, height, data, svgRef}) => (
              <WordCloudChart
                data={data}
                height={height}
                svgRef={svgRef}
                width={width}
                onDataClick={
                  isDefined(onFilterChanged) ? handleDataClick : undefined
                }
              />
            )}
          </DataDisplay>
        )}
      </OverridesWordCountLoader>
      {filterSelectionDialog}
    </>
  );
};

OverridesWordCloudDisplay.displayId = 'override-by-text-words';

export const OverridesWordCloudTableDisplay = createDisplay({
  loaderComponent: OverridesWordCountLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={transformedData =>
        transformedData?.map(row => [row.label, row.value]) ?? []
      }
      dataTitles={[_('Text'), _('Count')]}
      dataTransform={transformWordCountData}
      title={() => _('Overrides Text Word Cloud')}
    />
  ),

  displayId: 'override-by-text-words-table',
  displayName: 'OverridesWordCloudTableDisplay',
  filtersFilter: OVERRIDES_FILTER_FILTER,
});

registerDisplay(
  OverridesWordCloudDisplay,
  _l('Chart: Overrides Text Word Cloud'),
);

registerDisplay(
  OverridesWordCloudTableDisplay,
  _l('Table: Overrides Text Word Cloud'),
);
