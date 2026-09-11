/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {DFNCERT_FILTER_FILTER} from 'gmp/models/filter';
import transformCreated from 'web/components/dashboard/display/created/created-transform';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {DfnCertsCreatedLoader} from 'web/pages/dfncert/dashboard/DfnCertLoaders';
import Theme from 'web/utils/theme';

export const DfnCertsCreatedDisplay = createDisplay({
  loaderComponent: DfnCertsCreatedLoader,
  displayComponent: props => (
    <CreatedDisplay
      {...props}
      title={() => _('DFN-CERT Advisories by Creation Time')}
      xAxisLabel={_('Time')}
      y2AxisLabel={_('Total DFN-CERT Advs')}
      y2Line={{
        color: Theme.darkGreenTransparent,
        dashArray: '3, 2',
        label: _('Total DFN-CERT Advs'),
      }}
      yAxisLabel={_('# of created DFN-CERT Advs')}
      yLine={{
        color: Theme.darkGreenTransparent,
        label: _('Created DFN-CERT Advs'),
      }}
    />
  ),
  displayId: 'dfn_cert_adv-by-created',
  displayName: 'DfnCertsCreatedDisplay',
  filtersFilter: DFNCERT_FILTER_FILTER,
});

export const DfnCertsCreatedTableDisplay = createDisplay({
  loaderComponent: DfnCertsCreatedLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label ?? '', row.y, row.y2]}
      dataTitles={[
        _('Creation Time'),
        _('# of DFN-CERT Advs'),
        _('Total DFN-CERT Advs'),
      ]}
      dataTransform={transformCreated}
      title={() => _('DFN-CERT Advisories by Creation Time')}
    />
  ),
  displayId: 'dfn_cert_adv-by-created-table',
  displayName: 'DfnCertsCreatedTableDisplay',
  filtersFilter: DFNCERT_FILTER_FILTER,
});

registerDisplay(
  DfnCertsCreatedTableDisplay,
  _l('Table: DFN-CERT Advisories by Creation Time'),
);

registerDisplay(
  DfnCertsCreatedDisplay,
  _l('Chart: DFN-CERT Advisories by Creation Time'),
);
