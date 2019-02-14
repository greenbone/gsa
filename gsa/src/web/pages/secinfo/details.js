/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import {secInfoType} from 'gmp/models/secinfo';

import PropTypes from '../../utils/proptypes.js';

import CpeDetails from '../cpes/details.js';
import CveDetails from '../cves/details.js';
import CertBundDetails from '../certbund/details.js';
import DfnCertDetails from '../dfncert/details.js';
import NvtDetails from '../nvts/details.js';
import OvalDefDetails from '../ovaldefs/details.js';

const SecinfoDetails = props => {
  switch (secInfoType(props.entity)) {
    case 'nvt':
      return <NvtDetails {...props} />;
    case 'cpe':
      return <CpeDetails {...props} />;
    case 'cve':
      return <CveDetails {...props} />;
    case 'dfn_cert_adv':
      return <DfnCertDetails {...props} />;
    case 'cert_bund_adv':
      return <CertBundDetails {...props} />;
    case 'ovaldef':
      return <OvalDefDetails {...props} />;
    default:
      return null;
  }
};

SecinfoDetails.propTypes = {
  entity: PropTypes.model.isRequired,
};

export default SecinfoDetails;

// vim: set ts=2 sw=2 tw=80:
