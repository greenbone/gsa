/* Copyright (C) 2019 Greenbone Networks GmbH
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
import React from 'react';

import {render} from 'web/utils/testing';

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

    expect(progress).toHaveStyleRule('background', '#F0A519');
  });

  test('should render background = error', () => {
    const {getByTestId} = render(
      <ProgressBar background="error" progress="10" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', '#C83814');
  });

  test('should render background = low', () => {
    const {getByTestId} = render(
      <ProgressBar background="low" progress="10" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', '#4F91C7');
  });

  test('should render background = new', () => {
    const {getByTestId} = render(
      <ProgressBar background="new" progress="10" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', '#99BE48');
  });

  test('should render background = run', () => {
    const {getByTestId} = render(
      <ProgressBar background="run" progress="10" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', '#70C000');
  });

  test('should render background = log', () => {
    const {getByTestId} = render(
      <ProgressBar background="log" progress="10" title="Progress" />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', 'gray');
  });
});
