/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {render} from 'web/utils/testing';

import Theme from 'web/utils/theme';

import SeverityBar from '../severitybar';

describe('SeverityBar tests', () => {
  test('should render', () => {
    const {element} = render(<SeverityBar severity="9.5" />);

    expect(element).toBeVisible();
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

    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.errorRed} 0%, ${Theme.errorRed} 100%)`,
    );
  });

  test('should render without severity prop', () => {
    const {getByTestId} = render(<SeverityBar />);
    const progress = getByTestId('progress');

    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.severityLowBlue} 0%, ${Theme.severityLowBlue} 100%)`,
    );
    expect(progress).toHaveStyleRule('width', '0%');
  });
});
