/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import Button from '../button';

describe('Button tests', () => {
  test('should call click handler', () => {
    const handler = testing.fn();

    const {element} = render(<Button onClick={handler} />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalled();
  });

  test('should call click handler with value', () => {
    const handler = testing.fn();

    const {element} = render(<Button onClick={handler} value="bar" />);

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', undefined);
  });

  test('should call click handler with value and name', () => {
    const handler = testing.fn();

    const {element} = render(
      <Button name="foo" value="bar" onClick={handler} />,
    );

    fireEvent.click(element);

    expect(handler).toHaveBeenCalledWith('bar', 'foo');
  });

  test('should render button', () => {
    const {element} = render(<Button />);

    expect(element).toMatchSnapshot();
  });

  test('should render title', () => {
    const {element} = render(<Button title="foo" />);

    expect(element).toHaveAttribute('title', 'foo');
    expect(element).toHaveTextContent('foo');
  });

  test('should render title and children', () => {
    const {element} = render(<Button title="foo">bar</Button>);

    expect(element).toHaveAttribute('title', 'foo');
    expect(element).toHaveTextContent('bar');
  });
});

// vim: set ts=2 sw=2 tw=80:
