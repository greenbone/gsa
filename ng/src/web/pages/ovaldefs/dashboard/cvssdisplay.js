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

import {OvaldefSeverityLoader} from './loaders';

const OvaldefCvssDisplay = ({
  filter,
  ...props
}) => (
  <OvaldefSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssDisplay
        {...props}
        {...loaderProps}
        yLabel={_('# of OVAL Definitions')}
        filter={filter}
        dataTitles={[_('Severity'), _('# of OVAL Definitions')]}
        title={({data: tdata}) =>
          _('OVAL Definitions by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </OvaldefSeverityLoader>
);

OvaldefCvssDisplay.propTypes = {
  filter: PropTypes.filter,
};

const DISPLAY_ID = 'ovaldef-by-cvss';

OvaldefCvssDisplay.displayId = DISPLAY_ID;

registerDisplay(DISPLAY_ID, OvaldefCvssDisplay, {
  title: _('Chart: OVAL Definitions by CVSS'),
});

export default OvaldefCvssDisplay;

// vim: set ts=2 sw=2 tw=80:
