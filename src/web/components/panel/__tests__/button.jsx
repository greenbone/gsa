/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent} from 'web/utils/testing';

import Button from '../button';

describe('InfoPanel button tests', () => {
  test('should render', () => {
    const {element} = render(<Button />);

    expect(element).toMatchSnapshot();
  });

  test('should call click handler', () => {
    const handler = testing.fn();

    const {element} = render(<Button onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should render children', () => {
    const {element} = render(<Button>bar</Button>);

    expect(element).toHaveTextContent('bar');
  });
});

// vim: set ts=2 sw=2 tw=80:
