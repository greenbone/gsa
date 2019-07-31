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
import Theme from 'web/utils/theme';

import ComplianceStatusBar from '../compliancestatusbar';

describe('ComplianceStatusBar tests', () => {
  test('should render', () => {
    const {element} = render(<ComplianceStatusBar complianceStatus={75} />);

    expect(element).toMatchSnapshot();
  });

  test('should render text content', () => {
    const {element} = render(<ComplianceStatusBar complianceStatus={75} />);
    expect(element).toHaveTextContent('75%');
  });

  test('should render title', () => {
    const {getByTestId} = render(<ComplianceStatusBar complianceStatus={75} />);
    const progressbarBox = getByTestId('progressbar-box');

    expect(progressbarBox).toHaveAttribute('title', '75%');
  });

  test('should render progress', () => {
    const {getByTestId} = render(<ComplianceStatusBar complianceStatus={75} />);
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '75%');
  });

  test('should not render progress > 100', () => {
    const {element, getByTestId} = render(
      <ComplianceStatusBar complianceStatus={101} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '100%');
    expect(element).toHaveTextContent('N/A');
  });

  test('should not render progress < 0', () => {
    const {element, getByTestId} = render(
      <ComplianceStatusBar complianceStatus={-1} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('width', '0%');
    expect(element).toHaveTextContent('N/A');
  });

  test('should render background for high compliance', () => {
    const {getByTestId} = render(
      <ComplianceStatusBar complianceStatus={100} />,
    );
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.paleGreen);
  });

  test('should render background for medium compliance', () => {
    const {getByTestId} = render(<ComplianceStatusBar complianceStatus={75} />);
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.goldYellow);
  });

  test('should render background for low compliance', () => {
    const {getByTestId} = render(<ComplianceStatusBar complianceStatus={25} />);
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule('background', Theme.errorRed);
  });
});
