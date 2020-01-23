/* Copyright (C) 2020 Greenbone Networks GmbH
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

export const saveBusinessProcessMapAction = gmp => defaults => dispatch =>
  gmp.user
    .saveBusinessProcessMaps(defaults)
    .then(response => dispatch(getBusinessProcessMapsAction(defaults)));

// vim: set ts=2 sw=2 tw=80:
