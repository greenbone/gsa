/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {scaleOrdinal} from 'd3-scale';

import {_, _l} from 'gmp/locale/lang';

import {TLS_CERTIFICATES_FILTER_FILTER} from 'gmp/models/filter';
import {
  TIME_STATUS,
  getTranslatableTimeStatus,
} from 'gmp/models/tlscertificate';

import {registerDisplay} from 'web/components/dashboard/registry';

import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len
import {percent} from 'web/components/dashboard/display/utils';

import StatusDisplay from 'web/components/dashboard/display/status/statusdisplay'; // eslint-disable-line max-len

import Theme from 'web/utils/theme';

import {TlsCertificatesStatusLoader} from './loaders';

const timeStatusColorScale = scaleOrdinal()
  .domain(Object.values(TIME_STATUS).sort())
  .range([
    Theme.warningRed, // expired
    '#f0a519', // inactive
    Theme.lightGray, // unknown
    '#2ca02c', // valid
  ]);

const transformTimeStatusData = (tlsCertificates = []) => {
  const groups = tlsCertificates.reduce((prev, cert) => {
    const count = prev[cert.timeStatus] || 0;
    prev[cert.timeStatus] = count + 1;
    return prev;
  }, {});
  const tdata = Object.entries(groups).map(([value, count]) => {
    const perc = percent(count, tlsCertificates.length);
    const label = getTranslatableTimeStatus(value);
    return {
      value: count,
      label,
      toolTip: `${label}: ${perc}% (${count})`,
      color: timeStatusColorScale(value),
      filterValue: value,
    };
  });

  tdata.total = tlsCertificates.length;

  return tdata;
};

export const TimeStatusDisplay = createDisplay({
  dataTransform: transformTimeStatusData,
  displayComponent: StatusDisplay,
  displayId: 'tls-certificates-by-status',
  title: ({data: tdata}) =>
    _('TLS Certificates by Status (Total: {{count}})', {count: tdata.total}),
  filtersFilter: TLS_CERTIFICATES_FILTER_FILTER,
  loaderComponent: TlsCertificatesStatusLoader,
  filterTerm: 'time_status',
});

export const TimeStatusTableDisplay = createDisplay({
  dataRow: row => [row.label, row.value],
  dataTitles: [_l('Status'), _l('# of Certificates')],
  dataTransform: transformTimeStatusData,
  displayComponent: DataTableDisplay,
  displayId: 'tls-certificates-by-status-table',
  displayName: 'TimeStatusTableDisplay',
  filtersFilter: TLS_CERTIFICATES_FILTER_FILTER,
  loaderComponent: TlsCertificatesStatusLoader,
  title: ({data: tdata = {}}) =>
    _('TLS Certificates by Status (Total: {{count}})', {count: tdata.total}),
});

registerDisplay(TimeStatusDisplay.displayId, TimeStatusDisplay, {
  title: _l('Chart: TLS Certificates by Status'),
});

registerDisplay(TimeStatusTableDisplay.displayId, TimeStatusTableDisplay, {
  title: _l('Table: TLS Certificates by Status'),
});
