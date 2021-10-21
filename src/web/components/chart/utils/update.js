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

/**
 * Default implementation for checking if a chart component must be updated
 *
 * A chart must always be re-rendered if data, width or height has changed.
 *
 * @param {Object} nextProps Next props to be set
 * @param {Object} props     Current set props
 *
 * @returns {Boolean} true if the chart component must be re-rendered
 */
export const shouldUpdate = (nextProps, props) =>
  nextProps.data !== props.data ||
  nextProps.width !== props.width ||
  nextProps.height !== props.height ||
  nextProps.showLegend !== props.showLegend;

// vim: set ts=2 sw=2 tw=80:
