/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {useEffect, useState} from 'react';

import {useLocation} from 'react-router-dom';

import Logger from 'gmp/log';

import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

const log = Logger.getLogger('web.observer.locationobserver');

const locationChanged = (loc, prevLoc) =>
  loc.pathname !== prevLoc.pathname || loc.search !== prevLoc.search;

const LocationObserver = props => {
  const location = useLocation();
  const [, renewSession] = useUserSessionTimeout();
  const [lastLocation, setLocation] = useState(location);

  useEffect(() => {
    // renew session if location has changed
    if (locationChanged(lastLocation, location)) {
      log.debug('Location has changed. Renewing session.');

      renewSession();
      setLocation(location);
    }
  }, [lastLocation, location, renewSession]);

  return props.children;
};

export default LocationObserver;

// vim: set ts=2 sw=2 tw=80:
