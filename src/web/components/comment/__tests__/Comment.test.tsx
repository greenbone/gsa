/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render, screen} from 'web/testing';
import Comment from 'web/components/comment/Comment';

describe('Comment tests', () => {
  test('should render children when no text is given', () => {
    render(<Comment>Hello World</Comment>);

    expect(screen.getByTestId('comment')).toHaveTextContent('Hello World');
  });

  test('should render the text and ignore children when text is given', () => {
    render(<Comment text="Hello World">Should not be rendered</Comment>);

    expect(screen.getByTestId('comment')).toHaveTextContent('Hello World');
    expect(screen.getByTestId('comment')).not.toHaveTextContent(
      'Should not be rendered',
    );
  });

  test('should apply the comment class', () => {
    render(<Comment>content</Comment>);

    expect(screen.getByTestId('comment')).toHaveClass('comment');
  });
});
