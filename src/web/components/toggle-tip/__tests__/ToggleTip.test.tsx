/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import ToggleTip from 'web/components/toggle-tip/ToggleTip';

describe('ToggleTip tests', () => {
  test('should render with default aria-label and correct initial state', () => {
    render(<ToggleTip id="test-tip">Test content</ToggleTip>);

    const button = screen.getByRole('button', {name: 'More information'});
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-controls', 'test-tip');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    const content = screen.getByText('Test content');
    expect(content).not.toBeVisible();
  });

  test('should toggle content visibility on button click and update aria-expanded', () => {
    render(
      <ToggleTip ariaLabel="Help info" id="test-tip">
        Test content
      </ToggleTip>,
    );

    const button = screen.getByRole('button', {name: 'Help info'});
    const content = screen.getByText('Test content');

    // Initially closed
    expect(content).not.toBeVisible();
    expect(button).toHaveAttribute('aria-expanded', 'false');

    // Open
    fireEvent.click(button);
    expect(content).toBeVisible();
    expect(button).toHaveAttribute('aria-expanded', 'true');

    // Close
    fireEvent.click(button);
    expect(content).not.toBeVisible();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('should close when Escape key is pressed', () => {
    render(
      <ToggleTip ariaLabel="Help info" id="test-tip">
        Test content
      </ToggleTip>,
    );

    const button = screen.getByRole('button', {name: 'Help info'});
    fireEvent.click(button);

    const content = screen.getByText('Test content');
    expect(content).toBeVisible();

    const contentParent = content.parentElement;
    if (!contentParent) {
      throw new Error('toggletip content container not found');
    }
    fireEvent.keyDown(contentParent, {key: 'Escape'});

    expect(content).not.toBeVisible();
  });

  test('should close when backdrop is clicked', () => {
    render(
      <ToggleTip ariaLabel="Help info" id="test-tip">
        Test content
      </ToggleTip>,
    );

    const button = screen.getByRole('button', {name: 'Help info'});
    fireEvent.click(button);

    const content = screen.getByText('Test content');
    expect(content).toBeVisible();

    // Click outside (using mousedown on document body)
    fireEvent.mouseDown(document.body);

    expect(content).not.toBeVisible();
  });

  test('should render multiline content with proper whitespace', () => {
    render(
      <ToggleTip ariaLabel="Help info" id="test-tip">
        Line 1{'\n'}Line 2{'\n'}Line 3
      </ToggleTip>,
    );

    const button = screen.getByRole('button', {name: 'Help info'});
    fireEvent.click(button);

    const contentElement = screen.getByText(/Line 1/);
    expect(contentElement).toBeInTheDocument();
    expect(contentElement).toHaveStyle('white-space: pre-wrap');
  });

  test.each([
    ['top', {bottom: '100%', left: '0'}],
    ['bottom', {top: '100%', left: '0'}],
    ['left', {right: '100%', top: '0'}],
    ['right', {left: '100%', top: '0'}],
  ])(
    'should position content correctly for position %s',
    (position, expectedStyles) => {
      render(
        <ToggleTip
          ariaLabel="Help info"
          id="test-tip"
          position={position as 'top' | 'bottom' | 'left' | 'right'}
        >
          Test content
        </ToggleTip>,
      );

      const button = screen.getByRole('button', {name: 'Help info'});
      fireEvent.click(button);

      const content = screen.getByText('Test content');
      expect(content).toHaveStyle(expectedStyles);
    },
  );

  test('should apply custom data-testid when provided', () => {
    render(
      <ToggleTip
        ariaLabel="Help info"
        dataTestId="custom-toggletip"
        id="test-tip"
      >
        Test content
      </ToggleTip>,
    );

    const container = screen.getByTestId('custom-toggletip');
    expect(container).toBeInTheDocument();
  });

  test('should not close when clicking on a related element', () => {
    const relatedRef = {current: null as HTMLDivElement | null};

    render(
      <>
        <div ref={el => (relatedRef.current = el)}>
          <input data-testid="related-input" type="text" />
        </div>
        <ToggleTip
          ariaLabel="Help info"
          id="test-tip"
          relatedRefs={[relatedRef]}
        >
          Test content
        </ToggleTip>
      </>,
    );

    const button = screen.getByRole('button', {name: 'Help info'});
    fireEvent.click(button);

    const content = screen.getByText('Test content');
    expect(content).toBeVisible();

    // Click on the related input
    const relatedInput = screen.getByTestId('related-input');
    fireEvent.click(relatedInput);

    // Toggletip should still be visible
    expect(content).toBeVisible();

    // Click outside both the toggletip and related element
    fireEvent.mouseDown(document.body);

    // Now it should close
    expect(content).not.toBeVisible();
  });
});
