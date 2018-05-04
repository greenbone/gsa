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

import {CvesSeverityLoader} from './loaders';

export const CvesSeverityClassDisplay = ({
  filter,
  ...props
}) => (
  <CvesSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <SeverityClassDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        dataTitles={[_('Severity Class'), _('# of CVEs')]}
        title={({data: tdata}) =>
          _('CVEs by Severity Class (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </CvesSeverityLoader>
);

CvesSeverityClassDisplay.propTypes = {
  filter: PropTypes.filter,
};

CvesSeverityClassDisplay.displayId = 'cve-by-severity-class';

export const CvesSeverityClassTableDisplay = ({
  filter,
  ...props
}) => (
  <CvesSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <SeverityClassTableDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        dataTitles={[_('Severity Class'), _('# of CVEs')]}
        title={({data: tdata = {}}) =>
          _('CVEs by Severity Class (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </CvesSeverityLoader>
);

CvesSeverityClassTableDisplay.propTypes = {
  filter: PropTypes.filter,
};

CvesSeverityClassTableDisplay.displayId = 'cve-by-severity-table';

registerDisplay(CvesSeverityClassDisplay.displayId, CvesSeverityClassDisplay, {
  title: _('Chart: CVEs by Severity Class'),
});

registerDisplay(CvesSeverityClassTableDisplay.displayId,
  CvesSeverityClassTableDisplay, {
    title: _('Table: CVEs by Severity Class'),
  },
);

// vim: set ts=2 sw=2 tw=80:
