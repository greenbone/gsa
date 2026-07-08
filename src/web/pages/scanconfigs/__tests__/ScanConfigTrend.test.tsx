/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
} from 'gmp/models/scan-config';
import ScanConfigTrend from 'web/pages/scanconfigs/ScanConfigTrend';

describe('ScanConfigTrend tests', () => {
  test('should render', () => {
    const {element} = render(
      <ScanConfigTrend
        titleDynamic="Dynamic"
        titleStatic="Static"
        trend={SCANCONFIG_TREND_DYNAMIC}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should render static title', () => {
    render(
      <ScanConfigTrend
        titleDynamic="Dynamic"
        titleStatic="Static"
        trend={SCANCONFIG_TREND_STATIC}
      />,
    );

    const trendIcon = screen.getByTestId('trend-nochange-icon');
    expect(trendIcon).toHaveAttribute('title', 'Static');
  });

  test('should render dynamic title', () => {
    render(
      <ScanConfigTrend
        titleDynamic="Dynamic"
        titleStatic="Static"
        trend={SCANCONFIG_TREND_DYNAMIC}
      />,
    );

    const trendIcon = screen.getByTestId('trend-more-icon');
    expect(trendIcon).toHaveAttribute('title', 'Dynamic');
  });

  test('should render N/A', () => {
    const {element} = render(
      <ScanConfigTrend
        titleDynamic="Dynamic"
        titleStatic="Static"
        // @ts-expect-error: testing invalid trend value
        trend={-1}
      />,
    );

    expect(element).toHaveTextContent('N/A');
  });
});
