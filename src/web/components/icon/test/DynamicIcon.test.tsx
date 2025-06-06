/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, within, render, fireEvent} from 'web/testing';
import DynamicIcon from 'web/components/icon/DynamicIcon';

const MockIcon = props => <svg {...props} data-testid="mock-icon" />;

describe('DynamicIcon', () => {
  test('renders static icon when forceStatic is true', () => {
    render(
      <DynamicIcon
        dataTestId="static-icon"
        forceStatic={true}
        icon={MockIcon}
      />,
    );
    const staticIcon = screen.getByTestId('static-icon');
    expect(staticIcon).toBeVisible();
    expect(staticIcon.querySelector('svg')).toBeVisible();
  });

  test('renders DynamicIcon when forceStatic is false', () => {
    render(
      <DynamicIcon
        dataTestId="dynamic-icon"
        forceStatic={false}
        icon={MockIcon}
      />,
    );
    const dynamicIcon = screen.getByTestId('dynamic-icon');
    expect(dynamicIcon).toBeVisible();
    expect(dynamicIcon.querySelector('svg')).toBeVisible();
  });

  test('displays loading state when onClick returns a promise', async () => {
    const mockOnClick = testing.fn<() => Promise<void>>(
      () => new Promise<void>(resolve => setTimeout(resolve, 200)),
    );
    render(
      <DynamicIcon
        dataTestId="loading-icon"
        icon={MockIcon}
        onClick={mockOnClick}
      />,
    );
    const dynamicIcon = screen.getByTestId('loading-icon');

    fireEvent.click(dynamicIcon);
    expect(mockOnClick).toHaveBeenCalled();

    expect(dynamicIcon).toHaveAttribute('title', 'Loading...');
  });

  test('does not call onClick when active is false', () => {
    const mockOnClick = testing.fn();
    render(
      <DynamicIcon
        active={false}
        dataTestId="inactive-icon"
        icon={MockIcon}
        onClick={mockOnClick}
      />,
    );
    const dynamicIcon = screen.getByTestId('inactive-icon');

    fireEvent.click(dynamicIcon);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  test('displays loading title when loading', () => {
    const mockOnClick = testing.fn<() => Promise<void>>(
      () => new Promise<void>(resolve => setTimeout(resolve, 100)),
    );
    render(
      <DynamicIcon
        dataTestId="loading-title-icon"
        icon={MockIcon}
        loadingTitle="Loading..."
        onClick={mockOnClick}
      />,
    );
    const dynamicIcon = screen.getByTestId('loading-title-icon');

    fireEvent.click(dynamicIcon);
    expect(dynamicIcon).toHaveAttribute('title', 'Loading...');
  });

  test('displays provided title when not loading', () => {
    render(
      <DynamicIcon
        dataTestId="title-icon"
        icon={MockIcon}
        title="Test Title"
      />,
    );
    const dynamicIcon = screen.getByTestId('title-icon');
    expect(dynamicIcon).toHaveAttribute('title', 'Test Title');
  });

  describe('Lucide', () => {
    test('renders Lucide icon size', () => {
      render(
        <DynamicIcon
          dataTestId="lucide-icon"
          icon={MockIcon}
          isLucide={true}
        />,
      );
      const lucideIcon = screen.getByTestId('lucide-icon');
      const svgElement = within(lucideIcon).getByText('', {
        selector: 'svg',
      });

      expect(svgElement).toHaveAttribute('color', 'black');
    });

    test('renders Lucide icon with custom size and color', () => {
      render(
        <DynamicIcon
          color="red"
          dataTestId="custom-lucide-icon"
          icon={MockIcon}
          isLucide={true}
          size="large"
        />,
      );
      const customLucideIcon = screen.getByTestId('custom-lucide-icon');
      const svgElement = within(customLucideIcon).getByText('', {
        selector: 'svg',
      });

      expect(svgElement).toHaveAttribute('color', 'red');
    });

    test('renders disabled icon', () => {
      render(
        <DynamicIcon
          active={false}
          dataTestId="disabled-icon"
          icon={MockIcon}
          isLucide={true}
          onClick={testing.fn()}
        />,
      );
      const disabledIcon = screen.getByTestId('disabled-icon');
      expect(disabledIcon.querySelector('svg')).toBeVisible();
      expect(disabledIcon).toHaveStyle('color: GrayText');
    });

    test('renders custom action icon', () => {
      render(
        <DynamicIcon
          active={true}
          color="red"
          dataTestId="action-icon"
          icon={MockIcon}
          isLucide={true}
          onClick={testing.fn()}
        />,
      );
      const actionIcon = screen.getByTestId('action-icon');

      const svg = actionIcon.querySelector('svg');
      expect(svg).toBeVisible();
      expect(actionIcon).toHaveStyle(
        '--ai-color: var(--mantine-color-red-light-color);',
      );
    });
  });
  describe('Non-Lucide', () => {
    test('renders non-Lucide icon', () => {
      render(
        <DynamicIcon
          dataTestId="non-lucide-icon"
          icon={MockIcon}
          isLucide={false}
        />,
      );
      const nonLucideIcon = screen.getByTestId('non-lucide-icon');
      expect(nonLucideIcon).toBeVisible();
      const svg = nonLucideIcon.querySelector('svg');
      expect(svg).toHaveStyle('fill: black');
    });

    test('renders non-Lucide icon with custom size and color', () => {
      render(
        <DynamicIcon
          color="blue"
          dataTestId="custom-non-lucide-icon"
          icon={MockIcon}
          isLucide={false}
          size="large"
        />,
      );
      const customNonLucideIcon = screen.getByTestId('custom-non-lucide-icon');
      const svg = customNonLucideIcon.querySelector('svg');
      expect(svg).toHaveStyle('fill: blue');
    });

    test('renders disabled non-Lucide icon', () => {
      render(
        <DynamicIcon
          active={false}
          dataTestId="disabled-non-lucide-icon"
          icon={MockIcon}
          isLucide={false}
          onClick={testing.fn()}
        />,
      );
      const disabledNonLucideIcon = screen.getByTestId(
        'disabled-non-lucide-icon',
      );
      expect(disabledNonLucideIcon.querySelector('svg')).toBeVisible();
      expect(disabledNonLucideIcon).toHaveStyle('color: GrayText');
    });

    test('renders custom action icon', () => {
      render(
        <DynamicIcon
          active={true}
          color="purple"
          dataTestId="action-icon"
          icon={MockIcon}
          isLucide={false}
          onClick={testing.fn()}
        />,
      );
      const actionIcon = screen.getByTestId('action-icon');

      expect(actionIcon).toHaveStyle('--ai-color: purple;');
    });
  });
});
