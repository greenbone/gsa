/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import EmptyChart from 'web/components/chart/base/EmptyChart';

interface ChartWithEmptyStateProps {
  'data-testid'?: string;
  children: React.ReactNode;
  height: number;
  isEmpty: boolean;
  width: number;
}

const ChartWithEmptyState = ({
  'data-testid': dataTestId,
  children,
  height,
  isEmpty,
  width,
}: ChartWithEmptyStateProps) =>
  isEmpty ? (
    <EmptyChart data-testid={dataTestId} height={height} width={width} />
  ) : (
    children
  );

export default ChartWithEmptyState;
