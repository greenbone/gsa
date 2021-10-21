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

  test('should render colors', () => {
    const {getByTestId} = render(
      <ComplianceStatusBar complianceStatus={100} />,
    );
    const progress = getByTestId('progress');
    const progressbarBox = getByTestId('progressbar-box');

    expect(progress).toHaveStyleRule('background', Theme.statusRunGreen);
    expect(progressbarBox).toHaveStyleRule('background', Theme.errorRed);
  });

  test('should render gray background for N/A', () => {
    const {getByTestId} = render(<ComplianceStatusBar complianceStatus={-1} />);
    const progress = getByTestId('progress');
    const progressbarBox = getByTestId('progressbar-box');

    expect(progress).toHaveStyleRule('background', Theme.statusRunGreen);
    expect(progress).toHaveStyleRule('width', '0%');

    expect(progressbarBox).toHaveStyleRule('background', Theme.darkGray);
  });
});
