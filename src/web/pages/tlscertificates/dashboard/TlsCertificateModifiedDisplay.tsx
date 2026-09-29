/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {_, _l} from 'gmp/locale/lang';
import {type Date} from 'gmp/models/date';
import {TLS_CERTIFICATES_FILTER_FILTER} from 'gmp/models/filter';
import {parseInt, parseDate} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import LineChart, {type LineData} from 'web/components/chart/LineChart';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataDisplay, {
  type DataDisplayProps,
} from 'web/components/dashboard/display/DataDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import useDataTransform from 'web/components/dashboard/display/useDataTransform';
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

type TlsCertificateModifiedDataDisplayProps =
  DataDisplayProps<TransformedTlsCertificateModifiedData>;

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

export const TlsCertificatesModifiedDisplay = createDisplay({
  loaderComponent: TlsCertificatesModifiedLoader,
  displayComponent: ({data, filter, onFilterChanged, ...props}) => {
    const transformedData = useDataTransform(data, transformModified);
    const handleRangeSelect = useCallback(
      (start: LineData, end: LineData) => {
        if (!isDefined(onFilterChanged)) {
          return;
        }

        const startDate = start.x as Date;
        const endDate = end.x as Date;
        const dateFormat = 'YYYY-MM-DDTHH:mm';

        onFilterChanged(
          createDateRangeFilter({
            endDate,
            field: 'modified',
            filter,
            formatDate: date => date.format(dateFormat),
            startDate,
          }),
        );
      },
      [onFilterChanged, filter],
    );
    return (
      <DataDisplay<
        TransformedTlsCertificateModifiedData,
        TlsCertificateModifiedDataDisplayProps
      >
        {...props}
        data={transformedData}
        filter={filter}
        title={({data}) =>
          _('TLS Certificates by Modification Time (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
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
    );
  },
  filtersFilter: TLS_CERTIFICATES_FILTER_FILTER,
  displayId: 'tls-certificates-by-modification-time',
  displayName: 'TlsCertificatesModifiedDisplay',
});

export const TlsCertificatesModifiedTableDisplay = createDisplay({
  loaderComponent: TlsCertificatesModifiedLoader,
  displayComponent: ({data, ...props}) => {
    const transformedData = useDataTransform(data, transformModified);
    return (
      <DataTableDisplay
        {...props}
        data={transformedData}
        dataRow={transformedData =>
          transformedData?.map(row => [row.label, row.y, row.y2]) ?? []
        }
        dataTitles={[
          _('Creation Time'),
          _('# of Modified Certificates'),
          _('Total Certificates'),
        ]}
        title={({data}) =>
          _('TLS Certificates by Modification Time (Total: {{count}})', {
            count: data?.total ?? 0,
          })
        }
      />
    );
  },
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
