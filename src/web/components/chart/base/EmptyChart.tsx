/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { _ } from 'gmp/locale/lang';
import Theme from 'web/utils/theme';

interface EmptyChartProps {
  'data-testid'?: string;
  height: number;
  width: number;
}

const EmptyChart = ({'data-testid': dataTestId, height, width}: EmptyChartProps) => (
  <text
    aria-label={_('No data available')}
    data-testid={dataTestId}
    dominantBaseline="middle"
    fill={Theme.gray}
    fontSize="14px"
    textAnchor="middle"
    x={width / 2}
    y={height / 2}
  >
    {_('No data available')}
  </text>
);

export default EmptyChart;
