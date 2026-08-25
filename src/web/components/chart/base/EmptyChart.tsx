/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

interface EmptyChartProps {
  'data-testid'?: string;
  height: number;
  width: number;
}

const EmptyChart = ({
  'data-testid': dataTestId,
  height,
  width,
}: EmptyChartProps) => {
  const [_] = useTranslation();
  return (
    <text
      aria-label={_('No data available')}
      data-testid={dataTestId}
      dominantBaseline="middle"
      fill={Theme.mediumGray}
      fontSize="14px"
      textAnchor="middle"
      x={width / 2}
      y={height / 2}
    >
      {_('No data available')}
    </text>
  );
};

export default EmptyChart;
