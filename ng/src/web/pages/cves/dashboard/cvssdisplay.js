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
import {registerDisplay} from 'web/components/dashboard2/registry';

import {CvesSeverityLoader} from './loaders';

const CvesCvssDisplay = ({
  filter,
  ...props
}) => (
  <CvesSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssDisplay
        {...props}
        {...loaderProps}
        yLabel={_('# of CVEs')}
        filter={filter}
        dataTitles={[_('Severity'), _('# of CVEs')]}
        title={({data: tdata}) =>
          _('CVEs by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </CvesSeverityLoader>
);

CvesCvssDisplay.propTypes = {
  filter: PropTypes.filter,
};

const DISPLAY_ID = 'cve-by-cvss';

CvesCvssDisplay.displayId = DISPLAY_ID;

registerDisplay(DISPLAY_ID, CvesCvssDisplay, {
  title: _('CVEs by CVSS'),
});

export default CvesCvssDisplay;

// vim: set ts=2 sw=2 tw=80:
