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

import {NvtsSeverityLoader} from './loaders';

export const NvtsCvssDisplay = ({
  filter,
  ...props
}) => (
  <NvtsSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssDisplay
        {...props}
        {...loaderProps}
        yLabel={_('# of NVTs')}
        filter={filter}
        title={({data: tdata}) =>
          _('NVTs by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </NvtsSeverityLoader>
);

NvtsCvssDisplay.propTypes = {
  filter: PropTypes.filter,
};

NvtsCvssDisplay.displayId = 'nvt-by-cvss';

export const NvtsCvssTableDisplay = ({
  filter,
  ...props
}) => (
  <NvtsSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssTableDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        dataTitles={[_('Severity'), _('# of NVTs')]}
        title={({data: tdata = {}}) =>
          _('NVTs by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </NvtsSeverityLoader>
);

NvtsCvssTableDisplay.propTypes = {
  filter: PropTypes.filter,
};

NvtsCvssTableDisplay.displayId = 'nvt-by-cvss-table';

registerDisplay(NvtsCvssDisplay.displayId, NvtsCvssDisplay, {
  title: _('Chart: NVTs by CVSS'),
});

registerDisplay(NvtsCvssTableDisplay.displayId, NvtsCvssTableDisplay, {
  title: _('Table: NVTs by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
