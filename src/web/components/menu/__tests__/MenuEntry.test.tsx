/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, rendererWith, screen, fireEvent} from 'web/testing';
import MenuEntry from 'web/components/menu/MenuEntry';

describe('MenuEntry', () => {
  test('should render title', () => {
    render(<MenuEntry title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('should render a link when "to" is defined', () => {
    const {render} = rendererWith();
    render(<MenuEntry title="Test Title" to="/test-path" />);
    const link = screen.getByRole('link', {name: 'Test Title'});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test-path');
  });

  test('should call onClick with value and name when clicked', () => {
    const handleClick = testing.fn();
    render(
      <MenuEntry
        name="testName"
        title="Test Title"
        value="testValue"
        onClick={handleClick}
      />,
    );

    const element = screen.getByText('Test Title');
    fireEvent.click(element);

    expect(handleClick).toHaveBeenCalledWith('testValue', 'testName');
  });

  test('should render children when provided', () => {
    render(
      <MenuEntry>
        <span>Child Content</span>
      </MenuEntry>,
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
