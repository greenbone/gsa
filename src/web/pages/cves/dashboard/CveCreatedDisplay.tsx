/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CVES_FILTER_FILTER} from 'gmp/models/filter';
import transformCreated from 'web/components/dashboard/display/created/created-transform';
import CreatedDisplay from 'web/components/dashboard/display/created/CreatedDisplay';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {CvesCreatedLoader} from 'web/pages/cves/dashboard/CveLoaders';
import Theme from 'web/utils/theme';

export const CvesCreatedDisplay = createDisplay({
  loaderComponent: CvesCreatedLoader,
  displayComponent: props => (
    <CreatedDisplay
      {...props}
      title={() => _('CVEs by Creation Time')}
      xAxisLabel={_('Time')}
      y2AxisLabel={_('Total CVEs')}
      y2Line={{
        color: Theme.darkGreenTransparent,
        dashArray: '3, 2',
        label: _('Total CVEs'),
      }}
      yAxisLabel={_('# of created CVEs')}
      yLine={{
        color: Theme.darkGreenTransparent,
        label: _('Created CVEs'),
      }}
    />
  ),
  displayId: 'cve-by-created',
  displayName: 'CveCreatedDisplay',
  filtersFilter: CVES_FILTER_FILTER,
});

export const CvesCreatedTableDisplay = createDisplay({
  loaderComponent: CvesCreatedLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={row => [row.label ?? '', row.y, row.y2]}
      dataTitles={[_l('Creation Time'), _l('# of CVEs'), _l('Total CVEs')]}
      dataTransform={transformCreated}
      title={() => _('CVEs by Creation Time')}
    />
  ),
  displayId: 'cve-by-created-table',
  displayName: 'CveCreatedTableDisplay',
  filtersFilter: CVES_FILTER_FILTER,
});

registerDisplay(CvesCreatedTableDisplay, _l('Table: CVEs by Creation Time'));

registerDisplay(CvesCreatedDisplay, _l('Chart: CVEs by Creation Time'));
