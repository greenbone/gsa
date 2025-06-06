/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {within, screen, render} from 'web/testing';
import {createIconComponents} from 'web/components/icon/createIconComponents';

const MockIcon = props => <svg {...props} data-testid="mock-icon" />;

describe('createIconComponents', () => {
  describe('Lucide icon', () => {
    const lucideIconSet = [
      {
        name: 'DummyLucideIcon',
        component: MockIcon,
        dataTestId: 'dummy-lucide-icon',
        ariaLabel: 'Dummy Lucide Icon',
        isLucide: true,
      },
    ];

    test('should create static icon components with correct props', () => {
      const IconComponents = createIconComponents(lucideIconSet);
      const DummyLucideIcon = IconComponents.DummyLucideIcon;

      render(<DummyLucideIcon active={true} color="red" />);

      const iconElement = screen.getByTestId('dummy-lucide-icon');
      expect(iconElement).toHaveAttribute('aria-label', 'Dummy Lucide Icon');
      expect(iconElement).toHaveAttribute('data-testid', 'dummy-lucide-icon');
      const svgElement = within(iconElement).getByText('', {selector: 'svg'});
      expect(svgElement).toBeVisible();
      expect(iconElement).toHaveStyle('color: red(255, 0, 0)');
    });

    test('should create action icon components with default props', () => {
      const IconComponents = createIconComponents(lucideIconSet);
      const DummyLucideIcon = IconComponents.DummyLucideIcon;

      render(
        <DummyLucideIcon active={true} color="red" onClick={testing.fn()} />,
      );

      const iconElement = screen.getByTestId('dummy-lucide-icon');
      expect(iconElement).toHaveAttribute('aria-label', 'Dummy Lucide Icon');
      expect(iconElement).toHaveAttribute('data-testid', 'dummy-lucide-icon');
    });

    test('should create action icon components with custom props and disabled', () => {
      const IconComponents = createIconComponents(lucideIconSet);
      const DummyLucideIcon = IconComponents.DummyLucideIcon;

      render(
        <DummyLucideIcon
          active={false}
          color="red"
          data-testid="custom-icon"
        />,
      );

      const iconElement = screen.getByTestId('custom-icon');
      expect(iconElement).toHaveAttribute('aria-label', 'Dummy Lucide Icon');
      expect(iconElement).toHaveAttribute('data-testid', 'custom-icon');
      expect(iconElement).toHaveStyle('color: GrayText');
    });
  });

  describe('Non-Lucide icon', () => {
    const svgIconDefinitions = [
      {
        name: 'DummyLucideIcon',
        component: MockIcon,
        dataTestId: 'dummy-lucide-icon',
        ariaLabel: 'Dummy Lucide Icon',
        isLucide: false,
      },
    ];
    test('should create static icon components with correct props', () => {
      const IconComponents = createIconComponents(svgIconDefinitions);
      const DummyLucideIcon = IconComponents.DummyLucideIcon;

      render(<DummyLucideIcon active={true} color="red" />);

      const iconElement = screen.getByTestId('dummy-lucide-icon');
      expect(iconElement).toHaveAttribute('aria-label', 'Dummy Lucide Icon');
      expect(iconElement).toHaveAttribute('data-testid', 'dummy-lucide-icon');
      const svgElement = within(iconElement).getByText('', {selector: 'svg'});
      expect(svgElement).toHaveStyle('fill:red');
    });

    test('should create action icon components with default props', () => {
      const IconComponents = createIconComponents(svgIconDefinitions);
      const DummyLucideIcon = IconComponents.DummyLucideIcon;

      render(
        <DummyLucideIcon active={true} color="red" onClick={testing.fn()} />,
      );

      const iconElement = screen.getByTestId('dummy-lucide-icon');
      expect(iconElement).toHaveAttribute('aria-label', 'Dummy Lucide Icon');
      expect(iconElement).toHaveAttribute('data-testid', 'dummy-lucide-icon');
    });

    test('should create action icon components with custom props and disabled', () => {
      const IconComponents = createIconComponents(svgIconDefinitions);
      const DummyLucideIcon = IconComponents.DummyLucideIcon;

      render(
        <DummyLucideIcon
          active={false}
          color="red"
          data-testid="custom-icon"
          onClick={testing.fn()}
        />,
      );

      const iconElement = screen.getByTestId('custom-icon');
      expect(iconElement).toHaveAttribute('aria-label', 'Dummy Lucide Icon');
      expect(iconElement).toHaveAttribute('data-testid', 'custom-icon');
      expect(iconElement).toHaveStyle('color: GrayText');
    });
  });
});
