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
import CvssTableDisplay from 'web/components/dashboard2/display/cvss/cvsstabledisplay'; // eslint-disable-line max-len
import {registerDisplay} from 'web/components/dashboard2/registry';

import {CpesSeverityLoader} from './loaders';

export const CpesCvssDisplay = ({
  filter,
  ...props
}) => (
  <CpesSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssDisplay
        {...props}
        {...loaderProps}
        yLabel={_('# of CPEs')}
        filter={filter}
        dataTitles={[_('Severity'), _('# of CPEs')]}
        title={({data: tdata}) =>
          _('CPEs by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </CpesSeverityLoader>
);

CpesCvssDisplay.propTypes = {
  filter: PropTypes.filter,
};

CpesCvssDisplay.displayId = 'cpe-by-cvss';

export const CpesCvssTableDisplay = ({
  filter,
  ...props
}) => (
  <CpesSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssTableDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        dataTitles={[_('Severity'), _('# of CPEs')]}
        title={({data: tdata = {}}) =>
          _('CPEs by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </CpesSeverityLoader>
);

CpesCvssTableDisplay.propTypes = {
  filter: PropTypes.filter,
};

CpesCvssTableDisplay.displayId = 'cpe-by-cvss-table';

registerDisplay(CpesCvssDisplay.displayId, CpesCvssDisplay, {
  title: _('Chart: CPEs by CVSS'),
});

registerDisplay(CpesCvssTableDisplay.displayId, CpesCvssTableDisplay, {
  title: _('Table: CPEs by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
