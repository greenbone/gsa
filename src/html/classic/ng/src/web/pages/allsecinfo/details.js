/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import PropTypes from '../../utils/proptypes.js';

import CpeDetails from '../cpes/details.js';
import CveDetails from '../cves/details.js';
import CertBundAdvDetails from '../certbund/details.js';
import DfnCertAdvDetails from '../dfncert/details.js';
import NvtDetails from '../nvts/details.js';
import OvalDefDetails from '../ovaldefs/details.js';

const AllSecinfoDetails = props => {
  switch (props.entity.info_type) {
    case 'nvt':
      return <NvtDetails {...props}/>;
    case 'cpe':
      return <CpeDetails {...props}/>;
    case 'cve':
      return <CveDetails {...props}/>;
    case 'dfn_cert_adv':
      return <DfnCertAdvDetails {...props}/>;
    case 'cert_bund_adv':
      return <CertBundAdvDetails {...props}/>;
    case 'ovaldef':
      return <OvalDefDetails {...props}/>;
    default:
      return null;
  }
};

AllSecinfoDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default AllSecinfoDetails;

// vim: set ts=2 sw=2 tw=80:
