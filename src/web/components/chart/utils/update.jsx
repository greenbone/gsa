/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
