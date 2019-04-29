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

import StatusBar from '../statusbar';

import {TASK_STATUS} from 'gmp/models/task';

describe('StatusBar tests', () => {
  test('should render', () => {
    const {element} = render(<StatusBar progress="90" status="Unknown" />);

    expect(element).toMatchSnapshot();
  });

  test('should render text content', () => {
    const {element} = render(
      <StatusBar progress="90" status={TASK_STATUS.stopped} />,
    );
    expect(element).toHaveTextContent('Stopped at 90 %');
  });

  test('should render title', () => {
    const {getByTestId} = render(
      <StatusBar progress="90" status={TASK_STATUS.stopped} />,
    );
    const progressbarBox = getByTestId('progressbar-box');

    expect(progressbarBox).toHaveAttribute('title', 'Stopped');
  });

  test('should render progress', () => {
    const {getByTestId} = render(
      <StatusBar progress="90" status={TASK_STATUS.stopped} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '90%');
  });

  test('should not render progress > 100', () => {
    const {getByTestId} = render(
      <StatusBar progress="101" status={TASK_STATUS.stopped} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '100%');
  });

  test('should not render progress < 0', () => {
    const {getByTestId} = render(
      <StatusBar progress="-1" status={TASK_STATUS.stopped} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '0%');
  });

  test('should render background', () => {
    const {getByTestId} = render(
      <StatusBar progress="90" status={TASK_STATUS.stopped} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', '#F0A519');
  });
});

// vim: set ts=2 sw=2 tw=80:
