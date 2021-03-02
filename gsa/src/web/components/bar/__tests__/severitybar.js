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

import SeverityBar from '../severitybar';

describe('SeverityBar tests', () => {
  test('should render', () => {
    const {element} = render(<SeverityBar severity="9.5" />);

    expect(element).toMatchSnapshot();
  });

  test('should render text content', () => {
    const {element} = render(<SeverityBar severity="9.5" />);
    expect(element).toHaveTextContent('9.5 (High)');
  });

  test('should render title', () => {
    const {getByTestId} = render(<SeverityBar severity="9.5" />);
    const progressbarBox = getByTestId('progressbar-box');

    expect(progressbarBox).toHaveAttribute('title', 'High');
  });

  test('should allow to overwrite title with toolTip', () => {
    const {element} = render(
      <SeverityBar severity="9.5" toolTip="tooltip text" />,
    );

    expect(element).toHaveAttribute('title', 'tooltip text');
  });

  test('should render progress', () => {
    const {getByTestId} = render(<SeverityBar severity="9.5" />);
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '95%');
  });

  test('should not render progress > 100', () => {
    const {getByTestId} = render(<SeverityBar severity="10.1" />);
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '100%');
  });

  test('should not render progress < 0', () => {
    const {getByTestId} = render(<SeverityBar severity="-0.1" />);
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '0%');
  });

  test('should render background', () => {
    const {getByTestId} = render(<SeverityBar severity="9.5" />);
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.errorRed);
  });

  test('should render without severity prop', () => {
    const {getByTestId} = render(<SeverityBar />);
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.severityLowBlue);
    expect(progress).toHaveStyleRule('width', '0%');
  });
});
