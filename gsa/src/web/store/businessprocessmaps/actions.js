/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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
export const LOAD_BUSINESS_PROCESS_MAPS_SUCCESS =
  'LOAD_BUSINESS_PROCESS_MAPS_SUCCESS';

export const getBusinessProcessMapsAction = data => ({
  type: LOAD_BUSINESS_PROCESS_MAPS_SUCCESS,
  data,
});

export const loadBusinessProcessMaps = gmp => () => dispatch =>
  gmp.user
    .getBusinessProcessMaps()
    .then(response => dispatch(getBusinessProcessMapsAction(response.data)));

export const saveBusinessProcessMap = gmp => map => dispatch =>
  gmp.user
    .saveBusinessProcessMaps(map)
    .then(response => dispatch(getBusinessProcessMapsAction(map)));

// vim: set ts=2 sw=2 tw=80:
