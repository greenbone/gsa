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

import {TASK_STATUS} from 'gmp/models/task';

import {render} from 'web/utils/testing';

import Theme from 'web/utils/theme';

import StatusBar from '../statusbar';

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
    const {element, getByTestId} = render(
      <StatusBar progress="101" status={TASK_STATUS.stopped} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '100%');
    expect(element).toHaveTextContent('Stopped at 100 %');
  });

  test('should not render progress < 0', () => {
    const {element, getByTestId} = render(
      <StatusBar progress="-1" status={TASK_STATUS.stopped} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '0%');
    expect(element).toHaveTextContent('Stopped at 0 %');
  });

  test('should render background', () => {
    const {getByTestId} = render(
      <StatusBar progress="90" status={TASK_STATUS.stopped} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.severityWarnYellow);
  });
});

// vim: set ts=2 sw=2 tw=80:
