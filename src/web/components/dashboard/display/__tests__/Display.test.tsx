/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {fireEvent, render, screen} from 'web/testing';
import Display from 'web/components/dashboard/display/Display';

const ThrowError = () => {
  throw new Error('something went wrong');
};

describe('Display component tests', () => {
  test('should render the title and children', () => {
    render(
      <Display title="Chart title">
        <span>Chart content</span>
      </Display>,
    );

    expect(screen.getByText('Chart title')).toBeInTheDocument();
    expect(screen.getByText('Chart content')).toBeInTheDocument();
    expect(screen.getByTestId('close-button')).toHaveAttribute(
      'title',
      'Remove',
    );
  });

  test('should call the remove handler', () => {
    const onRemoveClick = testing.fn();
    render(<Display onRemoveClick={onRemoveClick} />);

    fireEvent.click(screen.getByTestId('close-button'));

    expect(onRemoveClick).toHaveBeenCalled();
  });

  test('should render the loading overlay when loading', () => {
    render(<Display isLoading={true} />);

    expect(screen.getByTestId('loading')).toBeVisible();
  });

  test('should render the chart error message when a child throws', () => {
    testing.spyOn(console, 'error').mockImplementation(() => {});
    try {
      render(
        <Display>
          <ThrowError />
        </Display>,
      );
    } finally {
      testing.restoreAllMocks();
    }

    expect(screen.getByTestId('error-message')).toHaveTextContent(
      'An error occurred in this chart.',
    );
  });

  test('should forward the drag handle ref', () => {
    const dragHandleRef = testing.fn();
    render(<Display dragHandleRef={dragHandleRef} />);

    expect(dragHandleRef).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
