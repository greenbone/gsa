/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {screen, render} from 'web/testing';
import ProgressBar from 'web/components/bar/ProgressBar';
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
    expect(progress).toHaveComputedStyle('width', '90%');
  });

  test('should not render progress > 100', () => {
    render(<ProgressBar background="low" progress="101" title="Progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveComputedStyle('width', '100%');
  });

  test('should not render progress < 0', () => {
    render(<ProgressBar background="low" progress="-1" title="Progress" />);
    const progress = screen.getByTestId('progress');
    expect(progress).toHaveComputedStyle('width', '0%');
  });

  test('should render background = warn', () => {
    render(<ProgressBar background="warn" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    const actualValue =
      getComputedStyle(progress).getPropertyValue('background');
    expect(actualValue).toContain('linear-gradient');
    expect(actualValue).toContain(Theme.severityWarnYellow);
  });

  test('should render background = error', () => {
    render(<ProgressBar background="error" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    const actualValue =
      getComputedStyle(progress).getPropertyValue('background');
    expect(actualValue).toContain('linear-gradient');
    expect(actualValue).toContain(Theme.errorRed);
  });

  test('should render background = low', () => {
    render(<ProgressBar background="low" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    const actualValue =
      getComputedStyle(progress).getPropertyValue('background');
    expect(actualValue).toContain('linear-gradient');
    expect(actualValue).toContain(Theme.severityLowBlue);
  });

  test('should render background = new', () => {
    render(<ProgressBar background="new" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    const actualValue =
      getComputedStyle(progress).getPropertyValue('background');
    expect(actualValue).toContain('linear-gradient');
    expect(actualValue).toContain(Theme.statusNewGreen);
  });

  test('should render background = run', () => {
    render(<ProgressBar background="run" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    const actualValue =
      getComputedStyle(progress).getPropertyValue('background');
    expect(actualValue).toContain('linear-gradient');
    expect(actualValue).toContain(Theme.statusRunGreen);
  });

  test('should render background = log', () => {
    render(<ProgressBar background="log" progress="10" title="Progress" />);
    const progress = screen.getByTestId('progress');
    const actualValue =
      getComputedStyle(progress).getPropertyValue('background');
    expect(actualValue).toContain('linear-gradient');
    expect(actualValue).toContain('gray');
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
    expect(progressbarBox).toHaveBackgroundColor(Theme.errorRed);
  });

  test('should render gray box background by default', () => {
    render(<ProgressBar background="run" progress="10" title="Progress" />);
    const progressbarBox = screen.getByTestId('progressbar-box');
    expect(progressbarBox).toHaveBackgroundColor(Theme.darkGray);
  });
});
