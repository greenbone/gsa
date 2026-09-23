/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {scaleOrdinal} from 'd3-scale';
import {_, _l} from 'gmp/locale/lang';
import {TLS_CERTIFICATES_FILTER_FILTER} from 'gmp/models/filter';
import {
  TIME_STATUS,
  type TimeStatus,
  getTranslatableTimeStatus,
} from 'gmp/models/tls-certificate';
import {isDefined} from 'gmp/utils/identity';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import StatusDisplay from 'web/components/dashboard/display/status/StatusDisplay';
import {percent} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type TlsCertificatesData,
  TlsCertificatesStatusLoader,
} from 'web/pages/tlscertificates/dashboard/TlsCertificatesLoaders';
import Theme from 'web/utils/theme';

interface TransformedTlsCertificateTimeStatusDataItem {
  value: number;
  label: string;
  toolTip: string;
  color: string;
  filterValue: string;
}

interface TransformedTlsCertificateTimeStatusData extends Array<TransformedTlsCertificateTimeStatusDataItem> {
  total: number;
}

const timeStatusColorScale = scaleOrdinal()
  .domain(Object.values(TIME_STATUS).sort())
  .range([
    Theme.warningRed, // expired
    Theme.severityWarnYellow, // inactive
    Theme.lightGray, // unknown
    Theme.complianceYes, // valid
  ]);

const transformTimeStatusData = (
  tlsCertificates: TlsCertificatesData = [],
): TransformedTlsCertificateTimeStatusData => {
  const groups: Record<TimeStatus, number> = tlsCertificates.reduce(
    (prev, cert) => {
      const {timeStatus} = cert;
      if (!isDefined(timeStatus)) {
        return prev;
      }
      const count = prev[timeStatus] ?? 0;
      prev[timeStatus] = count + 1;
      return prev;
    },
    {} as Record<TimeStatus, number>,
  );

  const transformedData = Object.entries(groups).map(([value, count]) => {
    const perc = percent(count, tlsCertificates.length);
    const label = getTranslatableTimeStatus(value as TimeStatus);
    return {
      value: count,
      label,
      toolTip: `${label}: ${perc}% (${count})`,
      color: timeStatusColorScale(value),
      filterValue: value,
    } as TransformedTlsCertificateTimeStatusDataItem;
  });

  const result = transformedData as TransformedTlsCertificateTimeStatusData;
  result.total = tlsCertificates.length;
  return result;
};

export const TlsCertificateTimeStatusDisplay = createDisplay({
  loaderComponent: TlsCertificatesStatusLoader,
  displayComponent: props => (
    <StatusDisplay
      {...props}
      dataTransform={transformTimeStatusData}
      title={({data}) =>
        _('TLS Certificates by Status (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'tls-certificates-by-status',
  filtersFilter: TLS_CERTIFICATES_FILTER_FILTER,
  filterTerm: 'time_status',
});

export const TlsCertificateTimeStatusTableDisplay = createDisplay({
  loaderComponent: TlsCertificatesStatusLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label, row.value]}
      dataTitles={[_('Status'), _('# of Certificates')]}
      dataTransform={transformTimeStatusData}
      title={({data}) =>
        _('TLS Certificates by Status (Total: {{count}})', {count: data.total})
      }
    />
  ),
  displayId: 'tls-certificates-by-status-table',
  displayName: 'TlsCertificateTimeStatusTableDisplay',
  filtersFilter: TLS_CERTIFICATES_FILTER_FILTER,
});

registerDisplay(
  TlsCertificateTimeStatusDisplay,
  _l('Chart: TLS Certificates by Status'),
);

registerDisplay(
  TlsCertificateTimeStatusTableDisplay,
  _l('Table: TLS Certificates by Status'),
);
