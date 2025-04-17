/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {LucideIcon} from 'lucide-react';
import React from 'react';
import DynamicIcon from 'web/components/icon/DynamicIcon';
import {render, screen, fireEvent} from 'web/utils/Testing';

const MockIcon: LucideIcon = React.forwardRef((props, ref) => (
  <svg {...props} ref={ref} data-testid="mock-icon" />
));

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
    expect(staticIcon).toBeInTheDocument();
    expect(staticIcon.querySelector('svg')).toBeInTheDocument();
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
    expect(dynamicIcon).toBeInTheDocument();
    expect(dynamicIcon.querySelector('svg')).toBeInTheDocument();
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

  test('applies correct size and color', () => {
    render(
      <DynamicIcon
        color="red"
        dataTestId="sized-icon"
        icon={MockIcon}
        size="large"
      />,
    );
    const dynamicIcon = screen.getByTestId('sized-icon');
    expect(dynamicIcon).toHaveStyle({color: 'rgb(255, 0, 0)'});
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
});
