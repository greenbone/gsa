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

import PropTypes from '../../../utils/proptypes';

import Loader, {loadFunc} from '../../../components/dashboard2/data/loader';

const loaderPropTypes = {
  children: PropTypes.func,
  filter: PropTypes.filter,
};

export const OS_VULN_SCORE = 'os-by-most-vulnerable';
const OS_MAX_GROUPS = 10;

export const osVulnScoreLoader = loadFunc(
  ({gmp, filter}) => gmp.operatingsystems.getVulnScoreAggregates(
    {filter, max: OS_MAX_GROUPS})
    .then(r => r.data),
  OS_VULN_SCORE);

export const OsVulnScoreLoader = ({
  children,
  filter,
}) => (
  <Loader
    dataId={OS_VULN_SCORE}
    filter={filter}
    load={osVulnScoreLoader}
    subscripions={[
      'os.timer',
      'os.changed',
    ]}
  >
    {children}
  </Loader>
);

OsVulnScoreLoader.propTypes = loaderPropTypes;
