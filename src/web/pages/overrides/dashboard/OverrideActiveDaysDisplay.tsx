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
import DonutChart from 'web/components/chart/DonutChart';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataDisplayIcons from 'web/components/dashboard/display/DataDisplayIcons';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
import {
  totalCount,
  percent,
  activeDaysColorScale,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type ActiveDaysData,
  OverridesActiveDaysLoader,
} from 'web/pages/overrides/dashboard/OverrideLoaders';

interface TransformedActiveDaysDataItems {
  value: number;
  label: string;
  bulked: boolean;
  toolTip: string;
  color: string;
  filterValue: string;
}

interface TransformedActiveDaysData extends Array<TransformedActiveDaysDataItems> {
  total: number;
}

type OverrideActiveDaysDataDisplayProps = DataDisplayProps<
  ActiveDaysData,
  TransformedActiveDaysData
>;

type OverrideActiveDaysDisplayProps = DashboardDisplayProps;

const MAX_BINS = 10; // if this is changed, activeDaysColorScale needs adjustment

const ACTIVE_YES_ALWAYS_VALUE = -2;
const ACTIVE_NO_VALUE = -1;

const transformActiveDaysData = (
  data: ActiveDaysData = {},
): TransformedActiveDaysData => {
  const {groups = []} = data;
  const sum = totalCount(groups);

  // if more than MAX_BINS groups are loaded, bulk the last ones (those
  // overrides that are active the longest) into one bin
  if (groups.length > MAX_BINS) {
    // cut off array after MAX_BINS
    const mostActiveDaysBin = groups.splice(MAX_BINS - 1);
    // get last value of the shortened group-array, as it is the largest value
    // to be shown separately. The bulked group will be labeled as bigger than
    // this value
    const {value} = groups[groups.length - 1];

    const count = mostActiveDaysBin.reduce(
      (prev, current) => prev + (parseFloat(current.count) ?? 0),
      0,
    );
    const reducedMostActiveDaysBin = {
      value,
      count,
      bulked: true, // used as flag for special label
    };

    groups.push(reducedMostActiveDaysBin);
  }

  let colorCounter = 1;
  const transformedData = groups.map(group => {
    const {bulked = false, count, value} = group;
    const perc = percent(count, sum);
    let label = '';
    switch (value) {
      case ACTIVE_YES_ALWAYS_VALUE:
        label = _('Active (unlimited)');
        break;
      case ACTIVE_NO_VALUE:
        label = _('Inactive');
        break;
      default:
        label = bulked
          ? _('Active for > {{value}} days', {value})
          : _('Active for the next {{value}} days', {value});
        break;
    }
    return {
      value: count,
      label,
      bulked,
      toolTip: `${label}: ${perc}% (${count})`,
      color: activeDaysColorScale(colorCounter++),
      filterValue: String(value),
    } as TransformedActiveDaysDataItems;
  });

  const result = transformedData as TransformedActiveDaysData;
  result.total = sum;
  return result;
};

export const OverridesActiveDaysDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterChanged,
  onFilterIdChanged,
  ...props
}: OverrideActiveDaysDisplayProps) => {
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

  const handleDataClick = ({filterValue, bulked = false}) => {
    if (!isDefined(onFilterChanged) || isEmpty(filterValue)) {
      return;
    }

    const activeDaysTerm = bulked
      ? FilterTerm.fromString(`active_days>"${filterValue}"`)
      : FilterTerm.fromString(`active_days="${filterValue}"`);

    if (isDefined(filter) && filter.hasTerm(activeDaysTerm)) {
      return;
    }
    const activeDaysFilter = QueryFilter.fromTerm(activeDaysTerm);

    const newFilter = isDefined(displayFilter)
      ? displayFilter.copy().and(activeDaysFilter)
      : activeDaysFilter;

    onFilterChanged(newFilter);
  };

  return (
    <>
      <OverridesActiveDaysLoader filter={displayFilter}>
        {loaderProps => (
          <DataDisplay<
            ActiveDaysData,
            OverrideActiveDaysDataDisplayProps,
            TransformedActiveDaysData
          >
            {...props}
            {...loaderProps}
            dataTransform={transformActiveDaysData}
            filter={displayFilter}
            icons={DataDisplayIcons}
            initialState={{}}
            title={({data}) =>
              _('Overrides by Active Days (Total: {{count}})', {
                count: data.total,
              })
            }
            onSelectFilterClick={showFilterSelection ? selectFilter : undefined}
          >
            {({width, height, data, svgRef, state}) => (
              <DonutChart
                data={data}
                height={height}
                showLegend={state.showLegend}
                svgRef={svgRef}
                width={width}
                onDataClick={
                  isDefined(onFilterChanged) ? handleDataClick : undefined
                }
              />
            )}
          </DataDisplay>
        )}
      </OverridesActiveDaysLoader>
      {filterSelectionDialog}
    </>
  );
};

OverridesActiveDaysDisplay.displayId = 'override-by-active-days';

export const OverridesActiveDaysTableDisplay = createDisplay({
  loaderComponent: OverridesActiveDaysLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label, row.value]}
      dataTitles={[_('Active'), _('# of Overrides')]}
      dataTransform={transformActiveDaysData}
      title={({data}) =>
        _('Overrides by Active Days (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayName: 'OverridesActiveDaysTableDisplay',
  displayId: 'override-by-active-days-table',
  filtersFilter: OVERRIDES_FILTER_FILTER,
});

registerDisplay(
  OverridesActiveDaysDisplay,
  _l('Chart: Overrides by Active Days'),
);

registerDisplay(
  OverridesActiveDaysTableDisplay,
  _l('Table: Overrides by Active Days'),
);
