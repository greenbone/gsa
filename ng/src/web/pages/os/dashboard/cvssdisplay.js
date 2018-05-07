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

import CvssDisplay from 'web/components/dashboard2/display/cvss/cvssdisplay';
import CvssTableDisplay from 'web/components/dashboard2/display/cvss/cvsstabledisplay';  // eslint-disable-line max-len
import {registerDisplay} from 'web/components/dashboard2/registry';

import {OsAverageSeverityLoader} from './loaders';

export const OsCvssDisplay = ({
  filter,
  ...props
}) => (
  <OsAverageSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssDisplay
        {...props}
        {...loaderProps}
        yLabel={_('# of Vulnerabilities')}
        filter={filter}
        dataTitles={[_('Severity'), _('# of Operating Systems')]}
        title={({data: tdata}) =>
          _('Operating Systems by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </OsAverageSeverityLoader>
);

OsCvssDisplay.propTypes = {
  filter: PropTypes.filter,
};

OsCvssDisplay.displayId = 'os-by-cvss';


export const OsCvssTableDisplay = ({
  filter,
  ...props
}) => (
  <OsAverageSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssTableDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        dataTitles={[_('Severity'), _('# of Operating Systems')]}
        title={({data: tdata = {}}) =>
          _('Operating Systems by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </OsAverageSeverityLoader>
);

OsCvssTableDisplay.propTypes = {
  filter: PropTypes.filter,
};

OsCvssTableDisplay.displayId = 'os-by-cvss-table';

registerDisplay(OsCvssTableDisplay.displayId, OsCvssTableDisplay, {
  title: _('Table: Operating Systems by CVSS'),
});

registerDisplay(OsCvssDisplay.displayId, OsCvssDisplay, {
  title: _('Operating Systems by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
