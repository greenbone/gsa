/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import HoverCard from 'web/components/hover-card/HoverCard';

describe('HoverCard tests', () => {
  test('should render HoverCard with default aria-label', () => {
    render(<HoverCard>Test content</HoverCard>);

    expect(screen.getByLabelText('More information')).toBeInTheDocument();
  });

  test('should render with custom aria-label', () => {
    render(<HoverCard ariaLabel="Custom help text">Test content</HoverCard>);

    expect(screen.getByLabelText('Custom help text')).toBeInTheDocument();
  });

  test('should apply custom data-testid to wrapper', () => {
    render(<HoverCard dataTestId="custom-info">Test content</HoverCard>);

    const wrapper = screen.getByTestId('custom-info');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.tagName).toBe('SECTION');
  });

  test('should render with children content', () => {
    render(<HoverCard>Test content</HoverCard>);

    expect(screen.getByLabelText('More information')).toBeInTheDocument();
  });

  test('should render multiline content', () => {
    render(
      <HoverCard>
        Line 1{'\n'}Line 2{'\n'}Line 3
      </HoverCard>,
    );

    expect(screen.getByLabelText('More information')).toBeInTheDocument();
  });

  test('should render as a section element', () => {
    render(<HoverCard>Test content</HoverCard>);

    const section = screen.getByLabelText('More information');
    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe('SECTION');
  });
});
