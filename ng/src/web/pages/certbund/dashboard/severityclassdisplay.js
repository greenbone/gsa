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

import PropTypes from '../../../utils/proptypes';

import SeverityClassDisplay from '../../../components/dashboard2/display/severityclassdisplay'; // eslint-disable-line max-len
import {registerDisplay} from '../../../components/dashboard2/registry';

import {CertBundSeverityLoader} from './loaders';

const CertBundSeverityDisplay = ({
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

CertBundSeverityDisplay.propTypes = {
  filter: PropTypes.filter,
};

const DISPLAY_ID = 'cert_bund_adv-by-severity-class';

CertBundSeverityDisplay.displayId = DISPLAY_ID;

registerDisplay(DISPLAY_ID, CertBundSeverityDisplay, {
  title: _('CERT-Bund Advisories by Severity Class'),
});

export default CertBundSeverityDisplay;

// vim: set ts=2 sw=2 tw=80:
