/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CERTBUND_FILTER_FILTER} from 'gmp/models/filter';
import transformCreated, {
  type CreatedDataPoint,
  type CreatedData,
} from 'web/components/dashboard/display/created/created-transform';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';
import createDisplay, {
  type DisplayProps,
} from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {CertBundCreatedLoader} from 'web/pages/certbund/dashboard/CertBundLoaders';
import Theme from 'web/utils/theme';

export const CertBundCreatedDisplay = createDisplay<
  DisplayProps<CreatedData, CreatedDataPoint[]>,
  CreatedData,
  CreatedDataPoint[]
>({
  loaderComponent: CertBundCreatedLoader,
  displayComponent: props => (
    <CreatedDisplay
      {...props}
      title={() => _('CERT-Bund Advisories by Creation Time')}
      xAxisLabel={_('Time')}
      y2AxisLabel={_('Total CERT-Bund Advisories')}
      y2Line={{
        color: Theme.darkGreenTransparent,
        dashArray: '3, 2',
        label: _('Total CERT-Bund Advs'),
      }}
      yAxisLabel={_('# of created CERT-Bund Advisories')}
      yLine={{
        color: Theme.darkGreenTransparent,
        label: _('Created CERT-Bund Advs'),
      }}
    />
  ),
  displayId: 'cert_bund_adv-by-created',
  displayName: 'CertBundCreatedDisplay',
  filtersFilter: CERTBUND_FILTER_FILTER,
});

export const CertBundCreatedTableDisplay = createDisplay({
  loaderComponent: CertBundCreatedLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      {...{children: undefined}}
      dataRow={row => [row.label ?? '', row.y, row.y2]}
      dataTitles={[
        _('Creation Time'),
        _('# of CERT-Bund Advs'),
        _('Total CERT-Bund Advs'),
      ]}
      dataTransform={transformCreated}
      title={() => _('CERT-Bund Advisories by Creation Time')}
    />
  ),
  displayId: 'cert_bund_adv-by-created-table',
  displayName: 'CertBundCreatedTableDisplay',
  filtersFilter: CERTBUND_FILTER_FILTER,
});

registerDisplay(
  CertBundCreatedTableDisplay,
  _l('Table: CERT-Bund Advisories by Creation Time'),
);

registerDisplay(
  CertBundCreatedDisplay,
  _l('Chart: CERT-Bund Advisories by Creation Time'),
);
