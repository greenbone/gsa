/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale';

import PropTypes from 'web/utils/proptypes';

import SeverityClassDisplay from 'web/components/dashboard2/display/severity/severityclassdisplay'; // eslint-disable-line max-len
import SeverityClassTableDisplay from 'web/components/dashboard2/display/severity/severityclasstabledisplay'; // eslint-disable-line max-len
import {registerDisplay} from 'web/components/dashboard2/registry';

import {CertBundSeverityLoader} from './loaders';

export const CertBundSeverityClassDisplay = ({
  filter,
  ...props
}) => (
  <CertBundSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <SeverityClassDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        dataTitles={[_('Severity Class'), _('# of CERT-Bund Advisories')]}
        title={({data: tdata}) =>
          _('CERT-Bund Advisories by Severity Class (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </CertBundSeverityLoader>
);

CertBundSeverityClassDisplay.propTypes = {
  filter: PropTypes.filter,
};

CertBundSeverityClassDisplay.displayId = 'cert_bund_adv-by-severity-class';

export const CertBundSeverityClassTableDisplay = ({
  filter,
  ...props
}) => (
  <CertBundSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <SeverityClassTableDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        dataTitles={[_('Severity Class'), _('# of CERT-Bund Advisories')]}
        title={({data: tdata = {}}) =>
          _('CERT-Bund Advisories by Severity Class (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </CertBundSeverityLoader>
);

CertBundSeverityClassTableDisplay.propTypes = {
  filter: PropTypes.filter,
};

CertBundSeverityClassTableDisplay.displayId = 'cert_bund_adv-by-severity-table';

registerDisplay(
  CertBundSeverityClassDisplay.displayId,
  CertBundSeverityClassDisplay, {
  title: _('Chart: CERT-Bund Advisories by Severity Class'),
});

registerDisplay(CertBundSeverityClassTableDisplay.displayId,
  CertBundSeverityClassTableDisplay, {
    title: _('Table: CERT-Bund Advisories by Severity Class'),
  },
);

// vim: set ts=2 sw=2 tw=80:
