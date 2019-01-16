/* Copyright (C) 2018-2019 Greenbone Networks GmbH
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
