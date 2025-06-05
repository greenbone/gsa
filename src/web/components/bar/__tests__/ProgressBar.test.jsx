/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import ProgressBar from 'web/components/bar/ProgressBar';
import {screen, render} from 'web/testing';
import Theme from 'web/utils/Theme';

describe('ProgressBar tests', () => {
  test('should render', () => {
    const {element} = render(
      <ProgressBar background="low" progress="10" title="Progress" />,
    );
    expect(element).toBeVisible();
  });

  test('should render title', () => {
    const {element} = render(
      <ProgressBar background="low" progress="10" title="Progress" />,
    );
    expect(element).toHaveAttribute('title', 'Progress');
  });

  test('should render progress', () => {
    render(<ProgressBar background="low" progress="90" title="Progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule('width', '90%');
  });

  test('should not render progress > 100', () => {
    render(<ProgressBar background="low" progress="101" title="Progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule('width', '100%');
  });

  test('should not render progress < 0', () => {
    render(<ProgressBar background="low" progress="-1" title="Progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule('width', '0%');
  });

  test('should render background = warn', () => {
    render(<ProgressBar background="warn" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.severityWarnYellow} 0%, ${Theme.severityWarnYellow} 100%)`,
    );
  });

  test('should render background = error', () => {
    render(<ProgressBar background="error" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.errorRed} 0%, ${Theme.errorRed} 100%)`,
    );
  });

  test('should render background = low', () => {
    render(<ProgressBar background="low" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.severityLowBlue} 0%, ${Theme.severityLowBlue} 100%)`,
    );
  });

  test('should render background = new', () => {
    render(<ProgressBar background="new" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.statusNewGreen} 0%, ${Theme.statusNewGreen} 100%)`,
    );
  });

  test('should render background = run', () => {
    render(<ProgressBar background="run" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, ${Theme.statusRunGreen} 0%, ${Theme.statusRunGreen} 100%)`,
    );
  });

  test('should render background = log', () => {
    render(<ProgressBar background="log" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveStyleRule(
      'background',
      `linear-gradient(90deg, gray 0%, gray 100%)`,
    );
  });

  test('should render box background', () => {
    render(
      <ProgressBar
        background="run"
        boxBackground={Theme.errorRed}
        progress="10"
        title="Progress"
      />,
    );
    const progressbarBox = screen.getByTestId('progressbar-box');
    expect(progressbarBox).toHaveStyleRule('background', Theme.errorRed);
  });

  test('should render gray box background by default', () => {
    render(<ProgressBar background="run" progress="10" title="Progress" />);
    const progressbarBox = screen.getByTestId('progressbar-box');
    expect(progressbarBox).toHaveStyleRule('background', Theme.darkGray);
  });
});
