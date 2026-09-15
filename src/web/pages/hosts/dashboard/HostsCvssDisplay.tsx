/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {HOSTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import CvssDisplay from 'web/components/dashboard/display/cvss/CvssDisplay';
import CvssTableDisplay from 'web/components/dashboard/display/cvss/CvssTableDisplay';
import {registerDisplay} from 'web/components/dashboard/registry';
import {HostsSeverityLoader} from 'web/pages/hosts/dashboard/HostsLoaders';

export const HostsCvssDisplay = createDisplay({
  loaderComponent: HostsSeverityLoader,
  displayComponent: props => (
    <CvssDisplay
      {...props}
      title={({data}) =>
        _('Hosts by CVSS (Total: {{count}})', {count: data.total})
      }
      yLabel={_('# of Hosts')}
    />
  ),
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-cvss',
  displayName: 'HostsCvssDisplay',
});

export const HostsCvssTableDisplay = createDisplay({
  loaderComponent: HostsSeverityLoader,
  displayComponent: props => (
    <CvssTableDisplay
      {...props}
      dataTitles={[_('Severity'), _('# of Hosts')]}
      title={({data}) =>
        _('Hosts by CVSS (Total: {{count}})', {count: data.total})
      }
    />
  ),
  filtersFilter: HOSTS_FILTER_FILTER,
  displayId: 'host-by-cvss-table',
  displayName: 'HostsCvssTableDisplay',
});

registerDisplay(HostsCvssDisplay, _l('Chart: Hosts by CVSS'));

registerDisplay(HostsCvssTableDisplay, _l('Table: Hosts by CVSS'));
