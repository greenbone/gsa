/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {render} from 'web/utils/testing';

import Comment from '../comment';

describe('Comment tests', () => {
  test('should render children', () => {
    const {element} = render(<Comment>Hello World</Comment>);

    expect(element).toHaveTextContent('Hello World');
  });

  test('should render comment with text', () => {
    const {element} = render(
      <Comment text="Hello World">Should not be rendered</Comment>,
    );

    expect(element).toHaveTextContent('Hello World');
  });
});
