/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {CPES_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {CpesSeverityLoader} from 'web/pages/cpes/dashboard/CpeLoaders';

export const CpesCvssDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: props => (
    <CvssDisplay
      {...props}
      title={({data}) =>
        _('CPEs by CVSS (Total: {{count}})', {count: data.total})
      }
      yLabel={_('# of CPEs')}
    />
  ),
  filtersFilter: CPES_FILTER_FILTER,
  displayId: 'cpe-by-cvss',
  displayName: 'CpesCvssDisplay',
});

export const CpesCvssTableDisplay = createDisplay({
  loaderComponent: CpesSeverityLoader,
  displayComponent: props => (
    <CvssTableDisplay
      {...props}
      dataTitles={[_('Severity'), _('# of CPEs')]}
      title={({data}) =>
        _('CPEs by CVSS (Total: {{count}})', {count: data.total})
      }
    />
  ),
  filtersFilter: CPES_FILTER_FILTER,
  displayId: 'cpe-by-cvss-table',
  displayName: 'CpesCvssTableDisplay',
});

registerDisplay(CpesCvssDisplay, _l('Chart: CPEs by CVSS'));

registerDisplay(CpesCvssTableDisplay, _l('Table: CPEs by CVSS'));
