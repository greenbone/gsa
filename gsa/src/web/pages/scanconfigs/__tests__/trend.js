/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
/* eslint-disable no-console */
import React from 'react';

import {
  SCANCONFIG_TREND_DYNAMIC,
  SCANCONFIG_TREND_STATIC,
} from 'gmp/models/scanconfig';

import {render} from 'web/utils/testing';

import Trend from '../trend';

import {setLocale} from 'gmp/locale/lang';

setLocale('en');

describe('Scan Config Trend tests', () => {
  test('should render', () => {
    const {element} = render(
      <Trend
        titleDynamic="Dynamic"
        titleStatic="Static"
        trend={SCANCONFIG_TREND_DYNAMIC}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render static title', () => {
    const {getByTestId} = render(
      <Trend
        titleDynamic="Dynamic"
        titleStatic="Static"
        trend={SCANCONFIG_TREND_STATIC}
      />,
    );

    const trendIcon = getByTestId('svg-icon');

    expect(trendIcon).toHaveAttribute('title', 'Static');
    expect(trendIcon).toHaveTextContent('trend_nochange.svg');
  });

  test('should render dynamic title', () => {
    const {getByTestId} = render(
      <Trend
        titleDynamic="Dynamic"
        titleStatic="Static"
        trend={SCANCONFIG_TREND_DYNAMIC}
      />,
    );

    const trendIcon = getByTestId('svg-icon');

    expect(trendIcon).toHaveAttribute('title', 'Dynamic');
    expect(trendIcon).toHaveTextContent('trend_more.svg');
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
    expect(element).not.toHaveTextContent('trend_more.svg');
    expect(element).not.toHaveTextContent('trend_nochange.svg');

    console.warn = consoleError;
  });
});
