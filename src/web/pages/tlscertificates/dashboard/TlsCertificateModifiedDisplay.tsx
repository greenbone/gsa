/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {type Date} from 'gmp/models/date';
import {TLS_CERTIFICATES_FILTER_FILTER} from 'gmp/models/filter';
import {parseInt, parseDate} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import LineChart from 'web/components/chart/LineChart';
import {type DashboardDisplayProps} from 'web/components/dashboard/DashboardView';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useFilterSelection from 'web/components/dashboard/display/useFilterSelection';
import {
  createDateRangeFilter,
  totalCount,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type TlsCertificateModifiedData,
  TlsCertificatesModifiedLoader,
} from 'web/pages/tlscertificates/dashboard/TlsCertificatesLoaders';
import Theme from 'web/utils/theme';
import {formattedUserSettingShortDate} from 'web/utils/user-setting-time-date-formatters';

interface TransformedTlsCertificateModifiedDataItem {
  x: Date;
  label: string;
  y: number;
  y2: number;
}

interface TransformedTlsCertificateModifiedData extends Array<TransformedTlsCertificateModifiedDataItem> {
  total: number;
}

type TlsCertificateModifiedDataDisplayProps = DataDisplayProps<
  TlsCertificateModifiedData,
  TransformedTlsCertificateModifiedData
>;

type TlsCertificateModifiedDisplayProps = DashboardDisplayProps;

const transformModified = (
  data: TlsCertificateModifiedData = {},
): TransformedTlsCertificateModifiedData => {
  const {groups = []} = data;
  const sum = totalCount(groups);
  const transformedData = groups.map(group => {
    const {value, count, c_count} = group;
    const modified = parseDate(value);
    return {
      x: modified,
      label: formattedUserSettingShortDate(modified),
      y: parseInt(count),
      y2: parseInt(c_count),
    } as TransformedTlsCertificateModifiedDataItem;
  });

  const result = transformedData as TransformedTlsCertificateModifiedData;
  result.total = sum;
  return result;
};

export const TlsCertificatesModifiedDisplay = ({
  filter,
  filterId,
  showFilterSelection,
  onFilterChanged,
  onFilterIdChanged,
  ...props
}: TlsCertificateModifiedDisplayProps) => {
  const {
    filter: selectedFilter,
    selectFilter,
    filterSelectionDialog,
  } = useFilterSelection({
    filterId,
    filtersFilter: TLS_CERTIFICATES_FILTER_FILTER,
    onFilterIdChanged,
  });

  const displayFilter = showFilterSelection ? selectedFilter : filter;

  const handleRangeSelect = (start, end) => {
    if (!isDefined(onFilterChanged)) {
      return;
    }

    const {x: startDate} = start;
    const {x: endDate} = end;
    const dateFormat = 'YYYY-MM-DDTHH:mm';

    onFilterChanged(
      createDateRangeFilter({
        endDate,
        field: 'modified',
        filter: displayFilter,
        formatDate: date => date.format(dateFormat),
        startDate,
      }),
    );
  };

  return (
    <>
      <TlsCertificatesModifiedLoader filter={displayFilter}>
        {loaderProps => (
          <DataDisplay<
            TlsCertificateModifiedData,
            TlsCertificateModifiedDataDisplayProps,
            TransformedTlsCertificateModifiedData
          >
            {...props}
            {...loaderProps}
            dataTransform={transformModified}
            filter={displayFilter}
            title={({data}) =>
              _('TLS Certificates by Modification Time (Total: {{count}})', {
                count: data.total,
              })
            }
            onSelectFilterClick={showFilterSelection ? selectFilter : undefined}
          >
            {({width, height, data, svgRef, state}) => (
              <LineChart
                timeline
                data={data}
                height={height}
                showLegend={state.showLegend}
                svgRef={svgRef}
                width={width}
                xAxisLabel={_('Time')}
                y2AxisLabel={_('Total TLS Certificates')}
                y2Line={{
                  color: Theme.darkGreenTransparent,
                  dashArray: '3, 2',
                  label: _('Total TLS Certificates'),
                }}
                yAxisLabel={_('# of Modified TLS Certificates')}
                yLine={{
                  color: Theme.darkGreenTransparent,
                  label: _('Modified TLS Certificates'),
                }}
                onRangeSelected={handleRangeSelect}
              />
            )}
          </DataDisplay>
        )}
      </TlsCertificatesModifiedLoader>
      {filterSelectionDialog}
    </>
  );
};

TlsCertificatesModifiedDisplay.displayId =
  'tls-certificates-by-modification-time';

export const TlsCertificatesModifiedTableDisplay = createDisplay({
  loaderComponent: TlsCertificatesModifiedLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label, row.y, row.y2]}
      dataTitles={[
        _('Creation Time'),
        _('# of Modified Certificates'),
        _('Total Certificates'),
      ]}
      dataTransform={transformModified}
      title={({data}) =>
        _('TLS Certificates by Modification Time (Total: {{count}})', {
          count: data.total,
        })
      }
    />
  ),
  filtersFilter: TLS_CERTIFICATES_FILTER_FILTER,
  displayId: 'tls-certificates-by-modification-time-table',
  displayName: 'TlsCertificatesModifiedTableDisplay',
});

registerDisplay(
  TlsCertificatesModifiedDisplay,
  _l('Chart: TLS Certificates by Modification Time'),
);

registerDisplay(
  TlsCertificatesModifiedTableDisplay,
  _l('Table: TLS Certificates by Modification Time'),
);
