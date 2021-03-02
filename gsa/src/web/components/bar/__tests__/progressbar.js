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
import React from 'react';

import {render} from 'web/utils/testing';

import Theme from 'web/utils/theme';

import ProgressBar from '../progressbar';

describe('ProgressBar tests', () => {
  test('should render', () => {
    const {element} = render(
      <ProgressBar background="low" progress="10" title="Progress" />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render title', () => {
    const {element} = render(
      <ProgressBar background="low" progress="10" title="Progress" />,
    );

    expect(element).toHaveAttribute('title', 'Progress');
  });

  test('should render progress', () => {
    const {getByTestId} = render(
      <ProgressBar background="low" progress="90" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '90%');
  });

  test('should not render progress > 100', () => {
    const {getByTestId} = render(
      <ProgressBar background="low" progress="101" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '100%');
  });

  test('should not render progress < 0', () => {
    const {getByTestId} = render(
      <ProgressBar background="low" progress="-1" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '0%');
  });

  test('should render background = warn', () => {
    const {getByTestId} = render(
      <ProgressBar background="warn" progress="10" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.severityWarnYellow);
  });

  test('should render background = error', () => {
    const {getByTestId} = render(
      <ProgressBar background="error" progress="10" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.errorRed);
  });

  test('should render background = low', () => {
    const {getByTestId} = render(
      <ProgressBar background="low" progress="10" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.severityLowBlue);
  });

  test('should render background = new', () => {
    const {getByTestId} = render(
      <ProgressBar background="new" progress="10" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.statusNewGreen);
  });

  test('should render background = run', () => {
    const {getByTestId} = render(
      <ProgressBar background="run" progress="10" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.statusRunGreen);
  });

  test('should render background = log', () => {
    const {getByTestId} = render(
      <ProgressBar background="log" progress="10" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', 'gray');
  });

  test('should render box background', () => {
    const {getByTestId} = render(
      <ProgressBar
        boxBackground={Theme.errorRed}
        background="run"
        progress="10"
        title="Progress"
      />,
    );
    const progressbarBox = getByTestId('progressbar-box');

    expect(progressbarBox).toHaveStyleRule('background', Theme.errorRed);
  });

  test('should render gray box background by default', () => {
    const {getByTestId} = render(
      <ProgressBar background="run" progress="10" title="Progress" />,
    );
    const progressbarBox = getByTestId('progressbar-box');

    expect(progressbarBox).toHaveStyleRule('background', Theme.darkGray);
  });
});
