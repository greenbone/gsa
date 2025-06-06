/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
} from 'gmp/models/scanconfig';
import Trend from 'web/pages/scanconfigs/Trend';

describe('Scan Config Trend tests', () => {
  test('should render', () => {
    const {element} = render(
      <Trend
        titleDynamic="Dynamic"
        titleStatic="Static"
        trend={SCANCONFIG_TREND_DYNAMIC}
      />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should render static title', () => {
    render(
      <Trend
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
      <Trend
        titleDynamic="Dynamic"
        titleStatic="Static"
        trend={SCANCONFIG_TREND_DYNAMIC}
      />,
    );

    const trendIcon = screen.getByTestId('trend-more-icon');
    expect(trendIcon).toHaveAttribute('title', 'Dynamic');
  });

  test('should render N/A', () => {
    // deactivate console.error for this test
    // to be able to test trend=-1
    const consoleError = console.error;
    console.error = () => {};

    const {element} = render(
      <Trend titleDynamic="Dynamic" titleStatic="Static" trend={-1} />,
    );

    expect(element).toHaveTextContent('N/A');

    console.warn = consoleError;
  });
});
