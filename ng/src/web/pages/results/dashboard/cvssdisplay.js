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

import {ResultsSeverityLoader} from './loaders';

export const ResultsCvssDisplay = ({
  filter,
  ...props
}) => (
  <ResultsSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssDisplay
        {...props}
        {...loaderProps}
        yLabel={_('# of Results')}
        filter={filter}
        title={({data: tdata}) =>
          _('Results by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </ResultsSeverityLoader>
);

ResultsCvssDisplay.propTypes = {
  filter: PropTypes.filter,
};

ResultsCvssDisplay.displayId = 'result-by-cvss';

export const ResultsCvssTableDisplay = ({
  filter,
  ...props
}) => (
  <ResultsSeverityLoader
    filter={filter}
  >
    {loaderProps => (
      <CvssTableDisplay
        {...props}
        {...loaderProps}
        filter={filter}
        dataTitles={[_('Severity'), _('# of Results')]}
        title={({data: tdata}) =>
          _('Results by CVSS (Total: {{count}})',
            {count: tdata.total})}
      />
    )}
  </ResultsSeverityLoader>
);

ResultsCvssTableDisplay.propTypes = {
  filter: PropTypes.filter,
};

ResultsCvssTableDisplay.displayId = 'result-by-cvss-table';

registerDisplay(ResultsCvssDisplay.displayId, ResultsCvssDisplay, {
  title: _('Chart: Results by CVSS'),
});

registerDisplay(ResultsCvssTableDisplay.displayId, ResultsCvssTableDisplay, {
  title: _('Table: Results by CVSS'),
});

// vim: set ts=2 sw=2 tw=80:
