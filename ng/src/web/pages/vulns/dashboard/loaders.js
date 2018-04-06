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

import Loader, {loadFunc} from '../../../components/dashboard2/data/loader';

export const VULNS_SEVERITY = 'vulns-severity';

export const vulnsSeverityLoader = loadFunc(
  ({gmp}) => gmp.vulns.getSeverityAggregates().then(r => r.data),
  VULNS_SEVERITY);

export const VulnsSeverityLoader = props => (
  <Loader
    {...props}
    dataId={VULNS_SEVERITY}
    load={vulnsSeverityLoader}
    subscriptions={[
      'vulns.timer',
      'vulns.changed',
    ]}
  />
);
// vim: set ts=2 sw=2 tw=80:
