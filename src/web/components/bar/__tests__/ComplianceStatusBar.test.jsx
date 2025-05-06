/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ComplianceStatusBar from 'web/components/bar/ComplianceStatusBar';
import {render} from 'web/utils/Testing';
import Theme from 'web/utils/Theme';

describe('ComplianceStatusBar tests', () => {
  test('should render', () => {
    const {element} = render(<ComplianceStatusBar complianceStatus={75} />);

    expect(element).toBeVisible();
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

    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.statusRunGreen} 0%, ${Theme.statusRunGreen} 100%)`,
    );
    expect(progressbarBox).toHaveStyleRule('background', Theme.errorRed);
  });

  test('should render gray background for N/A', () => {
    const {getByTestId} = render(<ComplianceStatusBar complianceStatus={-1} />);
    const progress = getByTestId('progress');
    const progressbarBox = getByTestId('progressbar-box');

    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.statusRunGreen} 0%, ${Theme.statusRunGreen} 100%)`,
    );
    expect(progress).toHaveStyleRule('width', '0%');

    expect(progressbarBox).toHaveStyleRule('background', Theme.darkGray);
  });
});
