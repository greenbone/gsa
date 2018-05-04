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

import {VulnsSeverityLoader} from './loaders';

export const VulnsSeverityDisplay = ({
  filter,
  ...props
}) => (
  <VulnsSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <SeverityClassDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        dataTitles={[_('Severity Class'), _('# of Vulnerabilities')]}
        title={({data: tdata}) =>
          _('Vulnerabilities by Severity Class (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </VulnsSeverityLoader>
);

VulnsSeverityDisplay.propTypes = {
  filter: PropTypes.filter,
};

VulnsSeverityDisplay.displayId = 'vuln-by-severity-class';

export const VulnsSeverityTableDisplay = ({
  filter,
  ...props
}) => (
  <VulnsSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <SeverityClassTableDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        dataTitles={[_('Severity Class'), _('# of Vulnerabilities')]}
        title={({data: tdata}) =>
          _('Vulnerabilities by Severity Class (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </VulnsSeverityLoader>
);

VulnsSeverityTableDisplay.propTypes = {
  filter: PropTypes.filter,
};

VulnsSeverityTableDisplay.displayId = 'vuln-by-severity-class-table';

registerDisplay(VulnsSeverityDisplay.displayId, VulnsSeverityDisplay, {
  title: _('Chart: Vulnerabilities by Severity Class'),
});

registerDisplay(VulnsSeverityTableDisplay.displayId,
  VulnsSeverityTableDisplay, {
    title: _('Table: Vulnerabilities by Severity Class'),
  },
);

// vim: set ts=2 sw=2 tw=80:
