/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

interface UpdateProps<TData = unknown> {
  data?: TData;
  width?: number;
  height?: number;
  showLegend?: boolean;
}

/**
 * Default implementation for checking if a chart component must be updated
 *
 * A chart must always be re-rendered if data, width or height has changed.
 *
 * @param nextProps Next props to be set
 * @param props     Current set props
 *
 * @returns {boolean} true if the chart component must be re-rendered
 */
export const shouldUpdate = <TProps extends UpdateProps>(
  nextProps: TProps,
  props: TProps,
): boolean =>
  nextProps.data !== props.data ||
  nextProps.width !== props.width ||
  nextProps.height !== props.height ||
  nextProps.showLegend !== props.showLegend;
